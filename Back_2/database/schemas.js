const mongoose = require('mongoose');

// 한국 시간으로 변환하는 함수
const getKoreanTimeString = () => {
    return new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
};

// 공통 데이터 스키마
const dataSchema = new mongoose.Schema({
    cellVoltages: [Number],
    packVoltage: Number,
    temperature: Number,
    current: Number,
    chargeRelay: Boolean,
    dischargeRelay: Boolean,
    timestamp: {
        type: String,
        default: getKoreanTimeString
    },
});

// 시간별 LowData 스키마
const lowDataSchema = new mongoose.Schema({
    hour: Number, // 해당 시간 (0 ~ 23)
    data: [dataSchema], // 시간별 데이터
});

// 가장 최근 데이터 스키마
const lastStatusSchema = new mongoose.Schema({
    ...dataSchema.obj, // 공통 데이터 구조
});

const LowData = mongoose.model('LowData', lowDataSchema);
const LastStatus = mongoose.model('LastStatus', lastStatusSchema);

module.exports = { LowData, LastStatus };
