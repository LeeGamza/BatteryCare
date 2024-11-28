const noble = require('@abandonware/noble');
<<<<<<< Updated upstream
const { saveData, connectToMongoDB } = require('./database/mongoService');
const { parseBmsData } = require('./utils/parser');
=======
const express = require('express');
const { saveLowData, connectToMongoDB, saveCycleAndImbalance } = require('./database/mongoService');
const { parseBmsData } = require('./utils/parser');
const { calculateCycle } = require('./utils/cycleCalculator');

const app = express();
const PORT = 3000; // Express 서버 포트 번호
>>>>>>> Stashed changes

// MongoDB 연결
connectToMongoDB();

<<<<<<< Updated upstream
// 마지막으로 처리된 데이터 타임스탬프
let lastProcessedTimestamp = 0;

=======
>>>>>>> Stashed changes
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

    while (true) {
        try {
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
                        const parsedData = parseBmsData(data);

                        // 사이클 계산
                        const cycleCount = calculateCycle(parsedData);

                        // 데이터 저장
                        await saveLowData(parsedData);
                        await saveCycleAndImbalance(cycleCount, parsedData);
                    } catch (error) {
                        console.error('Error processing data:', error.message);
                    }
                });
            }

            break;
        } catch (error) {
            console.error(`Error connecting to device ${peripheral.address}:`, error);
        }
    }
});
<<<<<<< Updated upstream
=======

app.get('/api/cycleCount', async (req, res) => {
    try {
        const lastStatus = await LastStatus.findOne();
        if (lastStatus) {
            res.json({ cycleCount: lastStatus.cycleCount });
        } else {
            res.status(404).json({ message: 'No data found' });
        }
    } catch (error) {
        console.error('Error fetching cycle count:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
>>>>>>> Stashed changes
