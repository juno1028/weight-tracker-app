// src/components/Modal/WeightPicker.js
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {COLORS, COMMON_STYLES, DIMENSIONS} from './styles';

const WeightPicker = ({selectedWeight, onWeightChange}) => {
  const weightValues = Array.from({length: 1201}, (_, i) => ({
    value: (i + 300) / 10,
    label: ((i + 300) / 10).toFixed(1),
  }));

  return (
    <View style={COMMON_STYLES.pickerSide}>
      <View style={styles.centerIndicator} />
      <Picker
        style={styles.weightPicker}
        selectedValue={selectedWeight}
        onValueChange={onWeightChange}
        itemStyle={COMMON_STYLES.pickerItem}>
        {weightValues.map(({value, label}) => (
          <Picker.Item
            key={value}
            label={label}
            value={value}
            color={COLORS.white}
          />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  weightPicker: {
    width: '100%',
  },
  centerIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.indicator,
    zIndex: 1,
    transform: [{translateY: -1}],
  },
});

export default WeightPicker;
