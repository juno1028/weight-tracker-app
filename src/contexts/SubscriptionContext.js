import React, {createContext, useContext, useState, useCallback} from 'react';
import Purchases from 'react-native-purchases';
import {Alert, Linking} from 'react-native';

// iOS-specific API key
const API_KEY = 'appl_aosZhPWHrRMXlVGMYbutVUGHqPd';

// Subscription product ID
const PRODUCT_ID = 'weight_tracker_monthly_subscription';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({children}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      console.log('Customer info:', customerInfo);

      // Check if the 'pro' entitlement is active
      const isPro = customerInfo.entitlements.active['pro'] !== undefined;
      console.log('Is Pro (entitlement active):', isPro);

      // Also check active subscriptions as backup
      const hasActiveSubscription = customerInfo.activeSubscriptions.length > 0;
      console.log('Has active subscription:', hasActiveSubscription);

      setIsSubscribed(isPro || hasActiveSubscription);
    } catch (error) {
      console.error('Failed to get customer info:', error);
      setIsSubscribed(false);
    }
  }, []);

  const initializePurchases = useCallback(async () => {
    try {
      console.log('Configuring Purchases with API key:', API_KEY);
      await Purchases.configure({
        apiKey: API_KEY,
        debugLogsEnabled: __DEV__,
      });
      console.log('Purchases configured successfully');

      // Verify configuration
      const isConfigured = await Purchases.isConfigured();
      console.log('Purchases configuration verified:', isConfigured);

      if (!isConfigured) {
        throw new Error('RevenueCat configuration failed');
      }

      // Check subscription status after configuration
      await checkSubscriptionStatus();
    } catch (error) {
      console.error('Failed to configure purchases:', error);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [checkSubscriptionStatus]);

  const handlePurchase = async () => {
    if (purchasing) {
      console.log('Purchase already in progress, ignoring...');
      return false;
    }

    setPurchasing(true);

    try {
      console.log('=== PURCHASE DEBUG START ===');
      console.log('Environment: Production/TestFlight');
      console.log('Product ID we are looking for:', PRODUCT_ID);

      // RevenueCat should already be configured from app initialization
      const isConfigured = await Purchases.isConfigured();
      console.log('Purchases configured status:', isConfigured);

      if (!isConfigured) {
        console.log('Purchases not configured, initializing...');
        await initializePurchases();

        // Add small delay to ensure initialization is complete
        await new Promise(resolve => setTimeout(resolve, 500));

        // Double-check configuration
        if (!(await Purchases.isConfigured())) {
          throw new Error('Failed to configure RevenueCat');
        }
      }

      console.log('1. Getting offerings...');
      const offerings = await Purchases.getOfferings();
      console.log('All offerings:', Object.keys(offerings.all));
      console.log('Current offering exists:', !!offerings.current);

      if (offerings.current) {
        console.log(
          'Current offering packages:',
          Object.keys(offerings.current.availablePackages || {}),
        );
        console.log('Monthly package exists:', !!offerings.current.monthly);
      }

      // Method 1: Try current offering
      if (offerings.current && offerings.current.monthly) {
        console.log('2. Found monthly package in current offering');
        console.log(
          'Package product ID:',
          offerings.current.monthly.product.identifier,
        );

        const {customerInfo} = await Purchases.purchasePackage(
          offerings.current.monthly,
        );
        console.log('3. Purchase successful via offering');

        const isPro = customerInfo.entitlements.active['pro'] !== undefined;
        console.log('Pro entitlement active:', isPro);
        setIsSubscribed(isPro);
        console.log('=== PURCHASE DEBUG END (SUCCESS) ===');
        return true;
      }

      // Method 2: Check all offerings for our product
      console.log('2. Checking all offerings for our product...');
      let foundOffering = null;
      for (const [offeringId, offering] of Object.entries(offerings.all)) {
        console.log(`Checking offering: ${offeringId}`);
        if (
          offering.monthly &&
          offering.monthly.product.identifier === PRODUCT_ID
        ) {
          console.log(`Found our product in offering: ${offeringId}`);
          foundOffering = offering;
          break;
        }
      }

      if (foundOffering) {
        console.log('3. Purchasing via found offering');
        const {customerInfo} = await Purchases.purchasePackage(
          foundOffering.monthly,
        );
        console.log('4. Purchase successful via found offering');

        const isPro = customerInfo.entitlements.active['pro'] !== undefined;
        setIsSubscribed(isPro);
        console.log('=== PURCHASE DEBUG END (SUCCESS) ===');
        return true;
      }

      // Method 3: Direct product purchase
      console.log('3. No offerings found, trying direct product purchase');
      const products = await Purchases.getProducts([PRODUCT_ID]);
      console.log(
        'Available products:',
        products.map(p => ({
          identifier: p.identifier,
          price: p.price,
          title: p.title,
        })),
      );

      if (products && products.length > 0) {
        console.log('4. Found product, attempting direct purchase');
        const {customerInfo} = await Purchases.purchaseProduct(PRODUCT_ID);
        console.log('5. Purchase successful via direct product');

        const isPro = customerInfo.entitlements.active['pro'] !== undefined;
        setIsSubscribed(isPro);
        console.log('=== PURCHASE DEBUG END (SUCCESS) ===');
        return true;
      }

      console.log('ERROR: No products found');
      Alert.alert(
        '구독 오류',
        '구독 상품을 찾을 수 없습니다. RevenueCat 설정을 확인해주세요.',
        [{text: '확인'}],
      );
      console.log('=== PURCHASE DEBUG END (FAIL) ===');
      return false;
    } catch (error) {
      console.log('=== PURCHASE ERROR ===');
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
      console.log('User cancelled:', error.userCancelled);

      if (error.userCancelled) {
        console.log('Purchase cancelled by user');
        return false;
      }

      // More specific error handling
      let errorMessage = '구독 처리 중 오류가 발생했습니다.';

      if (error.code === 'PRODUCT_NOT_AVAILABLE_FOR_PURCHASE') {
        errorMessage =
          '구독 상품이 현재 구매할 수 없습니다. App Store Connect에서 상품이 승인되었는지 확인해주세요.';
      } else if (error.code === 'PURCHASES_NOT_CONFIGURED') {
        errorMessage = 'RevenueCat이 올바르게 설정되지 않았습니다.';
      } else if (error.code === 'CONFIGURATION_ERROR') {
        errorMessage =
          'RevenueCat 설정에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message) {
        errorMessage = `오류: ${error.message}`;
      }

      Alert.alert('구독 오류', errorMessage, [{text: '확인'}]);
      console.log('=== PURCHASE DEBUG END (ERROR) ===');
      return false;
    } finally {
      setPurchasing(false);
    }
  };

  const openSubscriptionManagement = async () => {
    try {
      const isConfigured = await Purchases.isConfigured();
      if (!isConfigured) {
        await initializePurchases();
      }

      const customerInfo = await Purchases.getCustomerInfo();

      if (
        customerInfo.activeSubscriptions &&
        customerInfo.activeSubscriptions.length > 0
      ) {
        await Purchases.showManageSubscriptions();
      } else {
        Alert.alert('구독 정보', '현재 활성화된 구독이 없습니다.', [
          {text: '확인'},
        ]);
      }

      // Refresh subscription status after management
      await checkSubscriptionStatus();
    } catch (error) {
      console.error('Failed to open subscription management:', error);
      Alert.alert(
        '설정 안내',
        '구독 관리 페이지를 열 수 없습니다. iOS 설정 앱 > Apple ID > 구독에서 관리할 수 있습니다.',
        [
          {text: '취소', style: 'cancel'},
          {text: '설정 열기', onPress: () => Linking.openURL('app-settings:')},
        ],
      );
    }
  };

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
