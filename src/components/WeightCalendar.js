// src/components/WeightCalendar.js
import React from 'react';
import {Dimensions, View, StyleSheet, Platform} from 'react-native';
import {CalendarList} from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomDay from './CustomDay';

const {width: screenWidth} = Dimensions.get('window');

const WeightCalendar = ({onDayPress, selectedDate, weightEntries}) => {
  const getMarkedDates = () => {
    const markedDates = {};
    weightEntries.forEach(entry => {
      if (!markedDates[entry.date]) {
        markedDates[entry.date] = {
          marked: true,
          weights: [{weight: entry.weight, case: entry.case}],
        };
      } else {
        markedDates[entry.date].weights.push({
          weight: entry.weight,
          case: entry.case,
        });
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
      <CalendarList
        horizontal={true}
        pagingEnabled={true}
        calendarWidth={screenWidth} // 달력 너비 설정
        pastScrollRange={60}
        futureScrollRange={60}
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
        current={selectedDate}
        onDayPress={onDayPress}
        markedDates={getMarkedDates()}
        firstDay={0}
        // enableSwipeMonths={true}
        // scrollEnabled 속성은 horizontal + pagingEnabled 설정 시 기본적으로 작동합니다.
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
          calendarBackground: 'white',
          monthTextColor: '#0d1b1a',
          textMonthFontWeight: 'bold',
          textMonthFontSize: 16,
          textDayHeaderFontWeight: 'bold',
          textDayHeaderFontSize: 13,
          'stylesheet.calendar.main': {
            container: {
              padding: 0,
            },
            week: {
              marginTop: 2,
              marginBottom: 2,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 0,
            },
            dayContainer: {
              flex: 1,
              marginHorizontal: 0,
            },
          },
          'stylesheet.calendar.header': {
            header: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 10,
              paddingVertical: 10,
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
    width: '100%',
    // paddingHorizontal: 16,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WeightCalendar;
