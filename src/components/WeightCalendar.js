import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {CalendarList} from 'react-native-calendars';
import CustomDay from './CustomDay';

const WeightCalendar = ({onDayPress, selectedDate, weightEntries}) => {
  const getMarkedDates = () => {
    const markedDates = {};
    weightEntries.forEach(entry => {
      markedDates[entry.date] = {marked: true, dotColor: '#50cebb'};
    });
    return markedDates;
  };

  return (
    <View style={styles.calendarContainer}>
      <CalendarList
        current={selectedDate}
        onDayPress={onDayPress}
        markedDates={{
          ...getMarkedDates(),
          [selectedDate]: {
            selected: true,
            marked: getMarkedDates()[selectedDate]?.marked,
            selectedColor: '#50cebb',
          },
        }}
        theme={{
          selectedDayBackgroundColor: '#50cebb',
          todayTextColor: '#00adf5',
          arrowColor: '$50cebb',
        }}
        // 달력 좌우 스크롤 관련 속성 추가
        horizontal={true} // 가로 스크롤 활성화
        pagingEnabled={true} // 페이지 단위로 스크롤
        calendarWidth={Dimensions.get('window').width - 20} // 좌우 패딩 고려
        pastScrollRange={50} // 과거 몇 개월까지 스크롤 가능한지
        futureScrollRange={50} // 미래 몇 개월까지 스크롤 가능한지
        scrollEnabled={true} // 스크롤 활성화
        showScrollIndicator={false} // 스크롤 활성화
        dayComponent={({date, state, marking, onPress}) => {
          const dateString = date.dateString;
          const entries = weightEntries.filter(
            entry => entry.date === dateString,
          );
          const weights = entries.map(entry => entry.weight);

          return (
            <CustomDay
              date={date}
              state={state}
              marking={marking}
              onPress={() => {
                onPress();
                onDayPress({dateString});
              }}
              weights={weights}
            />
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 0,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default WeightCalendar;
