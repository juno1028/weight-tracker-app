// src/components/WeightCalendar.js
import React, {useState, useRef, useEffect} from 'react';
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

// Custom component for weekday headers
const CustomWeekdaysHeader = () => {
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  return (
    <View style={styles.weekdaysContainer}>
      {weekDays.map((day, index) => (
        <Text key={index} style={styles.weekdayText}>
          {day}
        </Text>
      ))}
    </View>
  );
};

// Helper: Returns the opaque base color for a given filter case
const getSolidFilterColor = caseId => {
  switch (caseId) {
    case 'empty_stomach':
      return '#007AFF';
    case 'after_meal':
      return '#34C759';
    case 'after_workout':
      return '#FF9500';
    default:
      return '#5856D6';
  }
};

const WeightCalendar = ({
  onDayPress,
  selectedDate,
  weightEntries,
  onMonthChange,
}) => {
  // 모든 케이스를 기본적으로 활성화
  const [activeFilters, setActiveFilters] = useState(
    Object.values(WEIGHT_CASES).map(c => c.id),
  );
  const [pressedFilter, setPressedFilter] = useState(null);
  const calendarRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Set initial date when component mounts
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  const handleMonthChange = direction => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    if (calendarRef.current && calendarRef.current.scrollToMonth) {
      calendarRef.current.scrollToMonth(newDate);
    }
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  };

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

  const handlePressIn = filterId => {
    setPressedFilter(filterId);
  };

  const handlePressOut = () => {
    setPressedFilter(null);
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

  // Use RGBA for the background with transparency, then use the opaque version for border and text.
  const getFilterBackgroundColor = caseId => {
    const isActive = activeFilters.includes(caseId);
    switch (caseId) {
      case 'empty_stomach':
        return isActive ? 'rgba(0,122,255,0.15)' : 'rgba(0,122,255,0.05)';
      case 'after_meal':
        return isActive ? 'rgba(52,199,89,0.15)' : 'rgba(52,199,89,0.05)';
      case 'after_workout':
        return isActive ? 'rgba(255,149,0,0.15)' : 'rgba(255,149,0,0.05)';
      default:
        return isActive ? 'rgba(88,86,214,0.15)' : 'rgba(88,86,214,0.05)';
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.headerLayoutContainer}>
        {/* Date display */}
        <View style={styles.customHeaderContainer}>
          <Text style={styles.yearText}>{currentDate.getFullYear()}년</Text>
          <Text style={styles.monthText}>{currentDate.getMonth() + 1}월</Text>
        </View>
        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.arrowContainer}
            onPress={() => handleMonthChange('prev')}>
            <Icon name="chevron-left" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.arrowContainer}
            onPress={() => handleMonthChange('next')}>
            <Icon name="chevron-right" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Weekdays Header */}
      <CustomWeekdaysHeader />

      {/* Calendar */}
      <CalendarList
        ref={calendarRef}
        horizontal
        pagingEnabled
        calendarWidth={screenWidth}
        pastScrollRange={24}
        futureScrollRange={24}
        style={styles.calendar}
        current={currentDate}
        onDayPress={onDayPress}
        markedDates={getMarkedDates()}
        firstDay={0} // Start with Sunday
        hideArrows // Hide default arrows
        hideExtraDays
        enableSwipeMonths={false}
        dayComponent={({date, state, marking}) => (
          <CustomDay
            date={date}
            state={state}
            marking={marking}
            onPress={() => onDayPress(date)}
            weights={marking?.weights}
          />
        )}
        renderHeader={() => null} // Hide default header
        theme={{
          calendarBackground: 'white',
          'stylesheet.calendar.header': {
            header: {
              height: 0,
              opacity: 0, // Hide default header completely
            },
            dayHeader: {
              height: 0,
              opacity: 0, // Hide default weekdays completely
            },
          },
          'stylesheet.calendar.main': {
            container: {
              padding: 0,
            },
            week: {
              marginTop: 2,
              marginBottom: 2,
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingHorizontal: 0,
            },
          },
        }}
        onMonthChange={month => {
          setCurrentDate(new Date(month.dateString));
          if (onMonthChange) {
            onMonthChange(new Date(month.dateString));
          }
        }}
      />

      {/* 필터 버튼 섹션 */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          {Object.values(WEIGHT_CASES).map(caseItem => {
            const isPressed = pressedFilter === caseItem.id;
            const solidColor = getSolidFilterColor(caseItem.id);
            return (
              <TouchableOpacity
                key={caseItem.id}
                style={[
                  styles.filterButton,
                  isPressed && styles.filterButtonPressed,
                  {
                    backgroundColor: getFilterBackgroundColor(caseItem.id),
                  },
                ]}
                onPressIn={() => handlePressIn(caseItem.id)}
                onPressOut={handlePressOut}
                onPress={() => toggleFilter(caseItem.id)}
                activeOpacity={0.8}>
                <Text style={[styles.filterText, {color: solidColor}]}>
                  {caseItem.label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLayoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customHeaderContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  yearText: {
    fontSize: 16,
    color: '#BBB',
    fontWeight: '500',
    marginBottom: 4,
  },
  monthText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 7,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  weekdayText: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    width: screenWidth / 7,
  },
  filterContainer: {
    padding: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  filterButtonPressed: {
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default WeightCalendar;
