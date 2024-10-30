// app.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // CORS 미들웨어 추가
const startBluetooth = require('./bluetoothService'); // Bluetooth 서비스 가져오기
const batteryCycleService = require('./batteryCycleService'); // 배터리 사이클 서비스 가져오기

const app = express();
app.use(express.json()); // JSON 요청 본문 파싱 설정
app.use(cors()); // CORS 설정

// MongoDB 연결 설정
mongoose.connect('mongodb+srv://admin:admin@cluster0.6m1uhwl.mongodb.net/', {
}).then(() => {
  console.log("MongoDB connected");
  startBluetooth(); // Bluetooth 수신 시작
}).catch((error) => {
  console.error("MongoDB connection error:", error);
});

// 배터리 사이클 수와 누적 충전량을 조회하는 GET API
app.get('/battery-cycle', (req, res) => {
  const cycleInfo = batteryCycleService.getBatteryCycleInfo();
  res.json(cycleInfo); // 현재 사이클 정보와 누적 충전량 반환
});

// 새로운 충전량을 추가하여 사이클 수를 업데이트하는 POST API
app.post('/update-charge', (req, res) => {
  const { chargeAdded } = req.body; // 요청에서 충전량을 추출
  batteryCycleService.updateBatteryCycle(chargeAdded); // 사이클 업데이트
  res.json({ message: 'Charge updated successfully' });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
