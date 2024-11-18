import React from 'react';
import {TouchableOpacity, Text, View, StyleSheet} from 'react-native';

const CustomDay = ({date, state, marking, onPress, weight}) => {
  const isSelected = marking?.selected;
  const isToday = state === 'today';

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View
        style={[
          styles.dayContainer,
          isSelected && styles.selectedDayCotainer,
          isToday && styles.todayContainer,
        ]}>
        <Text
          style={[
            styles.dayText,
            state === 'disabled' && styles.disabledText,
            isSelected && styles.selectedDayText,
          ]}>
          {date.day}
        </Text>
      </View>
      {weight && <Text style={styles.weightText}>{weight.toFixed(1)}kg</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {alignItems: 'center', justifyContent: 'center'},
  dayContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayContainer: {
    backgroundColor: '#50cebb',
  },
  todayContainer: {
    borderColor: '#00adf5',
    borderWidth: 1,
  },
  dayText: {
    color: 'black',
  },
  disabledText: {
    color: 'gray',
  },
  selectedDayText: {
    color: 'blue',
  },
  weightText: {
    fontSize: 10,
    color: 'gray',
    marginTop: 2,
  },
});

export default CustomDay;
