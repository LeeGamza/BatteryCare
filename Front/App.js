import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, Image, Switch, TouchableOpacity, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [isRelayEnabled, setIsRelayEnabled] = useState(false);
  const toggleSwitch = () => setIsRelayEnabled(previousState => !previousState);

  // 더미 데이터 설정
  const [packVoltage, setPackVoltage] = useState("18.32"); // 팩 전압 (V 단위)
  const [current, setCurrent] = useState("27");
  const [cellVoltages, setCellVoltages] = useState(["4999", "4980", "4998", "4320"]);

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

          {/* 프리릴레이 스위치 */}
          <View style={styles.relaySwitchContainer}>
            <Text style={styles.relaySwitchText}>프리릴레이</Text>
            <Switch
                trackColor={{ false: "#767577", true: "#92D050" }}
                thumbColor={isRelayEnabled ? "#FFFFFF" : "#f4f3f4"}
                onValueChange={toggleSwitch}
                value={isRelayEnabled}
            />
          </View>

          {/* 릴레이 + / - 버튼들 */}
          <View style={styles.relayButtonsContainer}>
            <TouchableOpacity style={styles.relayButton}>
              <Text style={styles.buttonText}>+ 릴레이</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.relayButton}>
              <Text style={styles.buttonText}>- 릴레이</Text>
            </TouchableOpacity>
          </View>

          <StatusBar style="auto" />
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
  relaySwitchContainer:{
    flexDirection:'row',
    alignItems:'center',
    borderWidth :2 ,
    borderColor:'#333',
    borderRadius :10 ,
    paddingHorizontal :10 ,
    paddingVertical :1 ,
    backgroundColor :'#FFFFFF' ,
    width :width*0.95 ,
    height :height*0.05 ,
    marginTop :22 ,
    position :'absolute' ,
    top :height*0.5 ,
  },
  relaySwitchText:{
    flex :1 ,
    fontSize :18 ,
    fontWeight :'700' ,
    color :'#333'
  },
  relayButtonsContainer:{
    flexDirection :'row' ,
    justifyContent :'space-around' ,
    width :width*0.9 ,
    marginTop :10 ,
    position :'absolute' ,
    top :height*0.6 ,
  },
  relayButton:{
    flex :1 ,
    marginHorizontal :5 ,
    backgroundColor :'#C0C0C0' ,
    alignItems :'center' ,
    justifyContent :'center' ,
    paddingVertical :10 ,
    borderRadius :10 ,
  },
  buttonText:{
    fontSize :16 ,
    fontWeight :'600' ,
    color :'#333'
  }
});
