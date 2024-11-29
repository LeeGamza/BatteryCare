const noble = require('@abandonware/noble');
const express = require('express');
const os = require('os');
const { saveData, connectToMongoDB, saveCycleAndImbalance, saveLastStatus } = require('./database/mongoService');
const { parseBmsData } = require('./utils/parser');
const { calculateCycle, detectImbalance } = require('./utils/cycleCalculator'); // 중복 제거
const { LastStatus, LowData } = require('./database/schemas');

const app = express();
const PORT = 3000; // Express 서버 포트 번호

// MongoDB 연결
connectToMongoDB();

// 전역 변수 선언
global.rxCharacteristic = null;
let peripheralDevice = null;

// BLE 데이터 수집 부분
let lastProcessedTimestamp = 0;

noble.on('stateChange', async (state) => {
    if (state === 'poweredOn') {
        console.log('Starting BLE scanning...');
        await noble.startScanningAsync(['6e400001b5a3f393e0a9e50e24dcca9e'], false);
    } else {
        console.log(`BLE state changed to ${state}, stopping scanning.`);
        await noble.stopScanningAsync();
    }
});

noble.on('discover', async (peripheral) => {
    console.log(`Discovered device: ${peripheral.address}`);

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
        try {
            console.log(`Attempting to connect to ${peripheral.address}, Attempt: ${retryCount + 1}`);
            await peripheral.connectAsync();

            const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
                ['6e400001b5a3f393e0a9e50e24dcca9e'], // Service UUID
                ['6e400002b5a3f393e0a9e50e24dcca9e', '6e400003b5a3f393e0a9e50e24dcca9e']  // RX and TX Characteristic UUIDs
            );

            const txCharacteristic = characteristics.find(char => char.uuid === '6e400003b5a3f393e0a9e50e24dcca9e');
            rxCharacteristic = characteristics.find(char => char.uuid === '6e400002b5a3f393e0a9e50e24dcca9e');

            if (txCharacteristic && rxCharacteristic) {
                console.log('TX and RX Characteristics found. Ready to send commands.');
                peripheralDevice = peripheral; // 전역 변수에 연결된 장치를 저장
                await txCharacteristic.subscribeAsync();

                // 수신 데이터 처리 (TX characteristic)
                txCharacteristic.on('data', async (data) => {
                    try {
                        const currentTimestamp = Date.now(); // 현재 타임스탬프 (밀리초)

                        // 1초 단위로 필터링
                        if (currentTimestamp - lastProcessedTimestamp >= 1000) {
                            lastProcessedTimestamp = currentTimestamp;

                            console.log(`Received raw data: ${data.toString('hex')}`);
                            const parsedData = parseBmsData(data);
                            console.log('Parsed Data:', parsedData);

                            // **셀 불균형 감지**
                            const imbalanceDetected = detectImbalance(parsedData.cellVoltages);
                            if (imbalanceDetected) {
                                console.warn('Cell imbalance detected!');
                            } else {
                                console.log('Cell voltages are balanced.');
                            }

                            // 사이클 계산
                            const cycleCount = calculateCycle(parsedData);

                            // 데이터 저장
                            await saveData(parsedData); // 시간별 및 최신 데이터 저장
                            await saveCycleAndImbalance(cycleCount, parsedData); // 사이클 수와 불균형 상태 저장
                        } else {
                            console.log('Skipping data to maintain 1-second interval.');
                        }
                    } catch (error) {
                        console.error('Error processing data:', error.message);
                        console.log(`Data length: ${data.length}, Data: ${data.toString('hex')}`);
                    }
                });
            } else {
                console.error('RX or TX Characteristic not found.');
            }
            break; // 연결 성공 시 루프 종료
        } catch (error) {
            console.error(`Error connecting to device ${peripheral.address}:`, error);
            retryCount++;
            if (retryCount >= maxRetries) {
                console.log(`Failed to connect to device ${peripheral.address} after ${maxRetries} attempts.`);
                return;
            }
        }
    }
});

// 자동 재연결을 위해 연결 끊김 이벤트 핸들링
app.post('/on', async (req, res) => {
    try {
        if (!rxCharacteristic) {
            console.log('Error: rxCharacteristic is undefined. BLE device might not be connected.');
            return res.status(400).json({ message: 'BLE device not connected. Please try connecting again.' });
        }

        // BLE 연결 상태 점검
        if (!rxCharacteristic._peripheral || rxCharacteristic._peripheral.state !== 'connected') {
            console.log('Error: BLE device is not in connected state. Attempting reconnection...');

            if (peripheralDevice) {
                let reconnectAttempts = 0;
                const maxReconnectAttempts = 5;

                while (reconnectAttempts < maxReconnectAttempts) {
                    try {
                        reconnectAttempts++;
                        console.log(`Reconnection attempt ${reconnectAttempts}...`);

                        if (peripheralDevice.state === 'connected') {
                            console.log('Peripheral is still marked as connected. Disconnecting...');
                            await peripheralDevice.disconnectAsync();
                        }

                        console.log('Attempting to reconnect to peripheral...');
                        await peripheralDevice.connectAsync();
                        console.log('Reconnected to BLE device successfully.');
                        break; // 재연결 성공 시 루프 종료
                    } catch (reconnectError) {
                        console.error('Reconnection attempt failed:', reconnectError.message);
                        if (reconnectAttempts >= maxReconnectAttempts) {
                            return res.status(400).json({ message: 'BLE device could not be reconnected. Please try again.' });
                        }
                    }
                }
            } else {
                return res.status(400).json({ message: 'No BLE device available to reconnect.' });
            }
        }

        console.log('Attempting to send ON command to BMS...');
        const onCommand = Buffer.from([0x01]); // BMS ON 명령

        await rxCharacteristic.writeAsync(onCommand, false);
        console.log('ON command sent successfully.');

        res.status(200).json({ message: 'BMS module turned ON.' });
    } catch (error) {
        console.error('Unhandled error while sending ON command:', error.message);
        res.status(500).json({ message: 'An error occurred while attempting to turn ON the BMS module.' });
    }
});


// Express API 서버 - BMS 제어 엔드포인트 추가
app.post('/off', async (req, res) => {
    try {
        if (!rxCharacteristic) {
            console.log('Error: rxCharacteristic is undefined. BLE device might not be connected.');
            return res.status(400).json({ message: 'BLE device not connected. Please try connecting again.' });
        }

        if (!rxCharacteristic._peripheral || rxCharacteristic._peripheral.state !== 'connected') {
            console.log('Error: BLE device is not in connected state. Attempting reconnection...');

            if (peripheralDevice) {
                let reconnectAttempts = 0;
                const maxReconnectAttempts = 5;

                while (reconnectAttempts < maxReconnectAttempts) {
                    try {
                        reconnectAttempts++;
                        console.log(`Reconnection attempt ${reconnectAttempts}...`);

                        if (peripheralDevice.state === 'connected') {
                            console.log('Peripheral is still marked as connected. Disconnecting...');
                            await peripheralDevice.disconnectAsync();
                        }

                        console.log('Attempting to reconnect to peripheral...');
                        await peripheralDevice.connectAsync();
                        console.log('Reconnected to BLE device successfully.');
                        break; // 재연결 성공 시 루프 종료
                    } catch (reconnectError) {
                        console.error('Reconnection attempt failed:', reconnectError.message);
                        if (reconnectAttempts >= maxReconnectAttempts) {
                            return res.status(400).json({ message: 'BLE device could not be reconnected. Please try again.' });
                        }
                    }
                }
            } else {
                return res.status(400).json({ message: 'No BLE device available to reconnect.' });
            }
        }

        console.log('Attempting to send OFF command to BMS...');
        const offCommand = Buffer.from([0x00]); // BMS OFF 명령

        await rxCharacteristic.writeAsync(offCommand, false);
        console.log('OFF command sent successfully.');

        res.status(200).json({ message: 'BMS module turned OFF.' });
    } catch (error) {
        console.error('Unhandled error while sending OFF command:', error.message);
        res.status(500).json({ message: 'An error occurred while attempting to turn OFF the BMS module.' });
    }
});



// 서버 실행
app.listen(PORT, () => {
    const networkInterfaces = os.networkInterfaces();
    const addresses = [];

    for (const interfaceName in networkInterfaces) {
        const interfaceInfo = networkInterfaces[interfaceName];
        for (const alias of interfaceInfo) {
            if (alias.family === 'IPv4' && !alias.internal) {
                addresses.push(alias.address);
            }
        }
    }

    console.log(`Server running on the following addresses:`);
    addresses.forEach((address) => {
        console.log(`- http://${address}:${PORT}`);
    });
    console.log(`Also available on localhost: http://localhost:${PORT}`);
});
