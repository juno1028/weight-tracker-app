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
      await Purchases.configure({apiKey: API_KEY});
      await checkSubscriptionStatus();
    } catch (error) {
      console.error('Failed to configure purchases:', error);
    } finally {
      setLoading(false);
    }
  }, [checkSubscriptionStatus]);

  useEffect(() => {
    initializePurchases();
  }, [initializePurchases]);

  const handlePurchase = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.monthly !== null) {
        const {customerInfo} = await Purchases.purchasePackage(
          offerings.current.monthly,
        );
        setIsSubscribed(customerInfo.activeSubscriptions.length > 0);
        return true;
      }
      return false;
    } catch (error) {
      if (!error.userCancelled) {
        console.error('Failed to purchase:', error);
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
