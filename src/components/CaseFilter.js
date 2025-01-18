import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {CASE_COLORS} from '../constants/colors';

const CaseFilter = ({selectedCases, onToggleCase}) => {
  return (
    <View style={styles.container}>
      {Object.entries(CASE_COLORS).map(([caseId, caseInfo]) => (
        <TouchableOpacity
          key={caseId}
          style={[
            styles.filterButton,
            {backgroundColor: caseInfo.background},
            selectedCases.includes(caseId) && styles.selectedButton,
          ]}
          onPress={() => onToggleCase(caseId)}>
          <Text
            style={[
              styles.filterText,
              selectedCases.includes(caseId) && styles.selectedText,
            ]}>
            {caseInfo.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedButton: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  selectedText: {
    color: '#0d1b1a',
  },
});

export default CaseFilter;
