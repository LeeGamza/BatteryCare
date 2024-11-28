let cycleCount = 0; // 사이클 수
let previousState = null; // 이전 상태: "charging" 또는 "discharging"

const nearlyFullyChargedVoltage = 16.8; // 4셀 기준
const thresholdVoltage = 12.0; // 4셀 기준
const maxVoltageDifference = 0.05; // 불균형 판단 기준 (V)

// 불균형 감지 함수
function detectImbalance(cellVoltages) {
    const maxVoltage = Math.max(...cellVoltages);
    const minVoltage = Math.min(...cellVoltages);
    const deltaV = maxVoltage - minVoltage;

    if (deltaV > maxVoltageDifference) {
        console.log(`Cell imbalance detected: ΔV = ${deltaV.toFixed(3)}V`);
        return true; // 불균형 상태
    }
    return false; // 균형 상태
}

// 사이클 계산 함수
function calculateCycle(parsedData) {
    const { packVoltage, cellVoltages } = parsedData;

    // 불균형 감지
    const imbalanceDetected = detectImbalance(cellVoltages);

    if (imbalanceDetected) {
        console.warn('Imbalance detected. Cycle calculation may be inaccurate.');
    }

    // 충전 완료 상태
    if (packVoltage >= nearlyFullyChargedVoltage && previousState !== 'charging') {
        previousState = 'charging';
        console.log('Charging state detected.');
    }

    // 방전 완료 상태
    if (packVoltage <= thresholdVoltage && previousState === 'charging') {
        previousState = 'discharging';
        cycleCount++;
        console.log(`Cycle completed. Total cycles: ${cycleCount}`);
    }

    return cycleCount;
}

module.exports = { calculateCycle, detectImbalance };
