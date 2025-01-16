// src/screens/StatsScreen.js
import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {useWeight} from '../contexts/WeightContext';
import WeightChart from '../components/WeightChart';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PERIODS = {
  WEEK: '7일',
  MONTH: '1개월',
  HALF_YEAR: '6개월',
  YEAR: '1년',
};

const StatsScreen = () => {
  const {weightEntries} = useWeight();
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS.WEEK);
  const [selectedDay, setSelectedDay] = useState(null);

  const chartData = useMemo(() => {
    if (!weightEntries.length) return [];

    const now = new Date();
    const periodStart = new Date();

    // 선택된 기간에 따라 시작일 설정
    switch (selectedPeriod) {
      case PERIODS.WEEK:
        periodStart.setDate(now.getDate() - 7);
        break;
      case PERIODS.MONTH:
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case PERIODS.HALF_YEAR:
        periodStart.setMonth(now.getMonth() - 6);
        break;
      case PERIODS.YEAR:
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    // 기간 내의 데이터만 필터링
    const filteredEntries = weightEntries.filter(
      entry =>
        new Date(entry.date) >= periodStart && new Date(entry.date) <= now,
    );

    const groupedData = filteredEntries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = {
          date: entry.date,
          weights: [],
          timestamps: [],
          cases: [],
        };
      }
      acc[entry.date].weights.push(entry.weight);
      acc[entry.date].timestamps.push(entry.timestamp);
      acc[entry.date].cases.push(entry.case);
      return acc;
    }, {});

    return Object.values(groupedData)
      .map(day => ({
        ...day,
        average:
          day.weights.reduce((sum, w) => sum + w, 0) / day.weights.length,
        min: Math.min(...day.weights),
        max: Math.max(...day.weights),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [weightEntries, selectedPeriod]);

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
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart */}
        {chartData.length > 0 ? (
          <View style={styles.chartWrapper}>
            <WeightChart
              data={chartData}
              selectedDate={
                selectedDay?.date || chartData[chartData.length - 1]?.date
              }
            />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="scale-bathroom" size={48} color="#ccc" />
            <Text style={styles.noDataText}>
              아직 기록된 체중 데이터가 없습니다
            </Text>
          </View>
        )}

        {/* Date Picker */}
        <View style={styles.datePickerContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datePickerContent}>
            {chartData.map(point => (
              <TouchableOpacity
                key={point.date}
                style={[
                  styles.dateItem,
                  selectedDay?.date === point.date && styles.selectedDateItem,
                ]}
                onPress={() => setSelectedDay(point)}>
                <Text
                  style={[
                    styles.dateText,
                    selectedDay?.date === point.date && styles.selectedDateText,
                  ]}>
                  {new Date(point.date).toLocaleDateString('ko-KR', {
                    month: 'numeric',
                    day: 'numeric',
                  })}
                </Text>
                {point.weights.length > 0 && (
                  <Text
                    style={[
                      styles.dateCount,
                      selectedDay?.date === point.date &&
                        styles.selectedDateCount,
                    ]}>
                    {point.weights.length}회
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected Day Details */}
        {selectedDay && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>
              {formatDate(selectedDay.date)} 기록
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
                {selectedDay.timestamps.map((timestamp, index) => (
                  <View
                    key={timestamp}
                    style={[
                      styles.tableRow,
                      index !== 0 && styles.tableBorder,
                    ]}>
                    <Text style={[styles.tableCell, {flex: 2}]}>
                      {new Date(selectedDay.date).toLocaleDateString('ko-KR')}
                    </Text>
                    <Text style={[styles.tableCell, {flex: 1}]}>
                      {new Date(timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </Text>
                    <Text style={[styles.tableCell, {flex: 1}]}>
                      {selectedDay.weights[index].toFixed(1)}
                    </Text>
                    <Text style={[styles.tableCell, {flex: 1.5}]}>
                      {selectedDay.cases[index] === 'empty_stomach'
                        ? '공복'
                        : selectedDay.cases[index] === 'after_meal'
                        ? '식후'
                        : selectedDay.cases[index] === 'after_workout'
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
                    {selectedDay.average.toFixed(1)}kg
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>최소</Text>
                  <Text style={styles.summaryValue}>
                    {selectedDay.min.toFixed(1)}kg
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>최대</Text>
                  <Text style={styles.summaryValue}>
                    {selectedDay.max.toFixed(1)}kg
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
  chartWrapper: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datePickerContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datePickerContent: {
    paddingHorizontal: 4,
  },
  dateItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  selectedDateItem: {
    backgroundColor: '#4ecdc4',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  selectedDateText: {
    color: '#fff',
    fontWeight: '600',
  },
  dateCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  selectedDateCount: {
    color: '#fff',
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
