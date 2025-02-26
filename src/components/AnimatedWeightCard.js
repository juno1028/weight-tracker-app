import React, {useEffect, useRef} from 'react';
import {TouchableOpacity, View, Text, Animated, StyleSheet} from 'react-native';

const AnimatedWeightCard = ({
  entry,
  backgroundColor,
  textColor,
  formatTime,
  getCaseLabel,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pop-up animation when component mounts
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = () => {
    // Pop-down animation when pressed
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Call the original onPress function
    onPress();
  };

  return (
    <Animated.View
      style={{
        transform: [{scale: scaleAnim}],
        marginBottom: 12,
      }}>
      <TouchableOpacity
        style={[styles.weightCard, {backgroundColor}]}
        onPress={handlePress}
        activeOpacity={0.8}>
        <View style={styles.weightCardHeader}>
          <Text style={[styles.weightCaseText, {color: textColor}]}>
            {getCaseLabel(entry.case)}
          </Text>
          <Text style={styles.weightValue}>
            {entry.weight.toFixed(1)} <Text style={styles.weightUnit}>kg</Text>
          </Text>
        </View>
        <Text style={styles.weightTimeText}>{formatTime(entry.timestamp)}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  weightCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
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
});

export default AnimatedWeightCard;
