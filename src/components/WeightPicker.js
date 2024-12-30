// WeightPicker.js
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = 25;
const VISIBLE_ITEMS = Math.floor(SCREEN_WIDTH / ITEM_WIDTH);

const WeightPicker = ({initialWeight = 67.5, onComplete}) => {
  const [selectedWeight, setSelectedWeight] = useState(initialWeight);

  // Pan/scroll 관련 ref
  const scrollX = useRef(new Animated.Value(0)).current;
  const panX = useRef(0); // 제스처 이동 누적값을 저장할 ref
  const initPanX = useRef(0); // 제스처 시작 시점의 scrollX

  // Haptic feedback을 위한 '마지막으로 트리거했던 정수값' 보관
  const lastIntegerRef = useRef(Math.floor(initialWeight));

  // 30.0 ~ 150.0, 0.1 단위
  const weights = Array.from({length: 1201}, (_, i) => (i + 300) / 10);

  useEffect(() => {
    // 초기 위치 설정
    const initialX = (initialWeight - 30) * 10 * ITEM_WIDTH;
    scrollX.setValue(-initialX + SCREEN_WIDTH / 2);
    panX.current = -initialX + SCREEN_WIDTH / 2;
  }, []);

  // index → 해당 아이템을 정확히 중앙에 두기 위한 translateX
  const snapToIndex = index => {
    return -(index * ITEM_WIDTH) + SCREEN_WIDTH / 2;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // 제스처 시작 시점의 scrollX를 저장
      initPanX.current = panX.current;
    },
    onPanResponderMove: (evt, gestureState) => {
      const {dx} = gestureState;

      // 매 프레임마다 누적된 이동량 계산
      const newPanX = initPanX.current + dx;

      // 최소/최대 범위를 벗어나지 않도록(원하는 경우 clamp)
      // 여기서는 간단히 자유롭게 움직이게 해두었음
      panX.current = newPanX;

      // Animated.Value 업데이트
      scrollX.setValue(newPanX);

      // 현재 가운데에 위치한 index 계산
      const position = -newPanX + SCREEN_WIDTH / 2;
      const index = Math.round(position / ITEM_WIDTH);
      const boundedIndex = Math.min(Math.max(0, index), weights.length - 1);
      const newWeight = weights[boundedIndex];

      // 정수 경계를 넘어설 때만 haptic feedback 트리거
      // 예) 66.9 -> 67.1 (67 넘어감), 67.1 -> 66.9 (67 아래로 감)
      const currentInteger = Math.floor(newWeight);
      if (currentInteger !== lastIntegerRef.current) {
        lastIntegerRef.current = currentInteger;
        ReactNativeHapticFeedback.trigger('selection');
      }
    },
    onPanResponderRelease: () => {
      // 제스처가 끝난 시점에서 index 스냅
      const position = -panX.current + SCREEN_WIDTH / 2;
      const index = Math.round(position / ITEM_WIDTH);
      const boundedIndex = Math.min(Math.max(0, index), weights.length - 1);

      // 해당 index로 부드럽게 스프링
      Animated.spring(scrollX, {
        toValue: snapToIndex(boundedIndex),
        useNativeDriver: false, // 텍스트/opacity가 있어서 false
        friction: 10,
        tension: 40,
      }).start(() => {
        // 스프링 종료 후 panX도 스냅 위치로 업데이트
        panX.current = snapToIndex(boundedIndex);

        // 최종 선택값 업데이트
        const finalWeight = weights[boundedIndex];
        setSelectedWeight(finalWeight);
      });
    },
  });

  const renderScale = () => {
    return weights.map((weight, index) => {
      const inputRange = [
        -ITEM_WIDTH * index + SCREEN_WIDTH / 2 - ITEM_WIDTH / 2,
        -ITEM_WIDTH * index + SCREEN_WIDTH / 2 + ITEM_WIDTH / 2,
      ];

      // 중앙에 가까울수록 scale, opacity를 크게
      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.3, 1],
        extrapolate: 'clamp',
      });
      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.8, 1],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.markContainer,
            {
              opacity,
              transform: [{scale}],
            },
          ]}>
          <View
            style={[
              styles.mark,
              weight % 1 === 0 ? styles.largeMark : styles.smallMark,
            ]}
          />
          {weight % 1 === 0 && (
            <Text style={styles.markLabel}>{weight.toFixed(0)}</Text>
          )}
        </Animated.View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.weightDisplay}>
        {selectedWeight.toFixed(1)}
        <Text style={styles.unit}>kg</Text>
      </Text>

      <View style={styles.pickerContainer}>
        {/* 가운데 인디케이터 */}
        <View style={styles.centerIndicator} />
        {/* 스케일 */}
        <Animated.View
          style={[styles.scaleContainer, {transform: [{translateX: scrollX}]}]}
          {...panResponder.panHandlers}>
          {renderScale()}
        </Animated.View>
      </View>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => onComplete(selectedWeight)}>
        <Text style={styles.completeButtonText}>완료</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0066ff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  weightDisplay: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 30,
  },
  unit: {
    fontSize: 24,
    marginLeft: 5,
  },
  pickerContainer: {
    height: 150,
    overflow: 'hidden',
  },
  centerIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 2,
    height: '100%',
    backgroundColor: '#ff9500',
    zIndex: 1,
  },
  scaleContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  markContainer: {
    width: ITEM_WIDTH,
    alignItems: 'center',
  },
  mark: {
    backgroundColor: 'white',
  },
  largeMark: {
    height: 40,
    width: 2,
  },
  smallMark: {
    height: 20,
    width: 1,
  },
  markLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  completeButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  completeButtonText: {
    color: '#0066ff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WeightPicker;
