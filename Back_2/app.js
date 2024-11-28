const noble = require('@abandonware/noble');
const express = require('express');
const os = require('os');
const { saveData, connectToMongoDB } = require('./database/mongoService');
const { parseBmsData } = require('./utils/parser');
const { LastStatus, LowData } = require('./database/schemas');


const app = express();
const PORT = 3000; // Express 서버 포트 번호

// MongoDB 연결
connectToMongoDB();

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
                ['6e400003b5a3f393e0a9e50e24dcca9e']  // TX Characteristic UUID
            );

            const txCharacteristic = characteristics.find(char => char.uuid === '6e400003b5a3f393e0a9e50e24dcca9e');

            if (txCharacteristic) {
                console.log('TX Characteristic found. Subscribing...');
                await txCharacteristic.subscribeAsync();

                txCharacteristic.on('data', async (data) => {
                    try {
                        const currentTimestamp = Date.now(); // 현재 타임스탬프 (밀리초)

                        // 1초 단위로 필터링
                        if (currentTimestamp - lastProcessedTimestamp >= 1000) {
                            lastProcessedTimestamp = currentTimestamp;

                            console.log(`Received raw data: ${data.toString('hex')}`);
                            const parsedData = parseBmsData(data);
                            console.log('Parsed Data:', parsedData);
                            await saveData(parsedData);
                        } else {
                            console.log('Skipping data to maintain 1-second interval.');
                        }
                    } catch (error) {
                        console.error('Error processing data:', error.message);
                        console.log(`Data length: ${data.length}, Data: ${data.toString('hex')}`);
                    }
                });
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

// Express API 서버
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
