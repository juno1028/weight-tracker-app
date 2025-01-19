// src/components/CustomDay.js
import React from 'react';
import {TouchableOpacity, Text, View, StyleSheet} from 'react-native';

const getStatusColor = weightCase => {
  switch (weightCase) {
    case 'empty_stomach':
      return 'rgba(78, 205, 196, 0.15)'; // 민트색
    case 'after_meal':
      return 'rgba(255, 155, 155, 0.15)'; // 연한 빨강
    case 'after_workout':
      return 'rgba(255, 183, 77, 0.15)'; // 연한 주황
    default:
      return 'rgba(200, 200, 200, 0.15)'; // 연한 회색
  }
};
const CustomDay = ({date, state, marking, onPress, weights}) => {
  const isSelected = marking?.selected;
  const isToday = state === 'today';
  const hasWeights = weights && weights.length > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}>
      <View
        style={[
          styles.dayContainer,
          isToday && styles.todayContainer,
          isSelected && styles.selectedDayContainer,
        ]}>
        <Text
          style={[
            styles.dayText,
            state === 'disabled' && styles.disabledText,
            isSelected && styles.selectedDayText,
          ]}>
          {date.day}
        </Text>

        {/* 3개 초과하는 기록이 있을 경우에만 +N 뱃지 표시 */}
        {hasWeights && weights.length > 3 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>+{weights.length - 3}</Text>
          </View>
        )}

        {/* 체중 기록 목록 */}
        {hasWeights && (
          <View style={styles.weightsContainer}>
            {weights.slice(0, 3).map((weight, index) => (
              <View
                key={index}
                style={[
                  styles.weightBox,
                  {backgroundColor: getStatusColor(weight.case)},
                ]}>
                <Text
                  style={[
                    styles.weightText,
                    isSelected && styles.selectedDayText,
                  ]}>
                  {weight.weight.toFixed(1)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: 75,
    padding: 2,
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 4,
    paddingVertical: 4,
  },
  selectedDayContainer: {
    backgroundColor: '#4ecdc4',
    width: '100%',
    height: '100%',
  },
  todayContainer: {
    borderWidth: 1,
    borderColor: '#4ecdc4',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0d1b1a',
    marginBottom: 2,
  },
  disabledText: {
    color: '#99a3a2',
  },
  selectedDayText: {
    color: '#0d1b1a',
    fontWeight: '600',
  },
  weightsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 1,
    paddingHorizontal: 2,
    paddingTop: 1,
  },
  weightBox: {
    width: '100%',
    paddingVertical: 1,
    borderRadius: 2,
    alignItems: 'center',
  },
  weightText: {
    fontSize: 10,
    color: '#0d1b1a',
  },
  countBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(78, 205, 196, 0.8)',
    borderRadius: 6,
    minWidth: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  countText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '600',
  },
});

export default CustomDay;
