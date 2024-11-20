import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, Image, Switch, TouchableOpacity, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [isRelayEnabled, setIsRelayEnabled] = useState(false);
  const toggleSwitch = () => setIsRelayEnabled(previousState => !previousState);

  // 더미 데이터 설정
  const [packVoltage, setPackVoltage] = useState("18.32");
  const [current, setCurrent] = useState("27");
  const [cellVoltages, setCellVoltages] = useState(["4999", "4980", "4998", "4320"]);

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
    left: width * 0.53,
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
    width: '48%',
    height: height * 0.07,
    backgroundColor: '#4EA7E0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginVertical: 5,
  },
  textGRInsideBox: {
    color: '#000',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  textInsideBox: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  relaySwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 1,
    backgroundColor: '#FFFFFF',
    width: width * 0.95,
    height: height * 0.05,
    marginTop: 22,
    position: 'absolute',
    top: height * 0.5,
  },
  relaySwitchText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  relayButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * 0.9,
    marginTop: 10,
    position: 'absolute',
    top: height * 0.6,
  },
  relayButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#C0C0C0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
