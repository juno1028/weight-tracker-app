// src/screens/HomeScreen.js
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import WeightCalendar from '../components/WeightCalendar';
import DayWeightList from '../components/DayWeightList';
import WeightInputModal from '../components/Modal';
import {useWeight} from '../contexts/WeightContext';

const HomeScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {weightEntries, setWeightEntries} = useWeight();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [editingEntry, setEditingEntry] = useState(null);

  const handleEditPress = entry => {
    setEditingEntry(entry);
    setIsModalVisible(true);
  };

  const handleWeightComplete = (selectedWeight, selectedTime, selectedCase) => {
    if (editingEntry) {
      const updatedEntries = weightEntries.map(entry =>
        entry.timestamp === editingEntry.timestamp
          ? {
              ...entry,
              weight: selectedWeight,
              timestamp: selectedTime.getTime(),
              case: selectedCase,
            }
          : entry,
      );

      setWeightEntries(updatedEntries);
      setEditingEntry(null);
    } else {
      const existingEntries = weightEntries.filter(
        entry => entry.date === selectedDate,
      );

      if (existingEntries.length >= 5) {
        Alert.alert('입력 제한', '하루에 최대 5개까지 기록할 수 있습니다.', [
          {text: '확인'},
        ]);
        setIsModalVisible(false);
        return;
      }

      const newEntry = {
        date: selectedDate,
        weight: selectedWeight,
        timestamp: selectedTime.getTime(),
        case: selectedCase,
      };

      const updatedEntries = [...weightEntries, newEntry].sort(
        (a, b) =>
          new Date(a.date) - new Date(b.date) || b.timestamp - a.timestamp,
      );

      setWeightEntries(updatedEntries);
    }
    setIsModalVisible(false);
  };

  const getInitialWeight = () => {
    if (editingEntry) {
      return editingEntry.weight;
    }
    const todayEntries = weightEntries.filter(
      entry => entry.date === selectedDate,
    );
    return todayEntries.length > 0
      ? todayEntries[todayEntries.length - 1].weight
      : 67.5;
  };

  const onDayPress = day => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <WeightCalendar
            onDayPress={onDayPress}
            selectedDate={selectedDate}
            weightEntries={weightEntries}
          />
        </View>

        {/* Weight List Section */}
        <View style={styles.listSection}>
          <DayWeightList
            selectedDate={selectedDate}
            weightEntries={weightEntries}
            onEditPress={handleEditPress}
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingEntry(null);
          setIsModalVisible(true);
        }}
        activeOpacity={0.8}>
        <Icon name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>

      <WeightInputModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingEntry(null);
        }}
        onComplete={handleWeightComplete}
        initialWeight={getInitialWeight()}
        initialTime={
          editingEntry ? new Date(editingEntry.timestamp) : new Date()
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f8f8',
  },
  container: {
    flex: 1,
  },
  calendarSection: {
    backgroundColor: '#f1f8f8',
    paddingTop: 60,
    width: '100%',
    alignItems: 'center',
  },
  listSection: {
    flex: 1,
    backgroundColor: '#f1f8f8',
    paddingTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4ecdc4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HomeScreen;
