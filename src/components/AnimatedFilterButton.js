import React, {useEffect, useRef} from 'react';
import {TouchableOpacity, Text, Animated, StyleSheet} from 'react-native';

const AnimatedFilterButton = ({
  caseItem,
  isActive,
  onPress,
  backgroundColor,
  textColor,
  borderColor,
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
        toValue: 0.9,
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
        flex: 1,
        transform: [{scale: scaleAnim}],
      }}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor,
            borderColor,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.7}>
        <Text style={[styles.filterText, {color: textColor}]}>
          {caseItem.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AnimatedFilterButton;
