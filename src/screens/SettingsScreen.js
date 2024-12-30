import React from 'react';
import {View, Text, StyleSheet, Switch} from 'react-native';
import {useSettings} from '../contexts/SettingsContext';

const SettingsScreen = () => {
  const {showAllWeights, toggleShowAllWeights} = useSettings();

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>모든 체중 기록 표시</Text>
          <Switch
            value={showAllWeights}
            onValueChange={toggleShowAllWeights}
            trackColor={{false: '#767577', true: '#50cebb'}}
            thumbColor={showAllWeights ? '#fff' : '#f4f3f4'}
          />
          <Text style={styles.settingDescription}>
            {showAllWeights
              ? '모든 기록 표시 (최대 5개)'
              : '최근 3개 기록만 표시'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  header: {
    padding: 20,
    backgroundColor: '#50cebb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});

export default SettingsScreen;
