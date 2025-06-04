import React, {createContext, useContext, useState, useCallback} from 'react';
import Purchases from 'react-native-purchases';
import {Alert, Linking} from 'react-native';

// iOS-specific API key
const API_KEY = 'appl_aosZhPWHrRMXlVGMYbutVUGHqPd';

// Single product ID
const PRODUCT_ID = 'weight_tracker_premium_monthly';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({children}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      console.log('Customer info:', customerInfo);

      // Check if the 'pro' entitlement is active
      const isPro = customerInfo.entitlements.active['pro'] !== undefined;
      console.log('Is Pro:', isPro);

      setIsSubscribed(customerInfo.activeSubscriptions.length > 0);
    } catch (error) {
      console.error('Failed to get customer info:', error);
    }
  }, []);

  const initializePurchases = useCallback(async () => {
    try {
      console.log('Configuring Purchases with API key:', API_KEY);
      await Purchases.configure({
        apiKey: API_KEY,
        debugLogsEnabled: true,
      });
      console.log('Purchases configured successfully');

      // 설정 확인
      console.log('Checking if configured:', await Purchases.isConfigured());

      await checkSubscriptionStatus();
    } catch (error) {
      console.error('Failed to configure purchases:', error);
    } finally {
      setLoading(false);
    }
  }, [checkSubscriptionStatus]);

  const handlePurchase = async () => {
    try {
      // configure 상태 한번 더 체크
      if (!(await Purchases.isConfigured())) {
        console.log('Purchases not configured, trying to configure...');
        await initializePurchases();
      }

      console.log('1. Getting offerings...');
      const offerings = await Purchases.getOfferings();
      console.log('Offerings:', offerings);

      // Try to find the product in the offerings
      if (offerings.all[PRODUCT_ID] && offerings.all[PRODUCT_ID].monthly) {
        // Use the offering approach
        console.log('Found product in offerings:', offerings.all[PRODUCT_ID]);
        const packageToPurchase = offerings.all[PRODUCT_ID].monthly;

        console.log('2. Using package:', packageToPurchase);
        const {customerInfo} = await Purchases.purchasePackage(
          packageToPurchase,
        );

        console.log('3. Purchase successful:', customerInfo);
        setIsSubscribed(true);
        return true;
      } else {
        // Fall back to direct product purchase
        console.log(
          'Product not found in offerings, trying direct product purchase',
        );

        const products = await Purchases.getProducts([PRODUCT_ID]);
        console.log('Available products:', products);

        if (products && products.length > 0) {
          console.log(
            '4. Purchasing product directly:',
            products[0].identifier,
          );
          const {customerInfo} = await Purchases.purchaseProduct(
            products[0].identifier,
          );

          console.log('5. Purchase successful:', customerInfo);
          setIsSubscribed(true);
          return true;
        } else {
          console.log('No products found');
          Alert.alert(
            '구독 오류',
            '구독 상품을 찾을 수 없습니다. 나중에 다시 시도해주세요.',
            [{text: '확인'}],
          );
          return false;
        }
      }
    } catch (error) {
      if (!error.userCancelled) {
        console.error('Purchase error details:', {
          code: error.code,
          message: error.message,
          underlyingError: error.underlyingError,
        });

        Alert.alert(
          '구독 오류',
          '구독 처리 중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
          [{text: '확인'}],
        );
      }
      return false;
    }
  };

  // Add function to manage subscriptions (iOS only)
  const openSubscriptionManagement = async () => {
    try {
      if (!(await Purchases.isConfigured())) {
        await initializePurchases();
      }

      // Get customer info to check subscription status
      const customerInfo = await Purchases.getCustomerInfo();

      // Check if there's an active subscription
      if (
        customerInfo.activeSubscriptions &&
        customerInfo.activeSubscriptions.length > 0
      ) {
        // Try to open native subscription management UI
        await Purchases.showManageSubscriptions();
      } else {
        // When there's no active subscription
        Alert.alert('구독 정보', '현재 활성화된 구독이 없습니다.', [
          {text: '확인'},
        ]);
      }

      // After returning, refresh the subscription status
      await checkSubscriptionStatus();
    } catch (error) {
      console.error('Failed to open subscription management:', error);

      // Guide users to the Settings app as an alternative
      Alert.alert(
        '설정 안내',
        '구독 관리 페이지를 열 수 없습니다. iOS 설정 앱 > Apple ID > 구독에서 관리할 수 있습니다.',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '설정 열기',
            onPress: () => {
              // Open iOS Settings app
              Linking.openURL('app-settings:');
            },
          },
        ],
      );
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        loading,
        handlePurchase,
        checkSubscriptionStatus,
        openSubscriptionManagement,
      }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
