// src/screens/StatsScreen.js
import React from 'react';
import {View, StyleSheet, Dimensions, Text} from 'react-native';
import {
  CandlestickChart,
  CandlestickChartPoint,
} from 'react-native-wagmi-charts';
import {useWeight} from '../contexts/WeightContext';

const StatsScreen = () => {
  const {weightEntries} = useWeight();

  const processDataForChart = () => {
    // 날짜별로 데이터 그룹화
    const groupedData = weightEntries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = {
          weights: [],
          timestamp: new Date(entry.date).getTime(),
        };
      }
      acc[entry.date].weights.push(entry.weight);
      return acc;
    }, {});

    // 캔들차트 데이터 형식으로 변환
    return Object.values(groupedData)
      .filter(({weights}) => weights.length > 0)
      .map(({weights, timestamp}) => ({
        timestamp,
        open: weights[0],
        high: Math.max(...weights),
        low: Math.min(...weights),
        close: weights[weights.length - 1],
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const data = processDataForChart();

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>기록된 데이터가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CandlestickChart.Provider data={data}>
        <CandlestickChart height={400}>
          <CandlestickChart.Candles />
          <CandlestickChart.Crosshair>
            <CandlestickChart.Tooltip />
          </CandlestickChart.Crosshair>
        </CandlestickChart>
      </CandlestickChart.Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default StatsScreen;
