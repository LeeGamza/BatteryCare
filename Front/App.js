import React, { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, Image, Animated, PanResponder } from 'react-native';

export default function App() {
  const [position] = useState(new Animated.ValueXY({ x: 0, y: 304 })); // 초기 좌표
  const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
          if (gestureState.dx > 0) {  // 오른쪽으로만 스와이프
            Animated.spring(position, {
              toValue: { x: gestureState.dx, y: 304 },  // x값을 스와이프한 만큼 변경
              useNativeDriver: false,
            }).start();
          }
        },
        onPanResponderRelease: () => {
          // 스와이프가 끝나면 할 행동
          console.log('스와이프 완료');
        },
      })
  ).current;

  return (
      <ImageBackground
          source={require('./Image/BatteryCare-BackGround.png')}
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.container}>
          <Image
              source={require('./Image/BatteryCare-Logo.png')}
              style={styles.logo}
          />
          <View style={styles.roundedBox}>
            <Text style={styles.textInsideBox}>
              잔량🔋:100%
            </Text>
          </View>

          <View style={styles.roundedBoxSecond}>
            <Text style={styles.textInsideBox}>
              전력⚡:18.75
            </Text>
          </View>

          <View style={styles.ovalShape}>
            <Text style={styles.mainText}>
              사용자의 휴대폰 RAM을 최적화 합니다.
            </Text>
            <Text style={styles.subText}>
              밀어서 시작하세요!
            </Text>
          </View>

          <Animated.View
              style={[styles.positionedImage, position.getLayout()]}  // 이미지 위치 변경 적용
              {...panResponder.panHandlers}  // PanResponder 핸들러 적용
          >
            <Image
                source={require('./Image/Front-RAM.png')}  // 삽입할 이미지 경로
                style={styles.imageSize}  // 이미지 크기 설정
            />
          </Animated.View>
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
    width: 338,
    height: 161,
    position: 'absolute',
    left: 28,
    top: 24,
    marginLeft: -5,
  },
  ovalShape: {
    width: 364,
    height: 75,
    backgroundColor: '#7030A0',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -120,
    borderWidth: 3,
    zIndex: 1,
  },
  positionedImage: {
    position: 'absolute',  // 이미지 절대 위치
    top: 296,  // y 좌표
  },
  imageSize: {
    width: 100,  // 너비
    height: 85,  // 높이
    left: 4,
  },
  roundedBox: {
    width: 186,
    height: 59,
    backgroundColor: '#4EA72E',
    borderRadius: 10,
    position: 'absolute',
    left: 8,
    top: 225,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  roundedBoxSecond: {
    width: 186,
    height: 59,
    backgroundColor: '#4EA72E',
    borderRadius: 10,
    position: 'absolute',
    left: 202,
    top: 225,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  textInsideBox: {
    color: '#000',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  mainText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  subText: {
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
  },
});
