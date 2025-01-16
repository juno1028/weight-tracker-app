// src/components/WeightChart.js
import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Svg, {G, Line, Path, Rect, Text, Circle} from 'react-native-svg';
import * as d3 from 'd3-shape';
import {scaleTime, scaleLinear} from 'd3-scale';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = 200;
const PADDING = {top: 10, right: 40, bottom: 30, left: 40};

const WeightChart = ({data, selectedDate}) => {
  // X축 스케일 (날짜)
  const xScale = scaleTime()
    .domain([new Date(data[0].date), new Date(data[data.length - 1].date)])
    .range([PADDING.left, CHART_WIDTH - PADDING.right]);

  // Y축 스케일 (체중)
  const allWeights = data.reduce((acc, day) => [...acc, ...day.weights], []);
  const yScale = scaleLinear()
    .domain([Math.min(...allWeights) - 1, Math.max(...allWeights) + 1])
    .range([CHART_HEIGHT - PADDING.bottom, PADDING.top]);

  // 직선 연결 path 생성
  const linePath = d3
    .line()
    .x(d => xScale(new Date(d.date)))
    .y(d => yScale(d.average))
    .curve(d3.curveLinear)(data);

  return (
    <View style={styles.container}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {/* Y축 */}
        <G>
          {yScale.ticks(5).map(tick => (
            <G key={tick}>
              <Line
                x1={PADDING.left}
                y1={yScale(tick)}
                x2={CHART_WIDTH - PADDING.right}
                y2={yScale(tick)}
                stroke="#E8E8E8"
                strokeWidth="1"
              />
              <Text
                x={PADDING.left - 5}
                y={yScale(tick)}
                fontSize="10"
                fill="#666"
                textAnchor="end"
                dy="4">
                {tick.toFixed(1)}
              </Text>
            </G>
          ))}
        </G>

        {/* X축 날짜 */}
        {data.map((point, i) => {
          if (i % 3 === 0) {
            return (
              <Text
                key={point.date}
                x={xScale(new Date(point.date))}
                y={CHART_HEIGHT - PADDING.bottom + 20}
                fontSize="10"
                fill="#666"
                textAnchor="middle">
                {`${new Date(point.date).getMonth() + 1}/${new Date(
                  point.date,
                ).getDate()}`}
              </Text>
            );
          }
          return null;
        })}

        {/* 연결선 */}
        <Path d={linePath} fill="none" stroke="#4ECDC4" strokeWidth="1.5" />

        {/* 데이터 포인트 및 범위 바 */}
        {data.map(point => (
          <G key={point.date}>
            <Rect
              x={xScale(new Date(point.date)) - 3}
              y={yScale(point.max)}
              width={6}
              height={yScale(point.min) - yScale(point.max)}
              fill="#E8F7F6"
              opacity={selectedDate === point.date ? 1 : 0.7}
            />
            {point.weights.length > 0 && (
              <Circle
                cx={xScale(new Date(point.date))}
                cy={yScale(point.average)}
                r={4}
                fill="#4ECDC4"
                stroke="white"
                strokeWidth="2"
                opacity={selectedDate === point.date ? 1 : 0.7}
              />
            )}
          </G>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
});

export default WeightChart;
