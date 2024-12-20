const mongoose = require('mongoose');

// 한국 시간으로 변환하는 함수
const getKoreanTimeString = () => {
    return new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
};

// 공통 데이터 스키마
const dataSchema = new mongoose.Schema({
    cellVoltages: [Number], // 셀 전압 배열
    packVoltage: Number, // 팩 전압
    temperature: Number, // 온도
    current: Number, // 전류
    Heartbeat: Number, // 하트비트
    Relay: Boolean, // 방전 릴레이 상태
    Alarm: Boolean, // 알람 신호
    timestamp: {
        type: String,
        default: getKoreanTimeString, // 한국 시간
    },
});

// 시간별 LowData 스키마
const lowDataSchema = new mongoose.Schema({
    hour: Number, // 해당 시간 (0 ~ 23)
    data: [dataSchema], // 시간별 데이터 배열
});

// 가장 최근 데이터 스키마 (LastStatus)
const lastStatusSchema = new mongoose.Schema({
    ...dataSchema.obj, // 공통 데이터 구조 포함
    cycleCount: { type: Number, default: 0 }, // 배터리 사이클 수
    imbalanceStatus: { type: String, default: 'Balanced' }, // 셀 불균형 상태
});

// 모델 생성
const LowData = mongoose.model('LowData', lowDataSchema);
const LastStatus = mongoose.model('LastStatus', lastStatusSchema);

module.exports = { LowData, LastStatus };
