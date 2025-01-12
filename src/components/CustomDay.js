// src/components/CustomDay.js
import React from 'react';
import {TouchableOpacity, Text, View, StyleSheet} from 'react-native';

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
        {hasWeights && weights.length > 0 && (
          <Text style={styles.weightText}>
            {weights[weights.length - 1].toFixed(1)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayContainer: {
    width: 36,
    height: 45,
    alignItems: 'center',
    paddingTop: 4,
    borderRadius: 4,
  },
  selectedDayContainer: {
    backgroundColor: '#4ecdc4',
  },
  todayContainer: {
    borderWidth: 1,
    borderColor: '#4ecdc4',
  },
  dayText: {
    fontSize: 14,
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
  weightText: {
    fontSize: 9,
    color: '#4a9691',
    marginTop: 1,
  },
});

export default CustomDay;
