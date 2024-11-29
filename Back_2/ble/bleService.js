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
            const rxCharacteristic = characteristics.find(char => char.uuid === '6e400002b5a3f393e0a9e50e24dcca9e');

            if (txCharacteristic && rxCharacteristic) {
                console.log('TX and RX Characteristics found. Subscribing and ready to send commands.');
                await txCharacteristic.subscribeAsync();

                // 터미널 입력 처리를 위한 readline 설정
                const readline = require('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                rl.on('line', async (input) => {
                    if (input.trim().toLowerCase() === 'on') {
                        try {
                            const onCommand = Buffer.from([0x01]); // BMS ON 명령
                            await rxCharacteristic.writeAsync(onCommand, false);
                            console.log('BMS module turned ON.');
                        } catch (error) {
                            console.error('Error sending ON command:', error.message);
                        }
                    } else if (input.trim().toLowerCase() === 'off') {
                        try {
                            const offCommand = Buffer.from([0x00]); // BMS OFF 명령
                            await rxCharacteristic.writeAsync(offCommand, false);
                            console.log('BMS module turned OFF.');
                        } catch (error) {
                            console.error('Error sending OFF command:', error.message);
                        }
                    } else {
                        console.log('Unknown command. Please type "on" or "off".');
                    }
                });

                // 수신 데이터 처리 (TX characteristic)
                txCharacteristic.on('data', async (data) => {
                    try {
                        console.log(`Received raw data: ${data.toString('hex')}`);
                        const parsedData = parseBmsData(data);

                        if (parsedData) {
                            console.log('Parsed Data:', parsedData);

                            // 불균형 상태 확인
                            const deltaV = Math.max(...parsedData.cellVoltages) - Math.min(...parsedData.cellVoltages);
                            if (deltaV > 0.1) {
                                console.warn(`Cell imbalance detected: ΔV = ${deltaV.toFixed(3)}V`);
                            }

                            // 데이터베이스에 저장
                            await saveLastStatus(parsedData);
                            console.log('Updated LastStatus:', parsedData);
                        } else {
                            console.error('Parsed data is null or undefined.');
                        }
                    } catch (error) {
                        console.error('Error processing data:', error.message);
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
