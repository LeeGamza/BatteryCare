const mongoose = require('mongoose');

// 공통 데이터 스키마
const dataSchema = new mongoose.Schema({
    cellVoltages: [Number],
    packVoltage: Number,
    temperature: Number,
    current: Number,
    chargeRelay: Boolean,
    dischargeRelay: Boolean,
    timestamp: { type: String, default: () => new Date().toISOString() },
});

// 시간별 LowData 스키마
const lowDataSchema = new mongoose.Schema({
    hour: Number, // 해당 시간 (0 ~ 23)
    data: [dataSchema], // 시간별 데이터
});

// 가장 최근 데이터 스키마
const lastStatusSchema = new mongoose.Schema({
    ...dataSchema.obj, // 기존 데이터 구조
    cycleCount: { type: Number, default: 0 }, // 사이클 수 필드 추가
    imbalanceStatus: { type: String, default: 'Balanced' }, // 불균형 상태
});

const LowData = mongoose.model('LowData', lowDataSchema);
const LastStatus = mongoose.model('LastStatus', lastStatusSchema);

module.exports = { LowData, LastStatus };
