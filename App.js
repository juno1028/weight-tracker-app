// App.js
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {I18nextProvider, useTranslation} from 'react-i18next';
import setupI18n from './src/localization/i18n';
import {View, ActivityIndicator, Text} from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import BMIScreen from './src/screens/BMIScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import {WeightProvider} from './src/contexts/WeightContext';
import {SettingsProvider} from './src/contexts/SettingsContext';
import {UserProvider} from './src/contexts/UserContext';
import {SubscriptionProvider} from './src/contexts/SubscriptionContext';
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

// Loading screen component
const LoadingScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FF9500',
    }}>
    <ActivityIndicator size="large" color="#FFFFFF" />
    <Text
      style={{
        color: '#FFFFFF',
        marginTop: 16,
        fontSize: 18,
        fontWeight: 'bold',
      }}>
      Loading...
    </Text>
  </View>
);

// Main app component with initialization
const AppWrapper = () => {
  const [i18n, setI18n] = useState(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app resources
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize i18n
        const i18nInstance = await setupI18n();
        setI18n(i18nInstance);

        // Check if it's first launch
        const value = await AsyncStorage.getItem('isFirstLaunch');
        setIsFirstLaunch(value === null || value === 'true');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

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

export default App;
