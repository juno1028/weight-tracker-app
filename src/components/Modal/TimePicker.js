import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {COLORS, COMMON_STYLES, DIMENSIONS} from './styles';

const TimePicker = ({selectedHour, selectedMinute, onTimeChange}) => {
  const hours = Array.from({length: 24}, (_, i) => i);
  const minutes = Array.from({length: 60}, (_, i) => i);

  return (
    <View style={COMMON_STYLES.pickerSide}>
      <View style={styles.timePickerContainer}>
        <Picker
          style={styles.timePicker}
          selectedValue={selectedHour}
          onValueChange={itemValue => onTimeChange(itemValue, selectedMinute)}
          itemStyle={COMMON_STYLES.pickerItem}>
          {hours.map(hour => (
            <Picker.Item
              key={hour}
              label={hour.toString().padStart(2, '0')}
              value={hour}
              color={COLORS.white}
            />
          ))}
        </Picker>
        <Text style={styles.timeSeparator}>:</Text>
        <Picker
          style={styles.timePicker}
          selectedValue={selectedMinute}
          onValueChange={itemValue => onTimeChange(selectedHour, itemValue)}
          itemStyle={COMMON_STYLES.pickerItemCustom}>
          {minutes.map(minute => (
            <Picker.Item
              key={minute}
              label={minute.toString().padStart(2, '0')}
              value={minute}
              color={COLORS.white}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePicker: {
    width: DIMENSIONS.pickerWidth,
    height: DIMENSIONS.pickerHeight,
  },
  pickerItemCustom: {
    width: DIMENSIONS.pickerWidth,
    marginHorizontal: 0,
    padding: 0,
    fontSize: 20,
  },
  timeSeparator: {
    color: COLORS.white,
    fontSize: 24,
    paddingHorizontal: 5,
  },
});

export default TimePicker;
