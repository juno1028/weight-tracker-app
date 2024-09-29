import React, {useState} from 'react';
import {View, Text, StyleSheet, Button, TextInput} from 'react-native';

const HomeScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weight, setWeight] = useState('');
  const [weightEntries, setWeightEntries] = useState([]);

  const addDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const addWeightEntry = () => {
    if (weight) {
      const newEntry = {
        date: currentDate.toDateString(),
        weght: parseFloat(weight),
      };
      setWeightEntries([...weightEntries, newEntry]);
      setWeight('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WeightTrack</Text>
      <Text>{currentDate.toDateString()}</Text>
      <Button title="Add a day" onPress={addDay}></Button>

      <View style={styles.inputContainer}>
        <TextInput
          styles={styles.input}
          onChangeText={setWeight}
          value={weight}
          placeholder="Enter weight"
          keyboardType="numeric"
        />
        <Button title="Add Weight" onPress={addWeightEntry} />
      </View>

      <View style={styles.entriesContainer}>
        <Text styles={styles.entriesTitle}>Weight Entries:</Text>
        {weightEntries.map((entry, index) => (
          <Text key={index}>
            {entry.date}: {entry.weight} kg
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  input: {
    height: 40,
    width: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  entiresContainer: {
    marginTop: 20,
    alignItem: 'flex-start',
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default HomeScreen;
