// models/batteryStatus.js
const mongoose = require("mongoose");

// BMS 데이터 구조 정의
const batteryStatusSchema = new mongoose.Schema({
  cellVoltages: { type: [Number], required: true },
  packVoltage: { type: Number, required: true },
  temperature: { type: Number, required: true },
  current: { type: Number, required: true },
  chargeRelayState: { type: Boolean, required: true },
  dischargeRelayState: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
});

// 'BatteryStatus' 모델을 생성하여 MongoDB의 'BatteryStatus' 컬렉션과 연동
const BatteryStatus = mongoose.model("BatteryStatus", batteryStatusSchema);

module.exports = BatteryStatus; // 모델 내보내기
