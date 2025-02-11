import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
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

      if (offerings.current !== null && offerings.current.monthly !== null) {
        console.log('2. Found monthly offering:', offerings.current.monthly);
        const {customerInfo} = await Purchases.purchasePackage(
          offerings.current.monthly,
        );
        console.log('3. Purchase successful:', customerInfo);
        setIsSubscribed(customerInfo.activeSubscriptions.length > 0);
        return true;
      } else {
        console.log('Error: No monthly offering found in:', offerings);
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
