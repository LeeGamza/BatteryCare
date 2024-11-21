const { connectToMongoDB } = require('./database/mongoService');
const { LastStatus, LowData } = require('./database/schemas');

// 한국 시간으로 변환하는 함수
const getKoreanTimeString = () => {
    return new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
};

async function updateTimestamps() {
    await connectToMongoDB();

    try {
        // LastStatus 업데이트
        const lastStatuses = await LastStatus.find({});
        for (const doc of lastStatuses) {
            doc.timestamp = getKoreanTimeString();
            await doc.save();
        }
        console.log('Updated LastStatus timestamps.');

        // LowData 업데이트
        const lowDataDocs = await LowData.find({});
        for (const doc of lowDataDocs) {
            for (const hourData of doc.hourperdata) {
                hourData.data = hourData.data.map(item => ({
                    ...item,
                    timestamp: getKoreanTimeString(),
                }));
            }
            await doc.save();
        }
        console.log('Updated LowData timestamps.');
    } catch (error) {
        console.error('Error updating timestamps:', error);
    }
}

updateTimestamps().then(() => {
    console.log('Timestamp update complete.');
    process.exit();
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
