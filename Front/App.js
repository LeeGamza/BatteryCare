import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window'); // 화면의 너비와 높이 가져오기

export default function App() {
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
            <Text style={styles.textGRInsideBox}>팩 전압⚡: 18.32V</Text>
          </View>
          <View style={styles.roundedBoxYellow}>
            <Text style={styles.textGRInsideBox}>전류⚡: 27A</Text>
          </View>

          {/* 셀 전압 박스들 */}
          <View style={styles.cellContainer}>
            <View style={styles.cellBox}>
              <Text style={styles.textInsideBox}>셀 1전압⚡: 4999mV</Text>
            </View>
            <View style={styles.cellBox}>
              <Text style={styles.textInsideBox}>셀 1전압⚡: 4980mV</Text>
            </View>
            <View style={styles.cellBox}>
              <Text style={styles.textInsideBox}>셀 1전압⚡: 4998mV</Text>
            </View>
            <View style={styles.cellBox}>
              <Text style={styles.textInsideBox}>셀 1전압⚡: 4320mV</Text>
            </View>
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
    width: width * 0.8,      // 화면 너비의 80%
    height: height * 0.16,   // 화면 높이의 15%
    position: 'absolute',
    left: width * 0.1,       // 화면 너비의 10%에 위치
    top: height * 0.035,      // 화면 높이의 5%에 위치
  },
  roundedBoxGreen: {
    width: width * 0.45,  // 화면 너비의 45%
    height: height * 0.08, // 화면 높이의 8%
    backgroundColor: '#92D050',
    borderRadius: 10,
    position: 'absolute',
    left: width * 0.02,
    top: height * 0.25,    // 화면 높이의 30% 위치
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  roundedBoxYellow: {
    width: width * 0.45,  // 화면 너비의 45%
    height: height * 0.08, // 화면 높이의 8%
    backgroundColor: '#FFC000',
    borderRadius: 10,
    position: 'absolute',
    left: width * 0.53,   // 화면 너비의 53% 위치
    top: height * 0.25,    // 화면 높이의 30% 위치
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
    top: height * 0.35,    // Green과 Yellow 박스 아래에 위치
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
});
