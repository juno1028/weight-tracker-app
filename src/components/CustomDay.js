// src/components/CustomDay.js
import React from 'react';
import {TouchableOpacity, Text, View, StyleSheet} from 'react-native';

const getStatusColor = weightCase => {
  switch (weightCase) {
    case 'empty_stomach':
      return '#007AFF1F'; // 공복
    case 'after_meal':
      return '#34C7591F'; // 식사 후
    case 'after_workout':
      return '#FF95001F'; // 운동 후
    default:
      return '#5856D61F'; // 선택 안함
  }
};

const getTextColorForCase = weightCase => {
  switch (weightCase) {
    case 'empty_stomach':
      return '#007AFF'; // Blue for empty stomach (공복)
    case 'after_meal':
      return '#34C759'; // Green for after meal (식사 후)
    case 'after_workout':
      return '#FF9500'; // Orange for after workout (운동 후)
    default:
      return '#5856D6'; // Purple for default/not selected
  }
};

const CustomDay = ({date, state, marking, onPress, weights}) => {
  const isSelected = marking?.selected;
  const isToday = state === 'today';
  const hasWeights = weights && weights.length > 0;

  // Generate a lighter background for the date container when it has weights
  const dateBgColor = 'transparent';

  // Check if today's date should be highlighted (today is 18 in the screenshot)
  const isHighlightedToday = isToday && !isSelected;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}>
      <View
        style={[
          styles.dayContainer,
          {backgroundColor: dateBgColor},
          isSelected && styles.selectedDayContainer,
        ]}>
        <Text
          style={[
            styles.dayText,
            state === 'disabled' && styles.disabledText,
            isSelected && styles.selectedDayText,
            isHighlightedToday && styles.highlightedTodayText,
          ]}>
          {date.day}
        </Text>

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
                    {color: getTextColorForCase(weight.case)},
                    isSelected && styles.selectedWeightText,
                  ]}>
                  {weight.weight.toFixed(1)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 3개 초과하는 기록이 있을 경우에만 +N 뱃지 표시 */}
        {hasWeights && weights.length > 3 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>+{weights.length - 3}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 0.65,
    padding: 1,
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'top',
    borderRadius: 6,
    padding: 2,
    position: 'relative',
  },
  selectedDayContainer: {
    backgroundColor: '#FFE87940',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#555',
    marginBottom: 2,
    textAlign: 'center',
  },
  disabledText: {
    color: '#cccccc',
  },
  selectedDayText: {
    fontWeight: '500',
  },
  highlightedTodayText: {
    color: '#ff6b6b',
    fontWeight: '700',
  },
  weightsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
    paddingTop: 2,
  },
  weightBox: {
    width: '90%',
    paddingVertical: 1.5,
    paddingHorizontal: 2,
    borderRadius: 4,
    alignItems: 'center',
  },
  weightText: {
    fontSize: 11,
    fontWeight: '500',
  },
  selectedWeightText: {
    fontWeight: '600',
  },
  countBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF9500',
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  countText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '600',
  },
});

export default CustomDay;
