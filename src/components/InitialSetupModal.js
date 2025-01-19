import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from '../contexts/UserContext';

const InitialSetupModal = ({isVisible, onComplete}) => {
  const [heightInput, setHeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const {updateUserData} = useUser();

  const handleComplete = async () => {
    if (!heightInput || !weightInput) {
      Alert.alert('입력 오류', '키와 몸무게를 모두 입력해주세요.');
      return;
    }

    const heightNum = parseFloat(heightInput);
    const weightNum = parseFloat(weightInput);

    if (isNaN(heightNum) || isNaN(weightNum)) {
      Alert.alert('입력 오류', '올바른 숫자를 입력해주세요.');
      return;
    }

    if (heightNum < 100 || heightNum > 250) {
      Alert.alert('입력 오류', '키는 100cm에서 250cm 사이여야 합니다.');
      return;
    }

    if (weightNum < 20 || weightNum > 200) {
      Alert.alert('입력 오류', '몸무게는 20kg에서 200kg 사이여야 합니다.');
      return;
    }

    try {
      await AsyncStorage.setItem('isFirstLaunch', 'false');
      await AsyncStorage.setItem('initialWeight', weightInput);
      await updateUserData(heightInput, weightInput);
      onComplete(weightNum);
    } catch (error) {
      console.error('Failed to save user data:', error);
      Alert.alert('오류', '데이터 저장에 실패했습니다.');
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>환영합니다!</Text>
          <Text style={styles.subtitle}>
            체중 관리를 시작하기 전에{'\n'}기본 정보를 입력해주세요
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>키</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={heightInput}
                  onChangeText={setHeightInput}
                  placeholder="키를 입력하세요"
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
                <Text style={styles.unit}>cm</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>몸무게</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  placeholder="몸무게를 입력하세요"
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
                <Text style={styles.unit}>kg</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleComplete}>
            <Text style={styles.buttonText}>시작하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f8f8',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0d1b1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  unit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#4ecdc4',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default InitialSetupModal;
