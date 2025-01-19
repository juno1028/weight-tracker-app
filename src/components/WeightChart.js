// src/components/WeightChart.js
import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Svg, {G, Line, Path, Rect, Text, Circle} from 'react-native-svg';
import * as d3 from 'd3-shape';
import {scaleTime, scaleLinear} from 'd3-scale';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 200;
const PADDING = {top: 10, right: 40, bottom: 40, left: 40};

const getCaseColor = weightCase => {
  switch (weightCase) {
    case 'empty_stomach':
      return '#4ECDC4'; // 민트색
    case 'after_meal':
      return '#FF9B9B'; // 연한 빨강
    case 'after_workout':
      return '#FFB74D'; // 연한 주황
    default:
      return '#C8C8C8'; // 회색
  }
};

const WeightChart = ({data, selectedDate, visibleCases}) => {
  // 필터링된 데이터 생성
  const filteredData = data.map(day => {
    const visibleWeights = day.weights.filter((_, index) =>
      visibleCases.includes(day.cases[index]),
    );
    return {
      ...day,
      visibleWeights,
      visibleAverage:
        visibleWeights.length > 0
          ? visibleWeights.reduce((sum, w) => sum + w, 0) /
            visibleWeights.length
          : null,
    };
  });

  // 평균값이 있는 데이터만 필터링
  const validAverageData = filteredData.filter(
    day => day.visibleAverage !== null,
  );

  // X축 스케일 (날짜)
  const xScale = scaleTime()
    .domain([new Date(data[0].date), new Date(data[data.length - 1].date)])
    .range([PADDING.left, CHART_WIDTH - PADDING.right]);

  // Y축 스케일 (체중)
  const allWeights = data.reduce((acc, day) => [...acc, ...day.weights], []);
  const yScale = scaleLinear()
    .domain([Math.min(...allWeights) - 1, Math.max(...allWeights) + 1])
    .range([CHART_HEIGHT - PADDING.bottom, PADDING.top]);

  // 유효한 데이터 포인트끼리 연결하는 path 생성
  const averagePath =
    validAverageData.length > 1
      ? d3
          .line()
          .x(d => xScale(new Date(d.date)))
          .y(d => yScale(d.visibleAverage))
          .curve(d3.curveLinear)(validAverageData)
      : null;

  // 기간에 따른 x축 레이블 표시 간격 결정
  const getXAxisInterval = () => {
    const daysDiff =
      (new Date(data[data.length - 1].date) - new Date(data[0].date)) /
      (1000 * 60 * 60 * 24);
    if (daysDiff <= 7) return 1; // 7일: 모든 날짜 표시
    if (daysDiff <= 31) return 7; // 1개월: 7일 간격
    if (daysDiff <= 180) return 30; // 6개월: 1개월 간격
    return 60; // 1년: 2개월 간격
  };

  const xAxisInterval = getXAxisInterval();

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

        {/* X축 격자선과 날짜 */}
        {data.map((point, index) => {
          const daysDiff =
            (new Date(point.date) - new Date(data[0].date)) /
            (1000 * 60 * 60 * 24);
          const shouldShowLabel =
            daysDiff % xAxisInterval === 0 || index === data.length - 1;

          return (
            <G key={point.date}>
              <Line
                x1={xScale(new Date(point.date))}
                y1={PADDING.top}
                x2={xScale(new Date(point.date))}
                y2={CHART_HEIGHT - PADDING.bottom}
                stroke="#E8E8E8"
                strokeWidth="1"
              />
              {shouldShowLabel && (
                <Text
                  x={xScale(new Date(point.date))}
                  y={CHART_HEIGHT - PADDING.bottom + 20}
                  fontSize="10"
                  fill="#666"
                  textAnchor="middle"
                  transform={`rotate(-45, ${xScale(new Date(point.date))}, ${
                    CHART_HEIGHT - PADDING.bottom + 20
                  })`}>
                  {`${new Date(point.date).getMonth() + 1}/${new Date(
                    point.date,
                  ).getDate()}`}
                </Text>
              )}
            </G>
          );
        })}

        {/* 평균 연결선 (더 두껍고 반투명한 회색으로) */}
        {averagePath && (
          <Path
            d={averagePath}
            fill="none"
            stroke="#999999"
            strokeWidth="4"
            strokeOpacity="0.3"
          />
        )}

        {/* 개별 데이터 포인트 */}
        {filteredData.map(point => (
          <G key={point.date}>
            {/* 각 case별 데이터 포인트 */}
            {point.weights.map((weight, index) => {
              if (!visibleCases.includes(point.cases[index])) return null;

              return (
                <Circle
                  key={`${point.date}-${index}`}
                  cx={xScale(new Date(point.date))}
                  cy={yScale(weight)}
                  r={4}
                  fill={getCaseColor(point.cases[index])}
                  stroke="white"
                  strokeWidth="1"
                  opacity={selectedDate === point.date ? 1 : 0.7}
                />
              );
            })}

            {/* 평균값 포인트 */}
            {point.visibleAverage !== null && (
              <Circle
                cx={xScale(new Date(point.date))}
                cy={yScale(point.visibleAverage)}
                r={5}
                fill="#999999"
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
    alignItems: 'center',
  },
});

export default WeightChart;
