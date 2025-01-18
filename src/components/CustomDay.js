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
            {weights.length > 3 && (
              <Text
                style={[styles.moreText, isSelected && styles.selectedDayText]}>
                +{weights.length - 3}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 85, // 높이 증가
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
    fontSize: 14,
    fontWeight: '500',
    color: '#0d1b1a',
    marginBottom: 4,
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
    gap: 2,
    paddingHorizontal: 2,
  },
  weightBox: {
    width: '100%',
    paddingVertical: 2,
    borderRadius: 3,
    alignItems: 'center',
  },
  weightText: {
    fontSize: 10,
    color: '#0d1b1a',
  },
  moreText: {
    fontSize: 9,
    color: '#666',
    marginTop: 1,
  },
});

export default CustomDay;
