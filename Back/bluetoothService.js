const noble = require("noble");
const BatteryStatus = require("./batteryStatus"); // 스키마 가져오기

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
    // Bluetooth 장치 발견 시 처리
    console.log(`Discovered device: ${peripheral.advertisement.localName}`);

    // 특정 장치와 연결
    peripheral.connect((error) => {
      if (error) {
        console.error("Connection error:", error);
        return; // 연결 오류 발생 시 로그만 남기고 계속 진행
      }

      console.log("Connected to device:", peripheral.advertisement.localName);
      console.log("Starting data reception..."); // 연결 시작 로그 추가

      // 서비스와 특성을 찾기
      peripheral.discoverSomeServicesAndCharacteristics([], [], (error, services, characteristics) => {
        if (error) {
          console.error("Error discovering services and characteristics:", error);
          return; // 서비스 발견 오류 발생 시 로그만 남기고 계속 진행
        }

        // 데이터 수신을 위한 특성 설정
        const dataCharacteristic = characteristics[0]; // 첫 번째 특성을 예시로 사용 (실제 사용 시 적절한 특성을 선택)
        dataCharacteristic.on("data", (data) => {
          // 수신한 데이터를 처리
          const receivedData = data.toString(); // 수신한 데이터를 문자열로 변환
          console.log("Received data:", receivedData);
          console.log("Data received successfully!"); // 데이터 수신 시작 로그 추가

          // 데이터 처리 로직 (예시: JSON 파싱 후 MongoDB에 저장)
          try {
            const parsedData = JSON.parse(receivedData);
            saveBatteryData(parsedData);
          } catch (error) {
            console.error("Error parsing data:", error);
          }
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
  });

  noble.on("error", (error) => {
    console.error("Noble error:", error); // Noble 관련 오류 로그 추가
  });
}

module.exports = startBluetooth; // Bluetooth 시작 함수 내보내기
