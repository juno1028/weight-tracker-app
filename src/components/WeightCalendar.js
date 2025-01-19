// src/components/WeightCalendar.js
import React, {useState} from 'react';
import {
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import {CalendarList} from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomDay from './CustomDay';
import {WEIGHT_CASES} from './Modal/constants';

const {width: screenWidth} = Dimensions.get('window');

const WeightCalendar = ({onDayPress, selectedDate, weightEntries}) => {
  // 모든 케이스를 기본적으로 활성화
  const [activeFilters, setActiveFilters] = useState(
    Object.values(WEIGHT_CASES).map(c => c.id),
  );

  const toggleFilter = filterId => {
    setActiveFilters(prev => {
      if (prev.includes(filterId)) {
        // 마지막 필터는 해제할 수 없음
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== filterId);
      }
      return [...prev, filterId];
    });
  };

  const getMarkedDates = () => {
    const markedDates = {};
    weightEntries.forEach(entry => {
      // 활성화된 필터에 해당하는 entry만 포함
      if (!activeFilters.includes(entry.case)) return;

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

    // weights 배열을 필터링된 상태로 정렬
    Object.keys(markedDates).forEach(date => {
      if (markedDates[date].weights) {
        markedDates[date].weights = markedDates[date].weights.filter(w =>
          activeFilters.includes(w.case),
        );
      }
    });

    return markedDates;
  };

  const getFilterBackgroundColor = caseId => {
    const isActive = activeFilters.includes(caseId);
    switch (caseId) {
      case 'empty_stomach':
        return isActive
          ? 'rgba(78, 205, 196, 0.15)'
          : 'rgba(78, 205, 196, 0.05)';
      case 'after_meal':
        return isActive
          ? 'rgba(255, 155, 155, 0.15)'
          : 'rgba(255, 155, 155, 0.05)';
      case 'after_workout':
        return isActive
          ? 'rgba(255, 183, 77, 0.15)'
          : 'rgba(255, 183, 77, 0.05)';
      default:
        return isActive
          ? 'rgba(200, 200, 200, 0.15)'
          : 'rgba(200, 200, 200, 0.05)';
    }
  };

  return (
    <View style={styles.container}>
      <CalendarList
        horizontal={true}
        pagingEnabled={true}
        calendarWidth={screenWidth}
        pastScrollRange={24}
        futureScrollRange={24}
        style={styles.calendar}
        current={selectedDate}
        onDayPress={onDayPress}
        markedDates={getMarkedDates()}
        firstDay={0}
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
          },
        }}
      />

      {/* 필터 버튼 섹션 */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          {Object.values(WEIGHT_CASES).map(caseItem => (
            <TouchableOpacity
              key={caseItem.id}
              style={[
                styles.filterButton,
                {
                  backgroundColor: getFilterBackgroundColor(caseItem.id),
                  borderColor: activeFilters.includes(caseItem.id)
                    ? '#666666'
                    : '#e0e0e0',
                },
              ]}
              onPress={() => toggleFilter(caseItem.id)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.filterText,
                  !activeFilters.includes(caseItem.id) &&
                    styles.inactiveFilterText,
                ]}>
                {caseItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  calendar: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  inactiveFilterText: {
    color: '#999',
  },
});

export default WeightCalendar;
