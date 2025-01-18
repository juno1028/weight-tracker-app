// src/components/DayWeightList.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const getStatusStyle = weightCase => {
  switch (weightCase) {
    case 'empty_stomach':
      return {
        backgroundColor: 'rgba(78, 205, 196, 0.15)', // 민트색
        text: '공복',
      };
    case 'after_meal':
      return {
        backgroundColor: 'rgba(255, 155, 155, 0.15)', // 연한 빨강
        text: '식사 후',
      };
    case 'after_workout':
      return {
        backgroundColor: 'rgba(255, 183, 77, 0.15)', // 연한 주황
        text: '운동 후',
      };
    default:
      return {
        backgroundColor: 'rgba(200, 200, 200, 0.15)', // 연한 회색
        text: '선택 안함',
      };
  }
};

const DayWeightList = ({selectedDate, weightEntries, onEditPress}) => {
  const dayEntries = weightEntries
    .filter(entry => entry.date === selectedDate)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (dayEntries.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {dayEntries.map((entry, index) => {
        const statusStyle = getStatusStyle(entry.case);
        return (
          <TouchableOpacity
            key={entry.timestamp}
            style={[styles.entryRow, index !== 0 && styles.borderTop]}
            onPress={() => onEditPress(entry)}>
            <Text style={styles.timeText}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </Text>
            <View style={styles.weightContainer}>
              <Text style={styles.weightText}>{entry.weight.toFixed(1)}kg</Text>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: statusStyle.backgroundColor},
                ]}>
                <Text style={styles.statusText}>{statusStyle.text}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#333',
  },
});

export default DayWeightList;
