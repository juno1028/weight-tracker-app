import React from 'react';
import {TouchableOpacity, Text, View, StyleSheet} from 'react-native';

const CustomDay = ({date, state, marking, onPress, weights}) => {
  const isSelected = marking?.selected;
  const isToday = state === 'today';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, isSelected && styles.selectedDayContainer]}
      activeOpacity={0.7}>
      <View style={[styles.dayContainer, isToday && styles.todayContainer]}>
        <Text
          style={[
            styles.dayText,
            state === 'disabled' && styles.disabledText,
            isSelected && styles.selectedDayText,
          ]}>
          {date.day}
        </Text>

        {weights && weights.length > 0 && (
          <View style={styles.weightsContainer}>
            {weights
              .slice(-3)
              .reverse()
              .map((weight, index) => (
                <Text
                  key={index}
                  style={[
                    styles.weightText,
                    isSelected && styles.selectedWeightText,
                  ]}>
                  {weight.toFixed(1)}kg
                </Text>
              ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayContainer: {
    width: 36,
    height: 45,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayContainer: {
    backgroundColor: '#50cebb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  todayContainer: {
    borderColor: '#00adf5',
    borderWidth: 1,
  },
  dayText: {
    color: '#333',
  },
  disabledText: {
    color: 'gray',
  },
  selectedDayText: {
    color: 'white',
  },
  weightsContainer: {
    alignItems: 'center',
    marginTop: 2,
  },
  weightText: {
    fontSize: 9,
    color: 'gray',
    lineHeight: 11,
  },
  selectedWeightText: {
    color: 'white',
  },
});

export default CustomDay;
