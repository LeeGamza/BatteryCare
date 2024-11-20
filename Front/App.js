  import React, { useState } from 'react';
  import { StyleSheet, Text, View, ImageBackground, Image, Dimensions } from 'react-native';
  import { getFullHourTimes } from './utils/timeUtils';
  import { BarChart } from 'react-native-chart-kit';
  const { width, height } = Dimensions.get('window');

  export default function App() {
    const [isRelayEnabled, setIsRelayEnabled] = useState(false);
    const toggleSwitch = () => setIsRelayEnabled(previousState => !previousState);

    // 더미 데이터 설정
    const [packVoltage, setPackVoltage] = useState("18.32"); // 팩 전압 (V 단위)
    const [current, setCurrent] = useState("27");
    const [cellVoltages, setCellVoltages] = useState(["4999", "4980", "4998", "4320"]);
    const xLabels = getFullHourTimes();

    // 데이터 저장을 위한 ArrayBuffer와 DataView 생성
    const buffer = new ArrayBuffer(17); // 총 17바이트 (셀 전압 4개 * 2바이트 + 팩 전압 * 2바이트 + 온도/전류/릴레이 각 1바이트)
    const dataView = new DataView(buffer);

    // 셀 전압 값 (예시 값 사용)
    const cellVoltageValues = [4999, 4980, 4998, 4320]; // 각 셀 전압을 mV 단위로 가정
    const packVoltageValue = Math.round(parseFloat(packVoltage) * 1000); // 팩 전압을 mV 단위로 변환

    const temperature = 25; // 섭씨 온도 (예시)
    const currentValue = -10; // mA 단위 전류 (예시)

    const chargeRelay = isRelayEnabled ? 1 : 0; // 충전 릴레이 상태
    const dischargeRelay = !isRelayEnabled ? 1 : 0; // 방전 릴레이 상태

    // 데이터 저장 함수
    const saveDataToBuffer = () => {
      let offset = 0;

      // 셀 전압들을 각각 2바이트씩 저장 (Uint16으로 저장)
      for (let i = 0; i < cellVoltageValues.length; i++) {
        dataView.setUint16(offset, cellVoltageValues[i], true); // 리틀 엔디안 형식으로 저장
        offset += 2;
      }

      // 팩 전압을 Uint16으로 저장 (2바이트) - mV 단위로 변환된 값을 사용
      dataView.setUint16(offset, packVoltageValue, true);
      offset += 2;

      // 온도 값을 Int8로 저장 (1바이트)
      dataView.setInt8(offset++, temperature);

      // 전류 값을 Int8로 저장 (1바이트)
      dataView.setInt8(offset++, currentValue);

      // 충전 릴레이 값을 Uint8로 저장 (1바이트)
      dataView.setUint8(offset++, chargeRelay);

      // 방전 릴레이 값을 Uint8로 저장 (1바이트)
      dataView.setUint8(offset++, dischargeRelay);

      console.log(new Uint8Array(buffer)); // 버퍼 내용을 출력하여 확인
    };

    // 컴포넌트가 렌더링될 때마다 데이터를 버퍼에 저장
    saveDataToBuffer();

    return (
        <ImageBackground
            source={require('./Image/BatteryCare-BackGround.png')}
            style={styles.background}
            resizeMode="cover"
        >
          <View style={styles.container}>
            {/* 로고 */}
            <Image
                source={require('./Image/BatteryCare-Logo.png')}
                style={styles.logo}
            />

            {/* 팩 전압과 전류 박스 */}
            <View style={styles.roundedBoxGreen}>
              <Text style={styles.textGRInsideBox}>팩 전압⚡: {packVoltage}V</Text>
            </View>
            <View style={styles.roundedBoxYellow}>
              <Text style={styles.textGRInsideBox}>전류⚡: {current}A</Text>
            </View>

            {/* 셀 전압 박스들 */}
            <View style={styles.cellContainer}>
              {cellVoltages.map((voltage, index) => (
                  <View key={index} style={styles.cellBox}>
                    <Text style={styles.textInsideBox}>셀 {index + 1}전압⚡: {voltage}mV</Text>
                  </View>
              ))}
            </View>
            <View style={styles.chartContainer}>
              <View style={{ position: 'relative' }}>
                <Text style={styles.chartTitle}>배터리 잔량</Text>
                <BarChart
                    data={{
                      labels: xLabels,
                      datasets: [
                        { data: [70, 85, 0, 100] } // 임시 데이터
                      ]
                    }}
                    width={width * 0.9} // 그래프 너비
                    height={220} // 그래프 높이
                    yAxisSuffix="%"
                    yAxisInterval={1} // y축 간격
                    chartConfig={{
                      backgroundColor: '#1cc910',
                      backgroundGradientFrom: '#eff3ff',
                      backgroundGradientTo: '#efefef',
                      decimalPlaces: 0, // 소수점 자리
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      barPercentage: 0.5,
                    }}
                    style={styles.chart}
                />
              </View>
            </View>
          </View>
        </ImageBackground>
    );
  }



  const styles = StyleSheet.create({
    background: {
      flex: 1,
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: width * 0.8,
      height: height * 0.16,
      position: 'absolute',
      left: width * 0.1,
      top: height * 0.035,
    },
    roundedBoxGreen: {
      width: width * 0.45,
      height: height * 0.08,
      backgroundColor: '#92D050',
      borderRadius: 10,
      position: 'absolute',
      left: width * 0.02,
      top: height * 0.25,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
    },
    roundedBoxYellow: {
      width: width * 0.45,
      height: height * 0.08,
      backgroundColor: '#FFC000',
      borderRadius: 10,
      position: 'absolute',
      left: width * 0.518,
      top: height * 0.25,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
    },
    cellContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '95%',
      position: 'absolute',
      top: height * 0.35,
      left: width * 0.02,
    },
    cellBox: {
      width: width * 0.45,
      height: height * 0.07,
      backgroundColor: '#4EA7E0',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      marginVertical:5,
    },
    textGRInsideBox:{
      color:'#000',
      fontSize :20 ,
      fontWeight:'700',
      textAlign:'center'
    },
    textInsideBox:{
      color:'#000',
      fontSize :17 ,
      fontWeight:'700',
      textAlign:'center'
    },
    chartContainer: {
      position: 'absolute',
      top: height * 0.55, // 원하는 위치로 조정
      width: '100%',
      alignItems: 'center',
    },
    chartTitle: {
      position: 'absolute',
      top: 5, // 그래프 내부 상단 여백
      left: '50%',
      transform: [{ translateX: -width * 0.45 }], // 텍스트를 중앙 정렬
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      zIndex: 16, // 텍스트가 그래프 위로 보이도록 설정
      color: '#000', // 텍스트 색상
    },
    chart: {
      borderRadius: 16,
      marginTop: 20, // 그래프와 텍스트 사이의 간격
    },
  });
