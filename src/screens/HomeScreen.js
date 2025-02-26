import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import WeightCalendar from '../components/WeightCalendar';
import WeightInputModal from '../components/Modal';
import {useWeight} from '../contexts/WeightContext';
import {useUser} from '../contexts/UserContext';
import {WEIGHT_CASES} from '../components/Modal/constants';

const HomeScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {weightEntries, setWeightEntries} = useWeight();
  const {weight: userWeight, updateUserData} = useUser();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [editingEntry, setEditingEntry] = useState(null);
  const [initialModalWeight, setInitialModalWeight] = useState(67.5);
  const [selectedEntries, setSelectedEntries] = useState([]);

  // Update selected entries when date or weight entries change
  useEffect(() => {
    const entries = weightEntries.filter(entry => entry.date === selectedDate);
    setSelectedEntries(entries);
  }, [selectedDate, weightEntries]);

  const getInitialWeight = () => {
    if (editingEntry) return editingEntry.weight;
    if (weightEntries.length > 0) {
      const sortedEntries = [...weightEntries].sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date) || b.timestamp - a.timestamp,
      );
      return sortedEntries[0].weight;
    }
    return userWeight || 67.5;
  };

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
    setEditingEntry(null);
    setInitialModalWeight(getInitialWeight());
    setIsModalVisible(true);
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
    setInitialModalWeight(entry.weight);
    setIsModalVisible(true);
  };

  const handleWeightComplete = async (
    selectedWeight,
    selectedTime,
    selectedCase,
  ) => {
    setIsModalVisible(false); // 먼저 모달을 닫습니다.
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
      // UserContext의 weight 업데이트
      try {
        await updateUserData(null, selectedWeight.toString());
      } catch (error) {
        console.error('Failed to update user weight:', error);
      }
    }
  };

  const onDayPress = day => {
    setSelectedDate(day.dateString);
  };

  // Get case name in Korean
  const getCaseLabel = caseId => {
    const caseItem = Object.values(WEIGHT_CASES).find(c => c.id === caseId);
    return caseItem ? caseItem.label : '선택 안함';
  };

  // New functions for colors:
  const getStatusColor = weightCase => {
    switch (weightCase) {
      case 'empty_stomach':
        return '#007AFF1F'; // 공복 - translucent blue
      case 'after_meal':
        return '#34C7591F'; // 식사 후 - translucent green
      case 'after_workout':
        return '#FF95001F'; // 운동 후 - translucent orange
      default:
        return '#5856D61F'; // default - translucent purple
    }
  };

  const getTextColorForCase = weightCase => {
    switch (weightCase) {
      case 'empty_stomach':
        return '#007AFF'; // Blue for empty stomach
      case 'after_meal':
        return '#34C759'; // Green for after meal
      case 'after_workout':
        return '#FF9500'; // Orange for after workout
      default:
        return '#5856D6'; // Purple for default/not selected
    }
  };

  // Format time to show in the detail view
  const formatTime = timestamp => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    // const seconds = date.getSeconds().toString().padStart(2, '0');
    return `오후 ${hours}시 ${minutes}분`;
  };

  // Render the selected entry detail cards
  const renderWeightCards = () => {
    if (!selectedEntries || selectedEntries.length === 0) {
      return null;
    }
    // Sort entries by timestamp (newest first)
    const sortedEntries = [...selectedEntries].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
    return sortedEntries.map(entry => {
      const caseBgColor = getStatusColor(entry.case);
      const textColor = getTextColorForCase(entry.case);
      return (
        <TouchableOpacity
          key={entry.timestamp}
          style={[styles.weightCard, {backgroundColor: caseBgColor}]}
          onPress={() => handleEditPress(entry)}>
          <View style={styles.weightCardHeader}>
            <Text style={[styles.weightCaseText, {color: textColor}]}>
              {getCaseLabel(entry.case)}
            </Text>
            <Text style={styles.weightValue}>
              {entry.weight.toFixed(1)}{' '}
              <Text style={styles.weightUnit}>kg</Text>
            </Text>
          </View>
          <Text style={styles.weightTimeText}>
            {formatTime(entry.timestamp)}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
        <View style={styles.weightCardsSection}>{renderWeightCards()}</View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  calendarSection: {
    backgroundColor: 'white',
    width: '100%',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  weightCardsSection: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80, // Extra padding at bottom for FAB
  },
  weightCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  weightCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weightCaseText: {
    fontSize: 18,
    fontWeight: '600',
  },
  weightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  weightUnit: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#666',
  },
  weightTimeText: {
    fontSize: 14,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF9500',
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
