// batteryCycleService.js

// 누적 충전량과 사이클 수를 관리하는 변수
let accumulatedCharge = 0; // 누적 충전량
let cycleCount = 0; // 배터리 사이클 수

// 충전량을 업데이트하고, 누적 충전량이 100% 이상이면 사이클 수 증가
function updateBatteryCycle(chargeAdded) {
  accumulatedCharge += chargeAdded; // 충전량을 누적

  if (accumulatedCharge >= 100) {
    cycleCount += 1;               // 사이클 수 증가
    accumulatedCharge -= 100;       // 누적 충전량에서 100%를 차감해 남은 부분 저장
  }
}

// 현재 사이클 수와 누적 충전량을 반환하는 함수
function getBatteryCycleInfo() {
  return {
    cycleCount,
    accumulatedCharge
  };
}

module.exports = { updateBatteryCycle, getBatteryCycleInfo };
