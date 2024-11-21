const noble = require('@abandonware/noble');
const { saveLastStatus, saveLowData, saveHourPerData } = require('./database/mongoService');
const { parseBmsData } = require('./utils/parser'); // 함수 가져오기
const { connectToMongoDB } = require('./database/mongoService');

// MongoDB 연결
connectToMongoDB();

// BLE 장치 탐색 및 연결
noble.on('stateChange', async (state) => {
    if (state === 'poweredOn') {
        await noble.startScanningAsync(['6e400001b5a3f393e0a9e50e24dcca9e'], false);
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

            // 특정 서비스 및 특성 검색
            const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
                ['6e400001b5a3f393e0a9e50e24dcca9e'], // Service UUID
                ['6e400003b5a3f393e0a9e50e24dcca9e']  // TX Characteristic UUID
            );

            const txCharacteristic = characteristics.find(char => char.uuid === '6e400003b5a3f393e0a9e50e24dcca9e');

            if (txCharacteristic) {
                await txCharacteristic.subscribeAsync();
                txCharacteristic.on('data', async (data) => {
                    console.log(`Received raw data: ${data.toString('hex')}`);

                    // 데이터를 파싱하여 처리
                    const parsedData = parseBmsData(data);
                    console.log('Parsed Data:', parsedData);

                    // 파싱된 데이터를 데이터베이스에 저장 (선택 사항)
                    await saveLastStatus(parsedData);
                    await saveLowData(parsedData);
                    await saveHourPerData(parsedData);
                });
            }

            // 연결에 성공했으면 루프 종료
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
