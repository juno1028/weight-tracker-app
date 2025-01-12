// src/components/DayWeightList.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const DayWeightList = ({selectedDate, weightEntries, onEditPress}) => {
  const dayEntries = weightEntries
    .filter(entry => entry.date === selectedDate)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (dayEntries.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {dayEntries.map((entry, index) => (
        <TouchableOpacity
          key={entry.timestamp}
          style={[styles.entryRow, index !== 0 && styles.borderTop]}
          onPress={() => onEditPress(entry)}>
          <Text style={styles.timeText}>
            {new Date(entry.timestamp).toLocaleTimeString()}
          </Text>
          <View style={styles.weightContainer}>
            <Text style={styles.weightText}>{entry.weight.toFixed(1)}kg</Text>
            {entry.case && <Text style={styles.caseText}>{entry.case}</Text>}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    alignItems: 'center',
    columnGap: 24,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#cce6e4',
  },
  timeText: {
    fontSize: 14,
    color: '#4a9691',
    width: '20%',
  },
  weightContainer: {
    flex: 1,
  },
  weightText: {
    fontSize: 14,
    color: '#0d1b1a',
  },
  caseText: {
    fontSize: 12,
    color: '#4a9691',
    marginTop: 4,
  },
});

export default DayWeightList;
