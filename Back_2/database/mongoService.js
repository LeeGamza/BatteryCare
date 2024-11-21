const mongoose = require('mongoose');
const { LastStatus, LowData } = require('./schemas');

const MONGO_URI = 'mongodb+srv://ljh20230379:h3140910!!@test.nowvb.mongodb.net/?retryWrites=true&w=majority&appName=test';

async function connectToMongoDB() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

async function saveLastStatus(parsedData) {
    const lastStatus = new LastStatus(parsedData);
    await lastStatus.save();
}

async function saveLowData(parsedData) {
    const lowData = new LowData(parsedData);
    await lowData.save();
}

async function saveHourPerData(parsedData) {
    const currentHour = new Date().getHours();
    const lowData = await LowData.findOne({ 'hourperdata.hour': currentHour });

    if (lowData) {
        lowData.hourperdata[0].data.push(parsedData);
        await lowData.save();
    } else {
        const newLowData = new LowData({
            hourperdata: [{
                hour: currentHour,
                data: [parsedData],
            }],
        });
        await newLowData.save();
    }
}

module.exports = { connectToMongoDB, saveLastStatus, saveLowData, saveHourPerData };
