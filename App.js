import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import {SettingsProvider} from './src/contexts/SettingsContext';
import {WeightProvider} from './src/contexts/WeightContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <WeightProvider>
        <SettingsProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              <Tab.Navigator
                screenOptions={{
                  headerShown: false,
                  tabBarActiveTintColor: '#ff6b6b',
                  tabBarInactiveTintColor: 'gray',
                }}>
                <Tab.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{
                    tabBarIcon: ({color, size}) => (
                      <Icon name="home" color={color} size={size} />
                    ),
                  }}
                />
                <Tab.Screen
                  name="Stats"
                  component={StatsScreen}
                  options={{
                    tabBarIcon: ({color, size}) => (
                      <Icon name="chart-line" color={color} size={size} />
                    ),
                  }}
                />
                <Tab.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{
                    tabBarIcon: ({color, size}) => (
                      <Icon name="cog" color={color} size={size} />
                    ),
                  }}
                />
              </Tab.Navigator>
            </NavigationContainer>
          </SafeAreaProvider>
        </SettingsProvider>
      </WeightProvider>
    </GestureHandlerRootView>
  );
}
