// src/components/WeightCalendar.js
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Calendar} from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomDay from './CustomDay';

const WeightCalendar = ({onDayPress, selectedDate, weightEntries}) => {
  const getMarkedDates = () => {
    const markedDates = {};
    weightEntries.forEach(entry => {
      if (!markedDates[entry.date]) {
        markedDates[entry.date] = {
          marked: true,
          weights: [entry.weight],
        };
      } else {
        markedDates[entry.date].weights.push(entry.weight);
      }
    });

    if (selectedDate) {
      markedDates[selectedDate] = {
        ...(markedDates[selectedDate] || {}),
        selected: true,
      };
    }

    return markedDates;
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={onDayPress}
        markedDates={getMarkedDates()}
        firstDay={0}
        enableSwipeMonths={true}
        renderArrow={direction => (
          <View style={styles.arrowContainer}>
            <Icon
              name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
              size={18}
              color="#0d1b1a"
            />
          </View>
        )}
        dayComponent={({date, state, marking}) => (
          <CustomDay
            date={date}
            state={state}
            marking={marking}
            onPress={() => onDayPress(date)}
            weights={marking?.weights}
          />
        )}
        theme={{
          calendarBackground: '#f1f8f8',
          monthTextColor: '#0d1b1a',
          textMonthFontWeight: 'bold',
          textMonthFontSize: 16,
          textDayHeaderFontWeight: 'bold',
          textDayHeaderFontSize: 13,
          'stylesheet.calendar.header': {
            header: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 4,
              paddingVertical: 4,
            },
            monthText: {
              fontSize: 16,
              fontWeight: 'bold',
              color: '#0d1b1a',
            },
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 288,
    maxWidth: 336,
    flex: 1,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WeightCalendar;
