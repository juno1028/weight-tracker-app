import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

const DayWeightList = ({selectedDate, weightEntries}) => {
  const dayEntries = weightEntries
    .filter(entry => entry.date === selectedDate)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (dayEntries.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.dateTitle}>{selectedDate} 기록</Text>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>시간</Text>
          <Text style={styles.headerText}>체중 (kg)</Text>
        </View>
        {dayEntries.map((entry, index) => (
          <View
            key={index}
            style={[
              styles.row,
              index % 2 === 0 ? styles.evenRow : styles.oddrow,
            ]}>
            <Text style={styles.timeText}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </Text>
            <Text style={styles.weightText}>{entry.weight.toFixed(1)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dateTitme: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  scrollContainer: {
    maxHeight: 200,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  evenRow: {
    backgroundColor: '#f8f9fa',
  },
  oddRow: {
    backgroundColor: 'white',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  weightText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

export default DayWeightList;
