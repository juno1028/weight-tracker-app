// src/screens/SettingsScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useSettings} from '../contexts/SettingsContext';
import * as RNIap from 'react-native-iap';

const productIds = ['1234']; // 테스트용 상품 ID

const SettingsScreen = () => {
  const {showAllWeights, toggleShowAllWeights} = useSettings();
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    initializeIAP();
    return () => {
      RNIap.endConnection();
    };
  }, []);

  const initializeIAP = async () => {
    try {
      setIsLoading(true);
      await RNIap.initConnection();

      // 구매 내역 확인
      const purchases = await RNIap.getAvailablePurchases();
      if (purchases.length > 0) {
        setIsPurchased(true);
      }

      // 상품 정보 가져오기
      const products = await RNIap.getProducts(productIds);
      setProducts(products);
    } catch (err) {
      console.warn(err);
      Alert.alert('오류', '구독 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      if (products.length === 0) {
        Alert.alert('오류', '구매 가능한 상품이 없습니다.');
        return;
      }

      // iOS의 경우 구매 요청
      const result = await RNIap.requestPurchase(productIds[0], false);
      console.log('Purchase result:', result);

      setIsPurchased(true);
      Alert.alert('성공', '구독이 완료되었습니다.');
    } catch (err) {
      if (err.code !== 'E_USER_CANCELLED') {
        // 사용자가 취소한 경우는 에러 메시지 표시하지 않음
        Alert.alert('오류', '구매 중 오류가 발생했습니다.');
        console.warn(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      '구독 취소',
      'App Store에서 구독을 취소하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: 'App Store 열기',
          onPress: () => {
            // 실제로는 App Store의 구독 관리 페이지로 이동
            // 테스트를 위해 상태만 변경
            setIsPurchased(false);
            Alert.alert('안내', '구독이 취소되었습니다.');
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <View style={styles.container}>
      {/* 기존 설정 */}
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

      {/* 구독 섹션 */}
      <View style={styles.section}>
        <View style={styles.subscriptionContainer}>
          <Text style={styles.subscriptionTitle}>프리미엄 구독</Text>
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color="#50cebb"
              style={styles.loader}
            />
          ) : (
            <>
              <Text style={styles.subscriptionStatus}>
                상태: {isPurchased ? '결제완료' : '결제 미진행'}
              </Text>

              {!isPurchased ? (
                <TouchableOpacity
                  style={styles.subscriptionButton}
                  onPress={handlePurchase}>
                  <Text style={styles.buttonText}>구독하기</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.subscriptionButton, styles.cancelButton]}
                  onPress={handleCancelSubscription}>
                  <Text style={styles.buttonText}>구독 취소</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.priceInfo}>
                {isPurchased ? '현재 프리미엄 구독 중입니다' : '월 3,900원'}
              </Text>
            </>
          )}
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
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  subscriptionContainer: {
    alignItems: 'center',
    padding: 16,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subscriptionStatus: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  subscriptionButton: {
    backgroundColor: '#50cebb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  priceInfo: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  loader: {
    marginVertical: 20,
  },
});

export default SettingsScreen;
