import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import BMIScreen from './src/screens/BMIScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import {WeightProvider} from './src/contexts/WeightContext';
import {SettingsProvider} from './src/contexts/SettingsContext';
import {UserProvider} from './src/contexts/UserContext';
import InitialSetupModal from './src/components/InitialSetupModal';

const Tab = createBottomTabNavigator();

const TabNavigator = ({isFirstLaunch, onComplete}) => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#4ecdc4',
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
        tabBarLabel: '홈',
        tabBarIcon: ({color, size}) => (
          <Icon name="home" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Stats"
      component={StatsScreen}
      options={{
        tabBarLabel: '통계',
        tabBarIcon: ({color, size}) => (
          <Icon name="chart-line" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="BMI"
      component={BMIScreen}
      options={{
        tabBarLabel: 'BMI',
        tabBarIcon: ({color, size}) => (
          <Icon name="heart" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarLabel: '설정',
        tabBarIcon: ({color, size}) => (
          <Icon name="cog" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

const App = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const value = await AsyncStorage.getItem('isFirstLaunch');
      setIsFirstLaunch(value === null || value === 'true');
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to check first launch:', error);
      setIsLoading(false);
    }
  };

  const handleInitialSetupComplete = weight => {
    setIsFirstLaunch(false);
  };

  if (isLoading) {
    return null; // 또는 로딩 스피너 표시
  }

  return (
    <UserProvider>
      <WeightProvider>
        <SettingsProvider>
          <NavigationContainer>
            <TabNavigator isFirstLaunch={isFirstLaunch} />
            <InitialSetupModal
              isVisible={isFirstLaunch}
              onComplete={handleInitialSetupComplete}
            />
          </NavigationContainer>
        </SettingsProvider>
      </WeightProvider>
    </UserProvider>
  );
};

export default App;
