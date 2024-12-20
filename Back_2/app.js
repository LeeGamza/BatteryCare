const noble = require('@abandonware/noble');
const express = require('express');
const os = require('os');
const { LastStatus, LowData } = require('./database/mongoService');
const { saveData, connectToMongoDB, saveCycleAndImbalance } = require('./database/mongoService');
const { parseBmsData } = require('./utils/parser');
const { calculateCycle, detectImbalance } = require('./utils/cycleCalculator');

const app = express();
app.use(express.json());

const PORT = 3000;

// MongoDB 연결
connectToMongoDB();

// 전역 변수 선언
global.rxCharacteristic = null;
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
                ['6e400001b5a3f393e0a9e50e24dcca9e'],
                ['6e400002b5a3f393e0a9e50e24dcca9e', '6e400003b5a3f393e0a9e50e24dcca9e']
            );

            const txCharacteristic = characteristics.find(char => char.uuid === '6e400003b5a3f393e0a9e50e24dcca9e');
            rxCharacteristic = characteristics.find(char => char.uuid === '6e400002b5a3f393e0a9e50e24dcca9e');

            if (txCharacteristic && rxCharacteristic) {
                console.log('TX and RX Characteristics found. Ready to send commands.');

                await txCharacteristic.subscribeAsync();
                txCharacteristic.on('data', async (data) => {
                    try {
                        const currentTimestamp = Date.now();
                        if (currentTimestamp - lastProcessedTimestamp >= 1000) {
                            lastProcessedTimestamp = currentTimestamp;

                            console.log(`Received raw data: ${data.toString('hex')}`);
                            const parsedData = parseBmsData(data);
                            console.log('Parsed Data:', parsedData);

                            const { cellVoltages, packVoltage } = parsedData;

                            // **조건 기반 RX 명령 전송**
                            let command = '10'; // Default command

                            const isImbalanced = detectImbalance(cellVoltages);

                            if (packVoltage < 1) {
                                console.log('Pack voltage below threshold. Sending 00 command.');
                                command = '00';
                            } else if (
                                cellVoltages.some(v => v < 3.5 || v > 4.2) ||
                                isImbalanced
                            ) {
                                console.log('Voltage out of range or imbalance detected. Sending 01 command.');
                                command = '01';
                            }

                            await sendCommand(Buffer.from(command, 'utf8'));

                            // **데이터 저장 시 임밸런스 상태 추가**
                            if (isImbalanced) {
                                parsedData.imbalanceStatus = 'Imbalanced';
                            } else {
                                parsedData.imbalanceStatus = 'Balanced';
                            }

                            const cycleCount = calculateCycle(parsedData);
                            await saveData(parsedData);
                            await saveCycleAndImbalance(cycleCount, parsedData);
                        } else {
                            // console.log('Skipping data to maintain 1-second interval.');
                        }
                    } catch (error) {
                        console.error('Error processing data:', error.message);
                    }
                });
            } else {
                console.error('RX or TX Characteristic not found.');
            }
            break;
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

async function sendCommand(command) {
    if (!rxCharacteristic) {
        console.error('RX characteristic not available. Cannot send command.');
        return;
    }

    try {
        await rxCharacteristic.writeAsync(command, false);
        console.log(`Command ${command.toString('utf8')} sent successfully.`);
    } catch (error) {
        console.error('Error sending command:', error.message);
    }
}

// 데이터 조회 API
app.get('/api/data', async (req, res) => {
    try {
        const data = await LastStatus.findOne();
        if (data) {
            res.json(data);
        } else {
            res.status(404).json({ message: 'No data found' });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/status', async (req, res) => {
    try {
        const lastStatus = await LastStatus.findOne();
        if (lastStatus) {
            res.json({
                heartbeat: lastStatus.Heartbeat,
                alarmState: lastStatus.Alarm,
            });
        } else {
            res.status(404).json({ message: 'No status data found' });
        }
    } catch (error) {
        console.error('Error fetching status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// 사이클 수 조회 API
app.get('/api/cycleCount', async (req, res) => {
    try {
        const lastStatus = await LastStatus.findOne();
        if (lastStatus) {
            res.json({ cycleCount: lastStatus.cycleCount });
        } else {
            res.status(404).json({ message: 'No cycle count found' });
        }
    } catch (error) {
        console.error('Error fetching cycle count:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 시간별 팩 전압 평균 조회 API
app.get('/api/averagePackVoltage', async (req, res) => {
    try {
        const now = new Date();
        const currentHour = now.getHours(); // 현재 시간
        const pastHours = [currentHour - 2, currentHour - 1, currentHour]; // 과거 2시간 포함 총 3시간
        const data = await LowData.find({ hour: { $in: pastHours } });

        if (!data.length) {
            return res.status(404).json({ message: 'No data found for the specified hours.' });
        }

        // 각 시간의 packVoltage 평균 계산
        const averagePackVoltage = pastHours.map(hour => {
            const hourData = data.find(doc => doc.hour === hour);

            if (!hourData || !hourData.data.length) {
                return { hour, averageVoltage: 0 };
            }

            const totalVoltage = hourData.data.reduce((sum, item) => sum + (item.packVoltage || 0), 0);
            const averageVoltage = hourData.data.length ? totalVoltage / hourData.data.length : 0;

            return { hour, averageVoltage };
        });

        res.json(averagePackVoltage);
    } catch (error) {
        console.error('Error calculating average pack voltage:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


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
