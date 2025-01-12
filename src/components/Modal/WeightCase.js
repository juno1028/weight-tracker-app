import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {COLORS} from './styles';
import {WEIGHT_CASES} from './constants';

const WeightCase = ({selectedCase, onSelectCase}) => {
  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        {Object.values(WEIGHT_CASES).map(caseItem => (
          <TouchableOpacity
            key={caseItem.id}
            style={[
              styles.button,
              selectedCase === caseItem.id && styles.selectedButton,
            ]}
            onPress={() => onSelectCase(caseItem.id)}>
            <Text
              style={[
                styles.buttonText,
                selectedCase === caseItem.id && styles.selectedButtonText,
              ]}>
              {caseItem.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    width: '48%', // 2개씩 배치
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: COLORS.white,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedButtonText: {
    color: COLORS.primary,
  },
});

export default WeightCase;
