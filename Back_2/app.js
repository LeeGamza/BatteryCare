const noble = require('@abandonware/noble');
const mongoose = require('mongoose');

// MongoDB Atlas URI
const MONGO_URI = 'mongodb+srv://ljh20230379:h3140910!!@test.nowvb.mongodb.net/';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Atlas 연결 성공!'))
    .catch((err) => console.error('MongoDB Atlas 연결 실패:', err));

// MongoDB 컬렉션 직접 삽입용
const db = mongoose.connection;

// BLE 장치 스캔을 위한 서비스 및 캐릭터리스틱 UUID
const SERVICE_UUID = '6e400001b5a3f393e0a9e50e24dcca9e';
const TX_CHARACTERISTIC_UUID = '6e400003b5a3f393e0a9e50e24dcca9e';
const RX_CHARACTERISTIC_UUID = '6e400002b5a3f393e0a9e50e24dcca9e';

let txCharacteristic = null; // TX 캐릭터리스틱 참조

// BLE 상태 변경 이벤트
noble.on('stateChange', async (state) => {
    console.log(`State changed to: ${state}`);

    if (state === 'poweredOn') {
        console.log('Starting scanning...');
        await noble.startScanningAsync([SERVICE_UUID], false);
    } else {
        console.log('BLE state not powered on.');
    }
});

// BLE 장치 발견 이벤트
noble.on('discover', async (peripheral) => {
    console.log('Device discovered! Stopping scan...');
    await noble.stopScanningAsync();
    console.log(`Device name: ${peripheral.advertisement.localName || 'Unknown'}`);
    console.log(`Device address: ${peripheral.address}`);

    try {
        console.log('Connecting to device...');
        await peripheral.connectAsync();
        console.log('Connected to device!');

        console.log('Discovering services and characteristics...');
        const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
            [SERVICE_UUID],
            []
        );

        console.log('Services and characteristics discovered!');

        // TX 캐릭터리스틱 찾기
        txCharacteristic = characteristics.find(
            (char) => char.uuid.toLowerCase().replace(/-/g, '') === TX_CHARACTERISTIC_UUID
        );

        if (!txCharacteristic) {
            console.error('TX characteristic not found.');
            throw new Error('TX characteristic not found.');
        }

        // RX 캐릭터리스틱 찾기 및 활성화 명령 전송
        const rxCharacteristic = characteristics.find(
            (char) => char.uuid.toLowerCase().replace(/-/g, '') === RX_CHARACTERISTIC_UUID
        );

        if (rxCharacteristic) {
            console.log('RX characteristic found! Sending activation command...');
            const activationCommand = Buffer.from('start', 'utf8'); // BLE 장치 요구 명령 형식
            await rxCharacteristic.writeAsync(activationCommand, false);
            console.log('Activation command sent to RX characteristic!');
        }

        console.log('Enabling notifications on TX characteristic...');
        txCharacteristic.on('data', (data) => {
            console.log(`Raw data received: ${data.toString('hex')}`);

            if (data.length !== 16) {
                console.error(`Invalid data length: ${data.length}. Expected 16 bytes.`);
                return; // 잘못된 데이터는 무시
            }

            try {
                const parsedData = parseBmsData(data);
                console.log('Parsed data:', parsedData);

                // MongoDB에 저장
                db.collection('bms_data').insertOne({ parsedData, timestamp: new Date() })
                    .then(() => console.log('Parsed data 저장 성공:', parsedData))
                    .catch((err) => console.error('Parsed data 저장 실패:', err.message));
            } catch (err) {
                console.error('Data parsing failed:', err.message);
            }
        });

        await txCharacteristic.subscribeAsync();
        console.log('Notifications enabled! Waiting for data...');

        // TX 명령 반복 전송
        setInterval(() => {
            sendTxCommand(); // 주기적으로 TX 명령 전송
        }, 5000);

        // 30초 동안 데이터 수신 대기
        setTimeout(() => {
            console.log('Disconnecting from device...');
            peripheral.disconnectAsync().then(() => {
                console.log('Disconnected from device.');
                process.exit(0);
            });
        }, 30000);

    } catch (error) {
        console.error('Error during BLE operation:', error);
    }
});

// TX 명령 전송 함수
function sendTxCommand() {
    if (txCharacteristic) {
        const command = Buffer.from([0x01, 0x02]); // BLE 장치 요구 명령 형식
        console.log('Sending TX command (hex):', command.toString('hex'));
        txCharacteristic.write(command, false, (err) => {
            if (err) {
                console.error('Failed to write to TX characteristic:', err.message);
            } else {
                console.log('TX command sent successfully');
            }
        });
    } else {
        console.error('TX characteristic is not initialized.');
    }
}

// 헥사 데이터를 파싱하여 사람이 읽을 수 있는 데이터로 변환
function parseBmsData(data) {
    return {
        cellVoltages: [
            data.readUInt16BE(0) / 1000,
            data.readUInt16BE(2) / 1000,
            data.readUInt16BE(4) / 1000,
            data.readUInt16BE(6) / 1000,
        ],
        packVoltage: data.readUInt16BE(8) / 1000,
        temperature: data.readInt16BE(10) / 100,
        current: data.readInt16BE(12) / 100,
        chargeRelay: data.readUInt8(14) === 1,
        dischargeRelay: data.readUInt8(15) === 1,
    };
}
