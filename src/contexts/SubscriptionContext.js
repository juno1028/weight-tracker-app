// Fixed SubscriptionContext.js with proper react-native-iap setup
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {Alert, Linking, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import react-native-iap with proper error handling
let RNIap;
try {
  RNIap = require('react-native-iap');
  console.log('react-native-iap imported successfully');
  console.log('Available methods:', Object.keys(RNIap));
} catch (error) {
  console.error('Failed to import react-native-iap:', error);
}

const PRODUCT_ID = 'weight_tracker_monthly_subscription';
const SUBSCRIPTION_KEY = 'user_subscription_status';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({children}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // Check if RNIap is available
  const isRNIapAvailable = () => {
    return RNIap && typeof RNIap.initConnection === 'function';
  };

  const saveSubscriptionStatus = async status => {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(status));
      setIsSubscribed(status);
    } catch (error) {
      console.error('Failed to save subscription status:', error);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      const saved = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (saved) {
        setIsSubscribed(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  };

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      if (!isRNIapAvailable()) {
        console.warn('RNIap not available, using local status');
        await loadSubscriptionStatus();
        return isSubscribed;
      }

      console.log('Checking subscription status with RNIap...');

      // Get all available purchases
      const availablePurchases = await RNIap.getAvailablePurchases();
      console.log('Available purchases:', availablePurchases);

      const hasActiveSubscription = availablePurchases.some(
        purchase => purchase.productId === PRODUCT_ID,
      );

      console.log('Has active subscription:', hasActiveSubscription);
      await saveSubscriptionStatus(hasActiveSubscription);

      return hasActiveSubscription;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      await loadSubscriptionStatus();
      return isSubscribed;
    }
  }, [isSubscribed]);

  const initializePurchases = useCallback(async () => {
    try {
      console.log('Initializing purchases...');

      if (!isRNIapAvailable()) {
        console.error('react-native-iap is not available');
        Alert.alert(
          'Setup Error',
          'In-app purchase functionality is not available. Please restart the app.',
          [{text: 'OK'}],
        );
        setLoading(false);
        return;
      }

      if (Platform.OS === 'ios') {
        console.log('Initializing IAP connection...');

        // Initialize the connection
        const connectionResult = await RNIap.initConnection();
        console.log('Connection result:', connectionResult);

        // Load local status first
        await loadSubscriptionStatus();

        // Check with App Store
        await checkSubscriptionStatus();

        console.log('Initialization completed successfully');
      }
    } catch (error) {
      console.error('Failed to initialize purchases:', error);
      await loadSubscriptionStatus();
    } finally {
      setLoading(false);
    }
  }, [checkSubscriptionStatus]);

  const handlePurchase = async () => {
    if (purchasing) {
      console.log('Purchase already in progress');
      return false;
    }

    if (!isRNIapAvailable()) {
      Alert.alert(
        'Setup Error',
        'In-app purchase functionality is not available. Please restart the app and try again.',
        [{text: 'OK'}],
      );
      return false;
    }

    setPurchasing(true);

    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;

    try {
      console.log('=== STARTING PURCHASE ===');

      // Ensure connection
      await RNIap.initConnection();

      // Get products
      console.log('Getting products...');
      const products = await RNIap.getProducts([PRODUCT_ID]);
      console.log('Products found:', products);

      if (products.length === 0) {
        throw new Error('Subscription product not found');
      }

      const product = products[0];
      console.log('Product details:', {
        productId: product.productId,
        title: product.title,
        price: product.localizedPrice,
      });

      return new Promise((resolve, reject) => {
        let isResolved = false;

        // Success listener
        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
          async purchase => {
            console.log('Purchase updated:', purchase);

            if (purchase.productId === PRODUCT_ID && !isResolved) {
              isResolved = true;

              try {
                await RNIap.finishTransaction({purchase, isConsumable: false});
                await saveSubscriptionStatus(true);
                console.log('Purchase completed successfully');
                resolve(true);
              } catch (finishError) {
                console.error('Error finishing transaction:', finishError);
                reject(finishError);
              }
            }
          },
        );

        // Error listener
        purchaseErrorSubscription = RNIap.purchaseErrorListener(error => {
          console.error('Purchase error:', error);
          if (!isResolved) {
            isResolved = true;
            reject(error);
          }
        });

        // Start purchase
        console.log('Requesting subscription...');
        RNIap.requestSubscription({
          sku: PRODUCT_ID,
        }).catch(error => {
          if (!isResolved) {
            isResolved = true;
            reject(error);
          }
        });

        // Timeout
        setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            reject(new Error('Purchase timeout'));
          }
        }, 60000);
      });
    } catch (error) {
      console.error('Purchase failed:', error);

      if (error.code === 'E_USER_CANCELLED') {
        return false;
      }

      let errorMessage = '구독 처리 중 오류가 발생했습니다.';

      switch (error.code) {
        case 'E_ITEM_UNAVAILABLE':
          errorMessage = '구독 상품을 사용할 수 없습니다.';
          break;
        case 'E_NETWORK_ERROR':
          errorMessage = '네트워크 연결을 확인해주세요.';
          break;
        default:
          if (error.message) {
            errorMessage = `오류: ${error.message}`;
          }
      }

      Alert.alert('구독 오류', errorMessage, [{text: '확인'}]);
      return false;
    } finally {
      purchaseUpdateSubscription?.remove();
      purchaseErrorSubscription?.remove();
      setPurchasing(false);
    }
  };

  const openSubscriptionManagement = async () => {
    Alert.alert('구독 관리', 'iOS 설정에서 구독을 관리할 수 있습니다.', [
      {text: '취소', style: 'cancel'},
      {text: '설정 열기', onPress: () => Linking.openURL('app-settings:')},
    ]);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (isRNIapAvailable()) {
        RNIap.endConnection();
      }
    };
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        loading,
        purchasing,
        handlePurchase,
        checkSubscriptionStatus,
        openSubscriptionManagement,
        initializePurchases,
      }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
