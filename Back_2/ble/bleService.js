noble.on('discover', async (peripheral) => {
    console.log(`Discovered device: ${peripheral.address}`);

    // 연결 시도 횟수 제한
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
        try {
            console.log(`Attempting to connect to ${peripheral.address}, Attempt: ${retryCount + 1}`);
            await peripheral.connectAsync();
            const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([], []);
            const txCharacteristic = characteristics.find(char => char.uuid === 'TX_CHARACTERISTIC_UUID');

            if (txCharacteristic) {
                await txCharacteristic.subscribeAsync();
                txCharacteristic.on('data', async (data) => {
                    const parsedData = parseBmsData(data);
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

            // 재시도 횟수 초과 시 연결 포기
            if (retryCount >= maxRetries) {
                console.log(`Failed to connect to device ${peripheral.address} after ${maxRetries} attempts.`);
                return;
            }
        }
    }
});
