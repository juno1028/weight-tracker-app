// Updated App.js with RevenueCat initialization on app start
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {I18nextProvider, useTranslation} from 'react-i18next';
import setupI18n from './src/localization/i18n';
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import HomeScreen from './src/screens/HomeScreen';
import BMIScreen from './src/screens/BMIScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import {WeightProvider} from './src/contexts/WeightContext';
import {SettingsProvider} from './src/contexts/SettingsContext';
import {UserProvider} from './src/contexts/UserContext';
import {
  SubscriptionProvider,
  useSubscription,
} from './src/contexts/SubscriptionContext';
import InitialSetupModal from './src/components/InitialSetupModal';

const Tab = createBottomTabNavigator();

// Localized TabNavigator component
const TabNavigator = ({isFirstLaunch, onComplete}) => {
  const {t} = useTranslation();

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#FF9500',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
          },
          headerShown: false,
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: t('common.home'),
            tabBarIcon: ({color, size}) => (
              <Icon name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="BMI"
          component={BMIScreen}
          options={{
            tabBarLabel: t('common.bmi'),
            tabBarIcon: ({color, size}) => (
              <Icon name="heart" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: t('common.settings'),
            tabBarIcon: ({color, size}) => (
              <Icon name="cog" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
      <InitialSetupModal isVisible={isFirstLaunch} onComplete={onComplete} />
    </>
  );
};

// Enhanced loading screen component with logo
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.logoContainer}>
      <Icon name="scale-bathroom" size={80} color="#FFFFFF" />
    </View>
    <Text style={styles.appTitle}>체중 기록</Text>
    <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
  </View>
);

// Main app component with initialization
const AppWrapper = () => {
  const [i18n, setI18n] = useState(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Get initializePurchases from SubscriptionContext
  const {initializePurchases} = useSubscription();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');

        // Initialize i18n
        console.log('Initializing i18n...');
        const i18nInstance = await setupI18n();
        setI18n(i18nInstance);
        console.log('i18n initialized successfully');

        // Initialize RevenueCat early
        console.log('Initializing RevenueCat...');
        await initializePurchases();
        console.log('RevenueCat initialized successfully');

        // Check if it's first launch
        console.log('Checking first launch status...');
        const value = await AsyncStorage.getItem('isFirstLaunch');
        setIsFirstLaunch(value === null || value === 'true');
        console.log('First launch check completed');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
        console.log('App initialization completed');

        // Hide the native splash screen after our JS has loaded
        if (SplashScreen) {
          SplashScreen.hide();
        }
      }
    };

    initializeApp();
  }, [initializePurchases]);

  // Handle initial setup completion
  const handleInitialSetupComplete = weight => {
    setIsFirstLaunch(false);
  };

  // Show loading screen until initialization completes
  if (isLoading || !i18n) {
    return <LoadingScreen />;
  }

  // Return the app with i18n provider
  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <TabNavigator
          isFirstLaunch={isFirstLaunch}
          onComplete={handleInitialSetupComplete}
        />
      </NavigationContainer>
    </I18nextProvider>
  );
};

// Root component with all providers
const App = () => {
  // Hide the native splash screen after our components mount
  useEffect(() => {
    if (SplashScreen) {
      // Give a small delay to ensure our JS has initialized
      setTimeout(() => {
        SplashScreen.hide();
      }, 300);
    }
  }, []);

  return (
    <SubscriptionProvider>
      <UserProvider>
        <WeightProvider>
          <SettingsProvider>
            <AppWrapper />
          </SettingsProvider>
        </WeightProvider>
      </UserProvider>
    </SubscriptionProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF9500',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  spinner: {
    marginTop: 16,
  },
});

export default App;
