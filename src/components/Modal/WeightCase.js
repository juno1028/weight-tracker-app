// src/components/Modal/WeightCase.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {WEIGHT_CASES} from './constants';

const WeightCase = ({selectedCase, onSelectCase}) => {
  const getStyle = caseId => {
    switch (caseId) {
      case 'empty_stomach':
        return {
          backgroundColor: selectedCase === caseId ? '#E8F7F4' : 'transparent',
          borderColor: '#4ECDC4',
          textColor: selectedCase === caseId ? '#4ECDC4' : '#333',
        };
      case 'after_meal':
        return {
          backgroundColor: selectedCase === caseId ? '#FFF8F8' : 'transparent',
          borderColor: '#FF9B9B',
          textColor: selectedCase === caseId ? '#FF6B6B' : '#333',
        };
      case 'after_workout':
        return {
          backgroundColor: selectedCase === caseId ? '#FFF9F5' : 'transparent',
          borderColor: '#FFB74D',
          textColor: selectedCase === caseId ? '#FF9800' : '#333',
        };
      default:
        return {
          backgroundColor: selectedCase === caseId ? '#F8F9FA' : 'transparent',
          borderColor: '#DDD',
          textColor: selectedCase === caseId ? '#666' : '#333',
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
                  borderColor: caseStyle.borderColor,
                },
              ]}
              onPress={() => onSelectCase(caseItem.id)}>
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
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: 'white',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WeightCase;
