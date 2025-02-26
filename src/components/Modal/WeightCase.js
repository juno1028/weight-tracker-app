// src/components/Modal/WeightCase.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {WEIGHT_CASES} from './constants';

const WeightCase = ({selectedCase, onSelectCase}) => {
  const getStyle = caseId => {
    switch (caseId) {
      case 'empty_stomach':
        return {
          backgroundColor: selectedCase === caseId ? '#007AFF1F' : '#d9ebff',
          textColor: '#007AFF',
        };
      case 'after_meal':
        return {
          backgroundColor: selectedCase === caseId ? '#34C7591F' : '#e1f7e6',
          textColor: '#34C759',
        };
      case 'after_workout':
        return {
          backgroundColor: selectedCase === caseId ? '#FF95001F' : '#ffeed9',
          textColor: '#FF9500',
        };
      default:
        return {
          backgroundColor: selectedCase === caseId ? '#5856D61F' : '#e6e6f9',
          textColor: '#5856D6',
        };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        {Object.values(WEIGHT_CASES).map(caseItem => {
          const caseStyle = getStyle(caseItem.id);
          return (
            <TouchableOpacity
              key={caseItem.id}
              style={[
                styles.button,
                {
                  backgroundColor: caseStyle.backgroundColor,
                },
              ]}
              onPress={() => onSelectCase(caseItem.id)}
              activeOpacity={0.7}>
              <Text style={[styles.buttonText, {color: caseStyle.textColor}]}>
                {caseItem.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default WeightCase;
