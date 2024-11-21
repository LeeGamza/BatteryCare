const noble = require('@abandonware/noble');
const { saveLastStatus, saveLowData, saveHourPerData } = require('../database/mongoService');
const { parseBmsData } = require('../utils/parser');

noble.on('stateChange', async (state) => {
    if (state === 'poweredOn') {
        await noble.startScanningAsync([], false);
    }
});

noble.on('discover', async (peripheral) => {
    try {
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
    } catch (error) {
        console.error('Error in BLE operation:', error);
    }
});
