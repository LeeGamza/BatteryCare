// services/bluetoothService.js
const noble = require("noble");
const BatteryStatus = require("./batteryStatus"); // 스키마 가져오기

// Bluetooth 데이터 수신 함수
function startBluetooth() {
  noble.on("stateChange", (state) => {
    if (state === "poweredOn") {
      console.log("Bluetooth is powered on. Scanning for devices...");
      noble.startScanning(); // Bluetooth 장치 검색 시작
    } else {
      console.log("Bluetooth is powered off. Please turn it on.");
      noble.stopScanning(); // Bluetooth가 꺼져 있으면 검색 중지
    }
  });

  noble.on("discover", (peripheral) => {
    console.log(`Discovered device: ${peripheral.advertisement.localName}`);

    // 특정 장치와 연결
    peripheral.connect((error) => {
      if (error) {
        console.error("Connection error:", error);
        return;
      }
      console.log("Connected to device:", peripheral.advertisement.localName);

      // 서비스와 특성을 찾기
      peripheral.discoverSomeServicesAndCharacteristics([], [], (error, services, characteristics) => {
        if (error) {
          console.error("Error discovering services and characteristics:", error);
          return;
        }

        // 데이터 수신을 위한 특성 설정
        const dataCharacteristic = characteristics[0]; // 첫 번째 특성을 예시로 사용 (실제 사용 시 적절한 특성을 선택)
        
        // 특성에서 데이터 수신 이벤트 처리
        dataCharacteristic.on("data", (data) => {
          // 수신한 데이터를 처리
          const receivedData = data.toString(); // 수신한 데이터를 문자열로 변환
          console.log("Received data:", receivedData);

          // 데이터 처리 로직 (예시: JSON 파싱 후 MongoDB에 저장)
          handleReceivedData(receivedData);
        });

        // 특성 구독 시작
        dataCharacteristic.subscribe((error) => {
          if (error) {
            console.error("Error subscribing to characteristic:", error);
          } else {
            console.log("Subscribed to characteristic for data updates");
          }
        });
      });
    });

    // 연결 해제 시 처리
    peripheral.on("disconnect", (error) => {
      if (error) {
        console.error("Disconnect error:", error);
      } else {
        console.log("Disconnected from device:", peripheral.advertisement.localName);
      }
    });
  });
}

// 수신한 데이터를 처리하는 함수
async function handleReceivedData(receivedData) {
  try {
    const parsedData = JSON.parse(receivedData);
    await saveBatteryData(parsedData);
  } catch (error) {
    console.error("Error parsing data:", error);
  }
}

// BMS 데이터를 MongoDB에 저장하는 함수
async function saveBatteryData(data) {
  try {
    const batteryStatus = new BatteryStatus(data);
    await batteryStatus.save();
    console.log("Data saved successfully!");
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

module.exports = startBluetooth; // Bluetooth 시작 함수 내보내기
