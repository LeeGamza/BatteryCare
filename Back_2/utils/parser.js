function parseBmsData(data) {
    // 셀 전압 1~4: 각 2 바이트, mV 단위 (0 ~ 5000 mV)
    const cellVoltage1 = data.readUInt16LE(0) / 10000; // mV -> V로 변환
    const cellVoltage2 = data.readUInt16LE(2) / 10000;
    const cellVoltage3 = data.readUInt16LE(4) / 10000;
    const cellVoltage4 = data.readUInt16LE(6) / 10000;

    // 팩 전압: 2 바이트, 단위 V (팩터 10 적용, 0.0 ~ 200V)
    const packVoltage = data.readUInt16LE(8) / 1000;

    // 온도: 2 바이트, 단위 °C (팩터 10 적용, -50 ~ 120°C)
    const temperature = data.readInt16LE(10) / 1000;

    // 전류: 2 바이트, 단위 A (팩터 10 적용, 0.0 ~ 500.0A)
    const current = data.readUInt16LE(12) / 100;

    // 충전 릴레이 상태: 1 바이트 (0: OFF, 1: ON)
    const chargeRelay = data.readUInt8(14) === 1;

    // 방전 릴레이 상태: 1 바이트 (0: OFF, 1: ON)
    const dischargeRelay = data.readUInt8(15) === 1;

    // 결과 객체 생성
    return {
        cellVoltages: [cellVoltage1, cellVoltage2, cellVoltage3, cellVoltage4],
        packVoltage,
        temperature,
        current,
        chargeRelay,
        dischargeRelay,
    };
}
module.exports = { parseBmsData };