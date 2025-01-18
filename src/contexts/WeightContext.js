// src/contexts/WeightContext.js
import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WeightContext = createContext();

export const WeightProvider = ({children}) => {
  const [weightEntries, setWeightEntries] = useState([]);

  useEffect(() => {
    loadWeightEntries();
  }, []);

  const loadWeightEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('weightEntries');
      if (storedEntries !== null) {
        setWeightEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error('Failed to load weight entries:', error);
    }
  };

  const saveWeightEntries = async entries => {
    try {
      await AsyncStorage.setItem('weightEntries', JSON.stringify(entries));
      setWeightEntries(entries); // 저장 후 상태 업데이트
    } catch (error) {
      console.error('Failed to save weight entries:', error);
    }
  };

  return (
    <WeightContext.Provider
      value={{
        weightEntries,
        setWeightEntries: saveWeightEntries,
        loadWeightEntries,
      }}>
      {children}
    </WeightContext.Provider>
  );
};

export const useWeight = () => useContext(WeightContext);
