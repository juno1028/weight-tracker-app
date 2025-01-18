// src/screens/HomeScreen.js
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
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
  const [initialModalWeight, setInitialModalWeight] = useState(67.5);

  const handleAddPress = () => {
    const selectedDateTime = new Date(selectedDate);
    const today = new Date();
    selectedDateTime.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDateTime > today) {
      Alert.alert(
        '날짜 확인',
        '혹시 미래에서 오셨나요? 😅\n오늘 이후의 날짜는 입력할 수 없습니다.',
      );
      return;
    }

    const sortedEntries = [...weightEntries].sort(
      (a, b) =>
        new Date(b.date) - new Date(a.date) || b.timestamp - a.timestamp,
    );
    const initialWeight =
      sortedEntries.length > 0 ? sortedEntries[0].weight : 67.5;

    setEditingEntry(null);
    setIsModalVisible(true);
    setInitialModalWeight(initialWeight);
  };

  const handleDeleteEntry = async entry => {
    const updatedEntries = weightEntries.filter(
      item => item.timestamp !== entry.timestamp,
    );
    setWeightEntries(updatedEntries);
    setIsModalVisible(false);
  };

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

  const onDayPress = day => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <Text style={styles.headerTitle}>체중 캘린더</Text>
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

      <WeightInputModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingEntry(null);
        }}
        onComplete={handleWeightComplete}
        onDelete={handleDeleteEntry}
        editingEntry={editingEntry}
        initialWeight={initialModalWeight}
        initialTime={
          editingEntry ? new Date(editingEntry.timestamp) : new Date()
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddPress}
        activeOpacity={0.8}>
        <Icon name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>
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
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d1b1a',
    marginVertical: 10,
    paddingLeft: 20,
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
