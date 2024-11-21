const mongoose = require('mongoose');
const { LowData, LastStatus } = require('./schemas');

const MONGO_URI = 'mongodb+srv://admin:admin@cluster0.6m1uhwl.mongodb.net/';

async function connectToMongoDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

// 가장 최신 데이터를 LastStatus에 저장
async function saveLastStatus(parsedData) {
    try {
        await LastStatus.deleteMany(); // 기존 데이터를 삭제
        const lastStatus = new LastStatus(parsedData);
        await lastStatus.save();
        console.log('Updated LastStatus:', lastStatus);
    } catch (error) {
        console.error('Error saving LastStatus:', error);
    }
}

// 이전 데이터를 LowData에 시간별로 저장
async function saveLowData(parsedData) {
    try {
        const currentHour = new Date().getHours();

        // 현재 시간의 LowData 문서를 찾거나 생성
        let lowData = await LowData.findOne({ hour: currentHour });
        if (!lowData) {
            console.log(`Creating new LowData document for hour: ${currentHour}`);
            lowData = new LowData({ hour: currentHour, data: [] });
        }

        // 새로운 데이터를 추가
        lowData.data.push(parsedData);
        await lowData.save();
        console.log(`Updated LowData for hour: ${currentHour}`);
    } catch (error) {
        console.error('Error saving LowData:', error);
    }
}

// 데이터 저장: LastStatus와 LowData에 각각 저장
async function saveData(parsedData) {
    await saveLastStatus(parsedData); // 가장 최신 데이터 저장
    await saveLowData(parsedData);   // 시간별 데이터 저장
}

module.exports = { connectToMongoDB, saveData };
