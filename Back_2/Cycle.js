const mongoose = require('mongoose');
// 데이터베이스 및 컬렉션 이름 설정
// const dbName = 'batteryDB';
// const collectionName = 'batteryData';

// 셀 전압 기준값 설정
const CELL_VOLTAGE_THRESHOLD = 4.2;

// MongoDB 연결 및 데이터 처리 함수
async function processBatteryData() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // MongoDB 클라이언트 연결
        await client.connect();
        console.log('MongoDB에 성공적으로 연결되었습니다.');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // 배터리 데이터 가져오기 (가장 최근 데이터)
        const batteryData = await collection.findOne({}, { sort: { _id: -1 } });

        if (!batteryData) {
            console.log('배터리 데이터를 찾을 수 없습니다.');
            return;
        }

        console.log('가져온 배터리 데이터:', batteryData);

        const { cellVoltage, cumulativeUsage, cycleCount } = batteryData;

        // 셀 전압이 기준값과 일치하는지 확인
        if (cellVoltage === CELL_VOLTAGE_THRESHOLD) {
            // 누적 사용량의 절대값이 기준값 이상인지 확인
            if (Math.abs(cumulativeUsage) >= CELL_VOLTAGE_THRESHOLD) {
                const newCycleCount = cycleCount + 1;

                // 사이클 카운트 업데이트
                const updateResult = await collection.updateOne(
                    { _id: batteryData._id },
                    { $set: { cycleCount: newCycleCount }, $inc: { cumulativeUsage: -CELL_VOLTAGE_THRESHOLD } }
                );

                if (updateResult.modifiedCount === 1) {
                    console.log(`사이클 카운트가 ${newCycleCount}으로 업데이트되었습니다.`);
                } else {
                    console.log('사이클 카운트 업데이트에 실패했습니다.');
                }
            } else {
                console.log('누적 사용량이 기준값에 도달하지 않았습니다.');
            }
        } else {
            console.log('셀 전압이 기준값과 일치하지 않습니다.');
        }
    } catch (error) {
        console.error('오류 발생:', error);
    } finally {
        // 클라이언트 연결 종료
        await client.close();
        console.log('MongoDB 연결이 종료되었습니다.');
    }
}

// 메인 함수 실행
processBatteryData();
module.exports = { processBatteryData };
