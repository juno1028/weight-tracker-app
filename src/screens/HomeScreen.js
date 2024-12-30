// src/screens/HomeScreen.js
import React, {useState, useEffect} from 'react';
import {View, StyleSheet, TouchableOpacity, Modal, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WeightCalendar from '../components/WeightCalendar';
import DayWeightList from '../components/DayWeightList';
import WeightPicker from '../components/WeightPicker';

const HomeScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [weightEntries, setWeightEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );

  useEffect(() => {
    loadWeightEntries();
  }, []);

  const loadWeightEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('weightEntries');
      if (storedEntries !== null) {
        setWeightEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error('Failed to load weight entries:', error);
    }
  };

  const saveWeightEntries = async entries => {
    try {
      await AsyncStorage.setItem('weightEntries', JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save weight entries:', error);
    }
  };

  const handleWeightComplete = selectedWeight => {
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
      timestamp: new Date().getTime(),
    };

    const updatedEntries = [...weightEntries, newEntry].sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date) || b.timestamp - a.timestamp, // 같은 날짜면 최신 기록이 위로
    );

    setWeightEntries(updatedEntries);
    saveWeightEntries(updatedEntries);
    setIsModalVisible(false);
  };

  // 초기 체중값 계산 (오늘 날짜의 마지막 기록 또는 기본값)
  const getInitialWeight = () => {
    const todayEntries = weightEntries.filter(
      entry => entry.date === selectedDate,
    );
    if (todayEntries.length > 0) {
      return todayEntries[todayEntries.length - 1].weight;
    }
    return 67.5; // 기본값
  };

  return (
    <View style={styles.container}>
      <WeightCalendar
        onDayPress={day => setSelectedDate(day.dateString)}
        selectedDate={selectedDate}
        weightEntries={weightEntries}
      />

      <DayWeightList
        selectedDate={selectedDate}
        weightEntries={weightEntries}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}>
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}>
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}>
            <WeightPicker
              initialWeight={getInitialWeight()}
              onComplete={handleWeightComplete}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 10,
    backgroundColor: '#F5FCFF',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#50cebb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
  },
});

export default HomeScreen;
