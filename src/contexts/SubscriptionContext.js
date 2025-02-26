import React, {createContext, useContext, useState, useCallback} from 'react';
import Purchases from 'react-native-purchases';
import {Platform} from 'react-native';

const API_KEY = Platform.select({
  ios: 'appl_aosZhPWHrRMXlVGMYbutVUGHqPd',
});

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
      console.log('Offerings:', offerings); // 전체 offerings 객체 확인

      // Check if the specific offering exists
      const offeringIdentifier = 'weight_tracker_premium_monthly';
      const offering = offerings.all[offeringIdentifier];

      if (offering && offering.monthly) {
        console.log('2. Found monthly package:', offering.monthly);
        const {customerInfo} = await Purchases.purchasePackage(
          offering.monthly,
        );
        console.log('3. Purchase successful:', customerInfo);
        const isPro = customerInfo.entitlements.active['pro'] !== undefined;
        setIsSubscribed(isPro);
        return true;
      } else {
        console.log('Error: No monthly package found in offering:', offering);
        return false;
      }
    } catch (error) {
      if (!error.userCancelled) {
        console.error('Purchase error details:', {
          code: error.code,
          message: error.message,
          underlyingError: error.underlyingError,
        });
      }
      return false;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        loading,
        handlePurchase,
        checkSubscriptionStatus,
      }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
