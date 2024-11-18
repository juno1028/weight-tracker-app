import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {Dimensions} from 'react-native';

const screenWidth = Dimensions.get('window').width;

const StatsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Weight Statistics</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Current Weight</Text>
          <Text style={styles.statValue}>68 kg</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Average Weight</Text>
          <Text style={styles.statValue}>NaN kg</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Entries</Text>
          <Text style={styles.statValue}>1193</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Trend</Text>
        <LineChart
          data={{
            labels: [
              'Day 1',
              'Day 2',
              'Day 3',
              'Day 4',
              'Day 5',
              'Day 6',
              'Day 7',
            ],
            datasets: [
              {
                data: [66.2, 74.1, 70.2, 70.2, 70.2, 72.1, 68.0],
              },
            ],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisSuffix="kg"
          chartConfig={{
            backgroundColor: '#ff6b6b',
            backgroundGradientFrom: '#ff6b6b',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#ff6b6b',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContainer: {
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default StatsScreen;
