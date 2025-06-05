// src/screens/HomeScreen.js
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
import {useSubscription} from '../contexts/SubscriptionContext';
import {WEIGHT_CASES} from '../components/Modal/constants';
import AnimatedWeightCard from '../components/AnimatedWeightCard';
import {useTranslation} from 'react-i18next';

const HomeScreen = () => {
  const {t} = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {weightEntries, setWeightEntries} = useWeight();
  const {weight: userWeight, updateUserData} = useUser();
  const {isSubscribed, handlePurchase} = useSubscription();

  // Get today's date in YYYY-MM-DD format with timezone handling
  const getTodayFormatted = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize selectedDate with today's date
  const [selectedDate, setSelectedDate] = useState(getTodayFormatted());
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

  // Check if selected date is earlier than 3 months ago (for non-pro users)
  const isThreeMonthsRestricted = () => {
    if (isSubscribed) return false;

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.setHours(0, 0, 0, 0);

    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(0, 0, 0, 0);

    return selectedDateTime < threeMonthsAgo;
  };

  const handleAddPress = () => {
    const selectedDateTime = new Date(selectedDate);
    const todayDate = new Date();
    selectedDateTime.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);

    if (selectedDateTime > todayDate) {
      Alert.alert(t('homeScreen.dateError'), t('homeScreen.futureDateError'));
      return;
    }

    // Check for 3-month restriction
    // if (isThreeMonthsRestricted()) {
    //   showSubscriptionAlert();
    //   return;
    // }

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
    // Check for 3-month restriction
    // if (isThreeMonthsRestricted()) {
    //   showSubscriptionAlert();
    //   return;
    // }

    setEditingEntry(entry);
    setInitialModalWeight(entry.weight);
    setIsModalVisible(true);
  };

  const handleWeightComplete = async (
    selectedWeight,
    selectedTime,
    selectedCase,
  ) => {
    setIsModalVisible(false); // Close modal first
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
        Alert.alert(
          t('homeScreen.limitError'),
          t('homeScreen.entryLimitError'),
          [{text: t('common.ok')}],
        );
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
    // Check for 3-month restriction when changing date
    const selectedDate = day.dateString;
    const selectedDateTime = new Date(selectedDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.setHours(0, 0, 0, 0);

    // if (!isSubscribed && selectedDateTime < threeMonthsAgo) {
    //   showSubscriptionAlert();
    //   return;
    // }

    setSelectedDate(selectedDate);
  };

  // const showSubscriptionAlert = () => {
  //   Alert.alert(t('homeScreen.premium'), t('homeScreen.premiumRequired'), [
  //     {
  //       text: t('common.cancel'),
  //       style: 'cancel',
  //     },
  //     {
  //       text: t('homeScreen.upgrade'),
  //       onPress: handlePurchase,
  //     },
  //   ]);
  // };

  const handleUpgrade = () => {
    handlePurchase();
  };

  // Get case name based on translation
  const getCaseLabel = caseId => {
    const caseItem = Object.values(WEIGHT_CASES).find(c => c.id === caseId);
    return caseItem ? t(`weightCases.${caseId}`) : t('weightCases.none');
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
    return `${hours}:${minutes}`;
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
        <AnimatedWeightCard
          key={entry.timestamp}
          entry={entry}
          backgroundColor={caseBgColor}
          textColor={textColor}
          formatTime={formatTime}
          getCaseLabel={getCaseLabel}
          onPress={() => handleEditPress(entry)}
        />
      );
    });
  };

  // Check if selected date is in the future
  const isSelectedDateInFuture = () => {
    const selectedDateTime = new Date(selectedDate);
    const todayDate = new Date();
    selectedDateTime.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);
    return selectedDateTime > todayDate;
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
            isSubscribed={isSubscribed}
          />
        </View>

        {/* Weight List Section */}
        <View style={styles.weightCardsSection}>
          {selectedEntries.length > 0 ? (
            renderWeightCards()
          ) : !isSelectedDateInFuture() ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataTitle}>
                {t('homeScreen.noDataTitle')}
              </Text>
              <Text style={styles.noDataSubtitle}>
                {t('homeScreen.noDataSubtitle')}
              </Text>
            </View>
          ) : null}
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
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noDataSubtitle: {
    fontSize: 16,
    color: '#999',
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
