import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useWeight} from '../contexts/WeightContext';
import {useUser} from '../contexts/UserContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAUGE_WIDTH = SCREEN_WIDTH - 64;

const BMIScreen = () => {
  const {weightEntries} = useWeight();
  const {height, weight} = useUser();
  const [bmiAnimation] = useState(new Animated.Value(0));

  // 최근 체중 가져오기
  const getLatestWeight = () => {
    if (weight) return weight;
    if (!weightEntries || weightEntries.length === 0) return null;

    const sortedEntries = [...weightEntries].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    return sortedEntries[0].weight;
  };

  const calculateBMI = () => {
    const latestWeight = getLatestWeight();
    if (!height || !latestWeight) return null;

    const heightInMeter = height / 100;
    return (latestWeight / (heightInMeter * heightInMeter)).toFixed(1);
  };

  const getBMICategory = bmi => {
    if (bmi < 18.5)
      return {category: '저체중', color: '#4A90E2', range: '18.5 미만'};
    if (bmi < 23)
      return {category: '정상', color: '#4ECDC4', range: '18.5 ~ 22.9'};
    if (bmi < 25)
      return {category: '과체중', color: '#FFB74D', range: '23 ~ 24.9'};
    if (bmi < 30)
      return {category: '비만', color: '#FF9B9B', range: '25 ~ 29.9'};
    return {category: '고도비만', color: '#FF6B6B', range: '30 이상'};
  };

  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(bmi) : null;
  const latestWeight = getLatestWeight();

  // BMI 게이지 애니메이션
  useEffect(() => {
    if (bmi) {
      const targetValue = Math.min(Math.max((bmi - 15) / 20, 0), 1);
      Animated.timing(bmiAnimation, {
        toValue: targetValue,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [bmi, bmiAnimation]);

  if (!height || !bmi) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BMI 지수</Text>
          </View>
          <View style={styles.noDataContainer}>
            <Icon name="scale-bathroom" size={48} color="#ccc" />
            <Text style={styles.noDataText}>
              키와 몸무게 정보가 필요합니다{'\n'}설정에서 입력해주세요
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BMI 지수</Text>
        </View>

        <View style={styles.bmiContainer}>
          <View style={styles.bmiValueContainer}>
            <Text style={styles.bmiValue}>{bmi}</Text>
            <Text style={styles.bmiUnit}>kg/m²</Text>
          </View>
          <Text style={[styles.bmiCategory, {color: bmiInfo.color}]}>
            {bmiInfo.category}
          </Text>
        </View>

        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeBackground}>
            <Animated.View
              style={[
                styles.gaugeFill,
                {
                  width: bmiAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: bmiInfo.color,
                },
              ]}
            />
            <View style={[styles.marker, {left: '18.5%'}]} />
            <View style={[styles.marker, {left: '40%'}]} />
            <View style={[styles.marker, {left: '50%'}]} />
            <View style={[styles.marker, {left: '75%'}]} />
          </View>
          <View style={styles.gaugeLabels}>
            <Text style={styles.gaugeLabel}>저체중</Text>
            <Text style={styles.gaugeLabel}>정상</Text>
            <Text style={styles.gaugeLabel}>과체중</Text>
            <Text style={styles.gaugeLabel}>비만</Text>
            <Text style={styles.gaugeLabel}>고도비만</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>신장</Text>
            <Text style={styles.infoValue}>{height} cm</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>체중</Text>
            <Text style={styles.infoValue}>{latestWeight} kg</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>현재 범위</Text>
            <Text style={[styles.infoValue, {color: bmiInfo.color}]}>
              {bmiInfo.range}
            </Text>
          </View>
        </View>

        <View style={styles.bmiInfoContainer}>
          <Text style={styles.bmiInfoTitle}>BMI 범위</Text>
          <View style={styles.bmiRangeList}>
            {[
              {label: '저체중', range: '18.5 미만', color: '#4A90E2'},
              {label: '정상', range: '18.5 ~ 22.9', color: '#4ECDC4'},
              {label: '과체중', range: '23 ~ 24.9', color: '#FFB74D'},
              {label: '비만', range: '25 ~ 29.9', color: '#FF9B9B'},
              {label: '고도비만', range: '30 이상', color: '#FF6B6B'},
            ].map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.bmiRangeItem,
                  index !== 0 && styles.bmiRangeBorder,
                ]}>
                <View style={styles.bmiRangeHeader}>
                  <View
                    style={[styles.bmiRangeDot, {backgroundColor: item.color}]}
                  />
                  <Text style={styles.bmiRangeLabel}>{item.label}</Text>
                </View>
                <Text style={styles.bmiRangeValue}>{item.range}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* BMI 계산 공식 및 출처 섹션 추가 */}
        <View style={styles.citationContainer}>
          <Text style={styles.citationTitle}>정보 출처</Text>
          <Text style={styles.citationItem}>
            BMI 계산 공식: 체중(kg) ÷ (신장(m))²
          </Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                'https://www.cdc.gov/bmi/faq/?CDC_AAref_Val=https://www.cdc.gov/healthyweight/assessing/bmi/adult_bmi/index.html',
              )
            }>
            <Text style={styles.linkText}>CDC – BMI 계산 방식 및 FAQ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f8f8',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f1f8f8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d1b1a',
    marginBottom: 16,
  },
  bmiContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  bmiValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0d1b1a',
  },
  bmiUnit: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    marginLeft: 4,
  },
  bmiCategory: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
  },
  gaugeContainer: {
    marginHorizontal: 32,
    marginBottom: 24,
  },
  gaugeBackground: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  gaugeFill: {
    height: '100%',
    position: 'absolute',
    left: 0,
    borderRadius: 6,
  },
  marker: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: '#fff',
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  gaugeLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0d1b1a',
  },
  bmiInfoContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bmiInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0d1b1a',
    marginBottom: 16,
  },
  bmiRangeList: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bmiRangeItem: {
    padding: 12,
  },
  bmiRangeBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bmiRangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bmiRangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  bmiRangeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0d1b1a',
  },
  bmiRangeValue: {
    fontSize: 14,
    color: '#666',
    marginLeft: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 120,
  },
  noDataText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  citationContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  citationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0d1b1a',
    marginBottom: 8,
  },
  citationItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#1E90FF',
    textDecorationLine: 'underline',
  },
});

export default BMIScreen;
