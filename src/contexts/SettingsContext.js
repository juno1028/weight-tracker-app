import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

export const SettingsProvider = ({children}) => {
  const [showAllWeights, setShowAllWeights] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedShowAllWeights = await AsyncStorage.getItem('showAllWeights');
      if (savedShowAllWeights !== null) {
        setShowAllWeights(JSON.parse(savedShowAllWeights));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const toggleShowAllWeights = async () => {
    try {
      const newValue = !showAllWeights;
      await AsyncStorage.setItem('showAllWeights', JSON.stringify(newValue));
      setShowAllWeights(newValue);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{showAllWeights, toggleShowAllWeights}}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
