import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, Image } from 'react-native';

export default function App() {
  return (
      <ImageBackground
          source={require('./Image/BatteryCare-BackGround.png')}
          style={styles.background}
          resizeMode="cover" // 여기에 적용
      >
        <View style={styles.container}>
          {/* 상단에 로고 이미지 추가 */}
          <Image source={require('./Image/BatteryCare-Logo.png')} style={styles.logo} />
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
});
