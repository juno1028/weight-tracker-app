// src/components/UnitSelector.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';

const UnitSelector = ({currentUnit, onUnitChange}) => {
  const {t} = useTranslation();

  const handleUnitChange = async unit => {
    try {
      await AsyncStorage.setItem('measurementUnit', unit);
      onUnitChange(unit);
    } catch (error) {
      console.error('Failed to save unit preference:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('units.selectUnit')}:</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.unitButton,
            currentUnit === 'metric' && styles.activeUnitButton,
          ]}
          onPress={() => handleUnitChange('metric')}>
          <Text
            style={[
              styles.unitButtonText,
              currentUnit === 'metric' && styles.activeUnitButtonText,
            ]}>
            {t('units.metric')} (kg/cm)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.unitButton,
            currentUnit === 'imperial' && styles.activeUnitButton,
          ]}
          onPress={() => handleUnitChange('imperial')}>
          <Text
            style={[
              styles.unitButtonText,
              currentUnit === 'imperial' && styles.activeUnitButtonText,
            ]}>
            {t('units.imperial')} (lb/ft)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeUnitButton: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  unitButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeUnitButtonText: {
    color: '#fff',
  },
});

export default UnitSelector;
