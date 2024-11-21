noble.on('discover', async (peripheral) => {
    console.log(`Discovered device: ${peripheral.address}`);

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
        try {
            console.log(`Attempting to connect to ${peripheral.address}, Attempt: ${retryCount + 1}`);
            await peripheral.connectAsync();

            const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([], []);
            const txCharacteristic = characteristics.find(char => char.uuid === 'TX_CHARACTERISTIC_UUID');

            if (txCharacteristic) {
                console.log('TX Characteristic found. Subscribing...');
                await txCharacteristic.subscribeAsync();
                txCharacteristic.on('data', async (data) => {
                    console.log(`Received raw data: ${data.toString('hex')}`);
                    try {
                        const parsedData = parseBmsData(data);
                        console.log('Parsed Data:', parsedData);
                        await saveLastStatus(parsedData);
                        await saveLowData(parsedData);
                        await saveHourPerData(parsedData);
                    } catch (error) {
                        console.error('Error processing data:', error);
                    }
                });
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
