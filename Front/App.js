import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground, Image, Dimensions, Switch } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [isPlusRelayEnabled, setIsPlusRelayEnabled] = useState(false);
  const [isMinusRelayEnabled, setIsMinusRelayEnabled] = useState(false);

  // 상태 값
  const [packVoltage, setPackVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [cellVoltages, setCellVoltages] = useState([]);
  const [temperature, setTemperature] = useState(''); // 배터리 온도값
  const [cyclevalue, setCyclevalue] = useState(''); // 사이클 횟수
  const [packVoltageHistory, setPackVoltageHistory] = useState([]);

  const [xLabels, setXLabels] = useState([]);

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const response = await fetch('http://192.168.27.89:3000/api/data');
        const data = await response.json();

        if (response.ok) {
          setPackVoltage(data.packVoltage || '0');
          setCurrent(data.current || '0');
          setCellVoltages(data.cellVoltages || []);
          setTemperature(data.temperature || '0');
          setCyclevalue(data.cycle || '0');
        } else {
          console.error('Failed to fetch data:', data.message);
        }
      } catch (error) {
        console.error('Error fetching current data:', error);
      }
    };

    const fetchAveragePackVoltage = async () => {
      try {
        const response = await fetch('http://192.168.27.89:3000/api/averagePackVoltage');
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          const validatedData = data.map(item => ({
            hour: item.hour,
            averageVoltage: Number(item.averageVoltage) || 0,
          }));

          setXLabels(validatedData.map(item => `${item.hour}시`));
          setPackVoltageHistory(validatedData.map(item => item.averageVoltage));
        } else {
          console.error('Failed to fetch average pack voltage:', data.message);
          setXLabels([]);
          setPackVoltageHistory([]);
        }
      } catch (error) {
        console.error('Error fetching average pack voltage:', error);
      }
    };

    fetchCurrentData();
    fetchAveragePackVoltage();
  }, []);

  // 각 박스의 배경 색을 토글 상태에 따라 동적으로 설정하는 함수
  const getBoxBackgroundColor = (isEnabled) => {
    return isEnabled ? '#FFFFFF' : '#767577'; // 켜졌을 때 흰색, 꺼졌을 때 회색
  };

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
                  <Text style={styles.textInsideBox}>셀 {index + 1}전압⚡: {voltage}V</Text>
                </View>
            ))}
          </View>

          {/* 팩전압 차트 */}
          <View style={styles.chartContainer}>
            <View style={{ position: 'relative' }}>
              <Text style={styles.chartTitle}>팩전압 기록</Text>
              <BarChart
                  data={{
                    labels: xLabels,
                    datasets: [{ data: packVoltageHistory }],
                  }}
                  width={width * 0.9}
                  height={220}
                  yAxisSuffix="V"
                  yAxisInterval={1}
                  chartConfig={{
                    backgroundColor: '#1cc910',
                    backgroundGradientFrom: '#eff3ff',
                    backgroundGradientTo: '#efefef',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    barPercentage: 0.5,
                  }}
                  style={styles.chart}
              />
            </View>
          </View>
        </View>

        {/* + 릴레이 박스 */}
        <View style={[styles.plusbox, { backgroundColor: getBoxBackgroundColor(isPlusRelayEnabled) }]}>
          <Text style={styles.textInsideBox}>&ensp;+릴레이</Text>
          <Switch
              trackColor={{ false: "#E9E9EA", true: "#34C458" }}  // 토글 배경 색 (켜졌을 때는 흰색, 꺼졌을 때는 회색)
              thumbColor={isPlusRelayEnabled ? "#FFFFFF" : "#f4f3f4"} // 스위치 thumb 색 (켜졌을 때는 흰색, 꺼졌을 때는 회색)
              onValueChange={() => setIsPlusRelayEnabled(previousState => !previousState)}
              value={isPlusRelayEnabled}
              style={styles.switchStyle}
          />
        </View>

        {/* - 릴레이 박스 */}
        <View style={[styles.minusbox, { backgroundColor: getBoxBackgroundColor(isMinusRelayEnabled) }]}>
          <Text style={styles.textInsideBox}>&ensp;-릴레이</Text>
          <Switch
              trackColor={{ false: "#E9E9EA", true: "#34C458" }}  // 토글 배경 색 (켜졌을 때는 흰색, 꺼졌을 때는 회색)
              thumbColor={isMinusRelayEnabled ? "#FFFFFF" : "#f4f3f4"} // 스위치 thumb 색 (켜졌을 때는 흰색, 꺼졌을 때는 회색)
              onValueChange={() => setIsMinusRelayEnabled(previousState => !previousState)}
              value={isMinusRelayEnabled}
              style={styles.switchStyle}
          />
        </View>

        {/* 배터리 온도 박스 */}
        <View style={styles.temperature}>
          <View style={styles.row}>
          <Image
              source={ temperature >= 45 ? require('./Image/Temp-RREEDD.png') : require('./Image/Temp-BBLLUUEE.png')}
              style={styles.icon}
          />
          <Text
              style={[
                styles.temcolortext,
                { color: temperature >= 45 ? '#FF0000' : '#4EA7E0' } // 조건에 따라 색상 변경
              ]}
          >
            현재 배터리 온도 : {temperature}℃
          </Text>
          </View>
          <Text style={styles.teminsidebox}>
            {temperature >= 45 ? "온도가 높습니다! 배터리 수명에 영향을 끼칠 수 있습니다." : "쾌적합니다! 배터리 수명에 영향을 끼치지 않습니다."}
          </Text>
        </View>
        {/* 사이클 박스 */}
        <View style={styles.cyclebox}>
          <Text style={[styles.textInsideBox]}>&ensp;사이클 수</Text>
          <Text style={[styles.textInsideBox, styles.rightAlignedText]}>{cyclevalue}</Text>
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
    height: height * 0.07,
    backgroundColor: '#92D050',
    borderRadius: 10,
    position: 'absolute',
    left: width * 0.02,
    top: height * 0.21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  roundedBoxYellow: {
    width: width * 0.45,
    height: height * 0.07,
    backgroundColor: '#FFC000',
    borderRadius: 10,
    position: 'absolute',
    left: width * 0.52,
    top: height * 0.21,
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
    top: height * 0.29,
    left: width * 0.02,
  },
  cellBox: {
    width: width * 0.45,
    height: height * 0.060,
    backgroundColor: '#4EA7E0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginVertical: 5,

  },
  textGRInsideBox: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  textInsideBox: {
    color: '#000',
    fontSize: 16.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  teminsidebox :{
    color: '#000000',
    textAlign: 'center',
    fontSize: 13
  },
  chartContainer: {
    position: 'absolute',
    top: height * 0.45, // 원하는 위치로 조정
    width: '100%',
    alignItems: 'center',
  },
  chartTitle: {
    position: 'absolute',
    top: -10, // 그래프 내부 상단 여백
    left: '50%',
    transform: [{ translateX: -width * 0.46}], // 텍스트를 중앙 정렬
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 10, // 텍스트가 그래프 위로 보이도록 설정
    color: '#000', // 텍스트 색상
  },
  chart: {
    borderRadius: 16,
    marginTop: 20, // 그래프와 텍스트 사이의 간격
  },
  plusbox: {
    width: width * 0.45,
    height: height * 0.044,
    borderRadius: 10,
    position: 'absolute',
    left: width * 0.02,
    top: height * 0.765,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderWidth: 3,
    flexDirection: 'row', // 텍스트와 스위치를 가로로 배치
  },
  minusbox: {
    width: width * 0.45,
    height: height * 0.044,
    borderRadius: 10,
    position: 'absolute',
    left: width * 0.52,
    top: height * 0.765,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderWidth: 3,
    flexDirection: 'row', // 텍스트와 스위치를 가로로 배치
  },
  //온도 박스 스타일
  temperature: {
    width: width * 0.95,
    height: height * 0.08,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    position: 'absolute',
    left: width * 0.02,
    top: height * 0.825,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  temcolortext:{
    color: '#4EA7E0',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center'
  },

  row: {
    flexDirection: 'row', // 가로로 배치
    alignItems: 'center', // 세로 정렬 (중앙 정렬)
  },

  icon: {
    width: 24, // 아이콘 너비 (적절히 조정)
    height: 24, // 아이콘 높이 (적절히 조정)
    marginRight: 3, // 텍스트와의 간격
  },



  cyclebox: {
    width: width * 0.95,
    height: height * 0.044,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    position: 'absolute',
    left: width * 0.02,
    top: height * 0.925,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderWidth: 3,
    flexDirection: 'row', // 텍스트와 숫자를 가로로 배치
  },
  rightAlignedText: {
    justifyContent: 'flex-start',
    alignItems : "flex-start",
    marginTop : 2,
    textAlign: 'right', // 텍스트를 오른쪽 정렬
    flex: 1,           // 남은 공간을 채워서 오른쪽으로 밀림
    marginRight: 10,   // 오른쪽 여백 추가 (선택 사항)
  },

  //스위치 스타일
  switchStyle: {
    marginTop: -8,
    marginLeft: 60, // 오른쪽에 배치
  },
});

