import React, { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, Image, Animated, PanResponder } from 'react-native';

export default function App() {
  const [position] = useState(new Animated.ValueXY({ x: 0, y: 304 }));
  const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
          if (gestureState.dx > 0) {
            Animated.spring(position, {
              toValue: { x: gestureState.dx, y: 304 },
              useNativeDriver: false,
            }).start();
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          if(gestureState.dx < 290) {
            Animated.spring(position, {
              toValue: { x: 0, y: 304 },
              useNativeDriver: false,
            }).start();
          } else {
            Animated.spring(position, {
              toValue: { x: 290, y: 304},
              useNativeDriver: false,
            }).start();
          }
        },
      })
  ).current;

  const [position2] = useState(new Animated.ValueXY({ x: 0, y: 390 }));
  const panResponder2 = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
          if (gestureState.dx > 0) {
            Animated.spring(position2, {
              toValue: { x: gestureState.dx, y: 390 },
              useNativeDriver: false,
            }).start();
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (gestureState.dx < 290) {
            Animated.spring(position2, {
              toValue: { x: 0, y: 390 },
              useNativeDriver: false,
            }).start();
          } else {
            Animated.spring(position2, {
              toValue: { x: 290, y: 390 },
              useNativeDriver: false,
            }).start();
          }
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
              style={[styles.positionedImage, position.getLayout()]}
              {...panResponder.panHandlers}
          >
            <Image
                source={require('./Image/Front-RAM.png')}
                style={styles.imageSize}
            />
          </Animated.View>

          <View style={styles.ovalShapeSecond}>
            <Text style={styles.mainText}>
              휴대폰의 불필요한 파일을 제거합니다.
            </Text>
            <Text style={styles.subText}>
              밀어서 시작하세요!
            </Text>
          </View>

            <Animated.View
                style={[styles.positionedImage, position2.getLayout()]}
                {...panResponder2.panHandlers}
            >
              <Image source={require('./Image/Front-Delete.png')} style={styles.imageSize} />
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
  },
  ovalShapeSecond: {
    width: 364,
    height: 75,
    backgroundColor: '#C04F15',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 15,
    top: 390,
    borderWidth: 3,
  },
  positionedImage: {
    position: 'absolute',
    top: 296,
  },
  imageSize: {
    width: 100,
    height: 85,
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
    fontSize: 12,
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
