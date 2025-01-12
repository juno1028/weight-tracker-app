// src/screens/StatsScreen.js
import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {CandlestickChart, LineChart} from 'react-native-wagmi-charts';
import DayWeightList from '../components/DayWeightList';
import {useWeight} from '../contexts/WeightContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};

const CANDLE_COLORS = {
  positive: {
    default: '#4ecdc4',
    selected: '#50cebb',
  },
  negative: {
    default: '#ffc2d1',
    selected: '#ff9eb7',
  },
};

const StatsScreen = () => {
  const {weightEntries} = useWeight();
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS.DAILY);
  const [selectedCandle, setSelectedCandle] = useState(null);

  const candleData = useMemo(() => {
    if (!weightEntries.length) return [];

    const groupedData = weightEntries.reduce((acc, entry) => {
      const date = new Date(entry.date);
      let key;

      switch (selectedPeriod) {
        case PERIODS.WEEKLY:
          date.setDate(date.getDate() - date.getDay());
          key = date.toISOString().split('T')[0];
          break;
        case PERIODS.MONTHLY:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            '0',
          )}-01`;
          break;
        default:
          key = entry.date;
      }

      if (!acc[key]) {
        acc[key] = {
          weights: [],
          timestamp: new Date(key).getTime(),
        };
      }
      acc[key].weights.push(entry.weight);
      return acc;
    }, {});

    return Object.entries(groupedData)
      .map(([date, data]) => ({
        timestamp: data.timestamp,
        open: data.weights[0],
        high: Math.max(...data.weights),
        low: Math.min(...data.weights),
        close: data.weights[data.weights.length - 1],
        rawData: data.weights,
        date,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [weightEntries, selectedPeriod]);

  const maData = useMemo(() => {
    const period = 7; // 7일 이동평균으로 변경
    return candleData
      .map((_, index) => {
        if (index < period - 1) return null;
        const slice = candleData.slice(index - period + 1, index + 1);
        const average =
          slice.reduce((sum, candle) => sum + candle.close, 0) / period;
        return {
          timestamp: candleData[index].timestamp,
          value: average,
        };
      })
      .filter(Boolean);
  }, [candleData]);

  const statsData = useMemo(() => {
    if (!candleData.length) return null;

    const weights = candleData.map(d => d.close);
    const currentWeight = weights[weights.length - 1];
    const previousWeight = weights[weights.length - 2] || currentWeight;
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const weightDiff = currentWeight - previousWeight;

    return {
      currentWeight,
      previousWeight,
      minWeight,
      maxWeight,
      weightDiff,
    };
  }, [candleData]);

  const formatDate = dateStr => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>체중 통계</Text>
          <View style={styles.periodSelector}>
            {Object.values(PERIODS).map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.selectedPeriodButton,
                ]}
                onPress={() => setSelectedPeriod(period)}>
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period &&
                      styles.selectedPeriodButtonText,
                  ]}>
                  {period === PERIODS.DAILY
                    ? '일간'
                    : period === PERIODS.WEEKLY
                    ? '주간'
                    : '월간'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Summary */}
        {statsData && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>현재 체중</Text>
                <Text style={styles.statValue}>
                  {statsData.currentWeight.toFixed(1)}kg
                </Text>
                <View style={styles.diffContainer}>
                  <Icon
                    name={statsData.weightDiff > 0 ? 'arrow-up' : 'arrow-down'}
                    size={16}
                    color={statsData.weightDiff > 0 ? '#ff6b6b' : '#4ecdc4'}
                  />
                  <Text
                    style={[
                      styles.diffText,
                      {color: statsData.weightDiff > 0 ? '#ff6b6b' : '#4ecdc4'},
                    ]}>
                    {Math.abs(statsData.weightDiff).toFixed(1)}kg
                  </Text>
                </View>
              </View>
              <View style={styles.statsDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>최저/최고 체중</Text>
                <View style={styles.minMaxContainer}>
                  <Text style={styles.minMaxValue}>
                    {statsData.minWeight.toFixed(1)}kg
                  </Text>
                  <Text style={styles.minMaxSeparator}>~</Text>
                  <Text style={styles.minMaxValue}>
                    {statsData.maxWeight.toFixed(1)}kg
                  </Text>
                </View>
                <Text style={styles.rangeText}>
                  범위: {(statsData.maxWeight - statsData.minWeight).toFixed(1)}
                  kg
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Chart */}
        {candleData.length > 0 ? (
          <View style={styles.chartWrapper}>
            <CandlestickChart.Provider data={candleData}>
              <View>
                <TouchableWithoutFeedback
                  onPress={e => {
                    // 터치한 x 좌표를 기준으로 가장 가까운 캔들을 찾습니다
                    const touchX = e.nativeEvent.locationX;
                    const chartWidth = SCREEN_WIDTH - 32 - 32; // 전체 너비에서 패딩 제외
                    const indexPosition =
                      (touchX / chartWidth) * (candleData.length - 1);
                    const nearestIndex = Math.round(indexPosition);

                    if (nearestIndex >= 0 && nearestIndex < candleData.length) {
                      setSelectedCandle(candleData[nearestIndex]);
                    }
                  }}>
                  <View>
                    <CandlestickChart height={300}>
                      <CandlestickChart.Candles />
                      <LineChart.Path color="#FFB74D" width={2} data={maData} />
                    </CandlestickChart>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </CandlestickChart.Provider>
            <Text style={styles.chartDescription}>
              * 막대: 일일 체중 변화 범위 / 주황색 선: 7일 이동평균
            </Text>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="scale-bathroom" size={48} color="#ccc" />
            <Text style={styles.noDataText}>
              아직 기록된 체중 데이터가 없습니다
            </Text>
          </View>
        )}

        {/* Selected Day Details */}
        {selectedCandle && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>
              {formatDate(selectedCandle.date)} 기록
            </Text>

            {/* Raw Data Table */}
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, {flex: 2}]}>날짜</Text>
                <Text style={[styles.tableHeaderCell, {flex: 1}]}>시간</Text>
                <Text style={[styles.tableHeaderCell, {flex: 1}]}>
                  체중(kg)
                </Text>
                <Text style={[styles.tableHeaderCell, {flex: 1.5}]}>상태</Text>
              </View>
              <ScrollView style={styles.tableBody}>
                {weightEntries
                  .filter(entry => {
                    const entryDate = new Date(entry.date);
                    const selectedDate = new Date(selectedCandle.date);

                    switch (selectedPeriod) {
                      case PERIODS.WEEKLY:
                        // 같은 주의 데이터
                        const entryWeekStart = new Date(entryDate);
                        entryWeekStart.setDate(
                          entryDate.getDate() - entryDate.getDay(),
                        );
                        const selectedWeekStart = new Date(selectedDate);
                        selectedWeekStart.setDate(
                          selectedDate.getDate() - selectedDate.getDay(),
                        );
                        return (
                          entryWeekStart.getTime() ===
                          selectedWeekStart.getTime()
                        );

                      case PERIODS.MONTHLY:
                        // 같은 월의 데이터
                        return (
                          entryDate.getFullYear() ===
                            selectedDate.getFullYear() &&
                          entryDate.getMonth() === selectedDate.getMonth()
                        );

                      default:
                        // 같은 날의 데이터
                        return entry.date === selectedCandle.date;
                    }
                  })
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((entry, index) => (
                    <View
                      key={entry.timestamp}
                      style={[
                        styles.tableRow,
                        index !== 0 && styles.tableBorder,
                      ]}>
                      <Text style={[styles.tableCell, {flex: 2}]}>
                        {new Date(entry.date).toLocaleDateString('ko-KR')}
                      </Text>
                      <Text style={[styles.tableCell, {flex: 1}]}>
                        {new Date(entry.timestamp).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </Text>
                      <Text style={[styles.tableCell, {flex: 1}]}>
                        {entry.weight.toFixed(1)}
                      </Text>
                      <Text style={[styles.tableCell, {flex: 1.5}]}>
                        {entry.case === 'empty_stomach'
                          ? '공복'
                          : entry.case === 'after_meal'
                          ? '식후'
                          : entry.case === 'after_workout'
                          ? '운동 후'
                          : '-'}
                      </Text>
                    </View>
                  ))}
              </ScrollView>

              {/* Summary Section */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>평균</Text>
                  <Text style={styles.summaryValue}>
                    {selectedCandle.rawData.reduce((a, b) => a + b, 0) /
                      selectedCandle.rawData.length}
                    kg
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>최소</Text>
                  <Text style={styles.summaryValue}>
                    {selectedCandle.low}kg
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>최대</Text>
                  <Text style={styles.summaryValue}>
                    {selectedCandle.high}kg
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f8f8',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f1f8f8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d1b1a',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4ecdc4',
  },
  selectedPeriodButton: {
    backgroundColor: '#4ecdc4',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#4ecdc4',
    fontWeight: '600',
  },
  selectedPeriodButtonText: {
    color: '#fff',
  },
  statsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statsDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d1b1a',
  },
  diffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  diffText: {
    fontSize: 14,
    marginLeft: 4,
  },
  minMaxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  minMaxValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0d1b1a',
  },
  minMaxSeparator: {
    fontSize: 18,
    color: '#666',
    marginHorizontal: 8,
  },
  rangeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartWrapper: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  noDataContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  detailsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0d1b1a',
    marginBottom: 16,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeaderCell: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tableBody: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  tableBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default StatsScreen;
