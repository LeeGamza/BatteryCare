import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, Image } from 'react-native';

export default function App() {
  return (
      <ImageBackground
          source={require('./Image/BatteryCare-BackGround.png')}
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.container}>
          <Image source={require('./Image/BatteryCare-Logo.png')} style={styles.logo} />
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
    left: 202,  // 새로운 X 좌표
    top: 225,   // 동일한 Y 좌표
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  textInsideBox: {
    color: '#000',  // 텍스트 색상 (필요시 수정 가능)
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
});
