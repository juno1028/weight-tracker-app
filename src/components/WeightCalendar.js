// src/components/WeightCalendar.js
import React, {useState, useRef, useEffect} from 'react';
import {
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
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

const WeightCalendar = ({
  onDayPress,
  selectedDate,
  weightEntries,
  onMonthChange,
  isSubscribed,
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
      // Check for 3-month restriction
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      threeMonthsAgo.setDate(1); // First day of that month

      newDate.setMonth(newDate.getMonth() - 1);

      if (!isSubscribed && newDate < threeMonthsAgo) {
        showSubscriptionAlert();
        return;
      }
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

  const showSubscriptionAlert = () => {
    Alert.alert(
      '프리미엄 기능',
      '3개월 이전의 데이터는 프리미엄 회원만 이용할 수 있습니다.',
      [
        {
          text: '확인',
          style: 'cancel',
        },
      ],
    );
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
        return isActive ? '#007AFF66' : '#007AFF33';
      case 'after_meal':
        return isActive ? '#34C75966' : '#34C75933';
      case 'after_workout':
        return isActive ? '#FF950066' : '#FF950033';
      default:
        return isActive ? '#5856D666' : '#5856D633';
    }
  };

  const getTextColorForCase = caseId => {
    const isActive = activeFilters.includes(caseId);
    switch (caseId) {
      case 'empty_stomach':
        return isActive ? '#007AFF' : '#99C2FF';
      case 'after_meal':
        return isActive ? '#34C759' : '#A8E9BC';
      case 'after_workout':
        return isActive ? '#FF9500' : '#FFCB80';
      default:
        return isActive ? '#5856D6' : '#BEBDEA';
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
        onDayPress={day => {
          // Check for 3-month restriction
          const selectedDate = day.dateString;
          const selectedDateTime = new Date(selectedDate);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          threeMonthsAgo.setHours(0, 0, 0, 0);

          if (!isSubscribed && selectedDateTime < threeMonthsAgo) {
            showSubscriptionAlert();
            return;
          }

          onDayPress(day);
        }}
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
            onPress={() => {
              // Check 3-month restriction here too
              const selectedDate = date.dateString;
              const selectedDateTime = new Date(selectedDate);
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              threeMonthsAgo.setHours(0, 0, 0, 0);

              if (!isSubscribed && selectedDateTime < threeMonthsAgo) {
                showSubscriptionAlert();
                return;
              }

              onDayPress({...date, dateString: date.dateString});
            }}
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
          // Check 3-month restriction for month changes via swipe
          const newDate = new Date(month.dateString);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          threeMonthsAgo.setDate(1); // First day of that month

          if (!isSubscribed && newDate < threeMonthsAgo) {
            // Scroll back to allowed date
            const allowedDate = new Date(threeMonthsAgo);
            if (calendarRef.current && calendarRef.current.scrollToMonth) {
              calendarRef.current.scrollToMonth(allowedDate);
            }
            showSubscriptionAlert();
            return;
          }

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
            const isActive = activeFilters.includes(caseItem.id);
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
                <Text
                  style={[
                    styles.filterText,
                    {color: getTextColorForCase(caseItem.id)},
                  ]}>
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
