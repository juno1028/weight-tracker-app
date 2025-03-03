// src/components/Advertisement.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSubscription} from '../contexts/SubscriptionContext';

const Advertisement = ({onUpgrade}) => {
  const {isSubscribed} = useSubscription();

  // Don't show ad for pro users
  if (isSubscribed) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name="crown" size={20} color="#FFD700" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.adText}>프리미엄으로 업그레이드하여 광고 제거</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onUpgrade}>
        <Text style={styles.buttonText}>업그레이드</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF9F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  adText: {
    fontSize: 12,
    color: '#333',
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#FF9500',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Advertisement;
