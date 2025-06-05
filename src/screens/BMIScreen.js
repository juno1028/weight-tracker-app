// Updated BMIScreen.js with updated BMI criteria (no imperial units)
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useWeight} from '../contexts/WeightContext';
import {useUser} from '../contexts/UserContext';
import {useTranslation} from 'react-i18next';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAUGE_WIDTH = SCREEN_WIDTH - 64;
const BG_COLOR = '#F8F8F8'; // Light neutral background
const PRIMARY_COLOR = '#FF9500';
const MINT_COLOR = '#4ECDC4';

const BMIScreen = () => {
  const {t} = useTranslation();
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
    // Using WHO international BMI classification
    if (bmi < 18.5)
      return {
        category: t('bmiScreen.underweight'),
        color: '#4A90E2',
        range: '< 18.5',
      };
    if (bmi < 25)
      return {
        category: t('bmiScreen.normal'),
        color: '#4ECDC4',
        range: '18.5 - 24.9',
      };
    if (bmi < 30)
      return {
        category: t('bmiScreen.overweight'),
        color: '#FFB74D',
        range: '25 - 29.9',
      };
    if (bmi < 35)
      return {
        category: t('bmiScreen.obese'),
        color: '#FF9B9B',
        range: '30 - 34.9',
      };
    return {
      category: t('bmiScreen.severelyObese'),
      color: '#FF6B6B',
      range: '≥ 35',
    };
  };

  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(bmi) : null;
  const latestWeight = getLatestWeight();

  useEffect(() => {
    if (bmi) {
      const targetValue = Math.min(Math.max((bmi - 15) / 20, 0), 1);
      Animated.timing(bmiAnimation, {
        toValue: targetValue,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bmi]);

  if (!height || !bmi) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('bmiScreen.title')}</Text>
          </View>
          <View style={styles.noDataContainer}>
            <Icon name="scale-bathroom" size={48} color="#ccc" />
            <Text style={styles.noDataText}>{t('bmiScreen.needInfo')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('bmiScreen.title')}</Text>
        </View>

        <View style={[styles.card, styles.mainCard]}>
          <View style={styles.bmiContainer}>
            <View style={styles.bmiValueContainer}>
              <Text style={styles.bmiValue}>{bmi}</Text>
              <Text style={styles.bmiUnit}>{t('bmiScreen.bmiUnit')}</Text>
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
              <Text style={styles.gaugeLabel}>
                {t('bmiScreen.underweight')}
              </Text>
              <Text style={styles.gaugeLabel}>{t('bmiScreen.normal')}</Text>
              <Text style={styles.gaugeLabel}>{t('bmiScreen.overweight')}</Text>
              <Text style={styles.gaugeLabel}>{t('bmiScreen.obese')}</Text>
              <Text style={styles.gaugeLabel}>
                {t('bmiScreen.severelyObese')}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.infoCard]}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('bmiScreen.height')}</Text>
            <Text style={styles.infoValue}>{height} cm</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('bmiScreen.weight')}</Text>
            <Text style={styles.infoValue}>{latestWeight} kg</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('bmiScreen.currentRange')}</Text>
            <Text style={[styles.infoRangeValue, {color: bmiInfo.color}]}>
              {bmiInfo.range}
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.rangeCard]}>
          <Text style={styles.sectionTitle}>{t('bmiScreen.bmiRanges')}</Text>
          <View style={styles.bmiRangeList}>
            {[
              {
                label: t('bmiScreen.underweight'),
                range: '< 18.5',
                color: '#4A90E2',
              },
              {
                label: t('bmiScreen.normal'),
                range: '18.5 - 24.9',
                color: '#4ECDC4',
              },
              {
                label: t('bmiScreen.overweight'),
                range: '25 - 29.9',
                color: '#FFB74D',
              },
              {
                label: t('bmiScreen.obese'),
                range: '30 - 34.9',
                color: '#FF9B9B',
              },
              {
                label: t('bmiScreen.severelyObese'),
                range: '≥ 35',
                color: '#FF6B6B',
              },
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

        <View style={styles.citationContainer}>
          <Text style={styles.citationTitle}>{t('bmiScreen.citation')}</Text>
          <Text style={styles.citationItem}>{t('bmiScreen.formula')}</Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                'https://www.cdc.gov/bmi/faq/?CDC_AAref_Val=https://www.cdc.gov/healthyweight/assessing/bmi/adult_bmi/index.html',
              )
            }>
            <Text style={styles.linkText}>{t('bmiScreen.cdcLink')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: BG_COLOR,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainCard: {
    borderRightWidth: 6,
    borderRightColor: PRIMARY_COLOR,
  },
  infoCard: {
    borderRightWidth: 6,
    borderRightColor: PRIMARY_COLOR,
    flexDirection: 'row',
  },
  rangeCard: {
    borderRightWidth: 6,
    borderRightColor: PRIMARY_COLOR,
  },
  bmiContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  bmiValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
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
    marginHorizontal: 8,
    marginVertical: 16,
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
    paddingHorizontal: 4,
    minHeight: 24, // Add minimum height for two lines
  },
  gaugeLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 1,
    lineHeight: 12, // Tight line height for compact text
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
    color: PRIMARY_COLOR,
  },
  infoRangeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIMARY_COLOR,
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
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 6,
    borderLeftColor: '#999',
  },
  citationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  citationItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#4A90E2',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
});

export default BMIScreen;
