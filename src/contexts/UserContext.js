import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [height, setHeight] = useState(null);
  const [weight, setWeight] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedHeight = await AsyncStorage.getItem('userHeight');
      const storedWeight = await AsyncStorage.getItem('userWeight');

      if (storedHeight) setHeight(parseFloat(storedHeight));
      if (storedWeight) setWeight(parseFloat(storedWeight));
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const updateUserData = async (newHeight, newWeight) => {
    try {
      if (newHeight) {
        await AsyncStorage.setItem('userHeight', newHeight.toString());
        setHeight(parseFloat(newHeight));
      }
      if (newWeight) {
        await AsyncStorage.setItem('userWeight', newWeight.toString());
        setWeight(parseFloat(newWeight));
      }
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        height,
        weight,
        updateUserData,
        loadUserData,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
