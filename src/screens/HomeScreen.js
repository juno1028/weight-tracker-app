import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LineChart} from 'react-native-chart-kit';
import {Calendar} from 'react-native-calendars';
import CustomDay from '../components/CustomDay';

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weight, setWeight] = useState('');
  const [weightEntries, setWeightEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );

  useEffect(() => {
    loadWeightEntries();
  }, []);

  useEffect(() => {
    const entry = weightEntries.find(entry => entry.date === selectedDate);
    if (entry) {
      setWeight(entry.weight.toString());
    } else {
      setWeight('');
    }
  }, [selectedDate, weightEntries]);

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

  const addWeightEntry = () => {
    if (weight) {
      const newEntry = {
        date: selectedDate,
        weight: parseFloat(weight),
      };
      const updatedEntries = [
        ...weightEntries.filter(entry => entry.date !== selectedDate),
        newEntry,
      ].sort((a, b) => new Date(a.date) - new Date(b.date));
      setWeightEntries(updatedEntries);
      saveWeightEntries(updatedEntries);
      setWeight('');
    }
  };

  const clearWeightEntries = async () => {
    Alert.alert(
      'Clear All Entries',
      'Are you sure you want to delete all weight entries?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('weightEntries');
              setWeightEntries([]);
              console.log('Weight entries cleared successfully');
            } catch (error) {
              console.error('Failed to clear weight entries:', error);
            }
          },
        },
      ],
    );
  };

  const validEntries = weightEntries.filter(entry => !isNaN(entry.weight));

  const getChartData = () => {
    const sortedEntries = [...weightEntries].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
    const last7Entries = sortedEntries.slice(-7);
    return {
      labels: last7Entries.map(entry => entry.date.slice(5)),
      datasets: [
        {
          data: last7Entries.map(entry => entry.weight),
        },
      ],
    };
  };

  const getStatistics = () => {
    if (weightEntries.length === 0) return null;

    const weights = weightEntries.map(entry => entry.weight);
    const latestWeight = weights[weights.length - 1];
    const averageWeight =
      weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);

    return {
      latestWeight: latestWeight.toFixed(1),
      averageWeight: averageWeight.toFixed(1),
      minWeight: minWeight.toFixed(1),
      maxWeight: maxWeight.toFixed(1),
    };
  };

  const onDayPress = day => {
    setSelectedDate(day.dateString);
  };

  const getMarkedDates = () => {
    const markedDates = {};
    weightEntries.forEach(entry => {
      markedDates[entry.date] = {marked: true, dotColor: '#50cebb'};
    });
    return markedDates;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>WeightTrack</Text>
      <Calendar
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
          arrowColor: '#50cebb',
        }}
        dayComponent={({date, state, marking, onPress}) => {
          const dateString = date.dateString;

          // Find weight entry for this date
          const entry = weightEntries.find(entry => entry.date === dateString);
          const weight = entry ? entry.weight : null;

          return (
            <CustomDay
              date={date}
              state={state}
              marking={marking}
              onPress={() => {
                setSelectedDate(dateString);
                onDayPress({dateString});
              }}
              weight={weight}
            />
          );
        }}
      />

      <View style={styles.selectedDateInfo}>
        <Text style={styles.selectedDateText}>
          Selected Date: {selectedDate}
        </Text>
        <View style={styles.weightInputContainer}>
          <TextInput
            style={styles.weightInput}
            onChangeText={setWeight}
            value={weight}
            placeholder="Enter weight (kg)"
            keyboardType="numeric"
          />
        </View>
        <Button title="Add/Update" onPress={addWeightEntry} />
      </View>

      <View style={styles.clearButton}>
        <Button
          title="Clear All Entries"
          onPress={clearWeightEntries}
          color="red"
        />
      </View>

      {weightEntries.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weight Trend (Last 7 Entries)</Text>
          <LineChart
            data={getChartData()}
            width={screenWidth - 40}
            height={220}
            yAxisSuffix=" kg"
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      )}

      {getStatistics() && (
        <View style={styles.statisticsContainer}>
          <Text style={styles.statisticsTitle}>Statistics</Text>
          <Text>Latest Weight: {getStatistics().latestWeight} kg</Text>
          <Text>Average Weight: {getStatistics().averageWeight} kg</Text>
          <Text>Minimum Weight: {getStatistics().minWeight} kg</Text>
          <Text>Maximum Weight: {getStatistics().maxWeight} kg</Text>
        </View>
      )}

      <View style={styles.entriesContainer}>
        <Text style={styles.entriesTitle}>Weight Entries:</Text>
        {weightEntries.map((entry, index) => (
          <Text key={index}>
            {entry.date}: {entry.weight} kg
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  clearButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  input: {
    height: 40,
    width: '70%',
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  chartContainer: {
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  entriesContainer: {
    marginTop: 20,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedDateInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  weightInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightInput: {
    height: 40,
    width: '70%',
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  statisticsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  statisticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default HomeScreen;
