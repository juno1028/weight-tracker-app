import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from '../contexts/UserContext';

const SettingsScreen = () => {
  const {height, weight, updateUserData} = useUser();
  const [heightInput, setHeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');

  useEffect(() => {
    if (height) setHeightInput(height.toString());
    if (weight) setWeightInput(weight.toString());
  }, [height, weight]);

  const handleSave = async () => {
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
      await updateUserData(heightInput, weightInput);
      Alert.alert('성공', '신체 정보가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save user data:', error);
      Alert.alert('오류', '데이터 저장에 실패했습니다.');
    }
  };

  const resetToFirstLaunch = async () => {
    try {
      await AsyncStorage.setItem('isFirstLaunch', 'true');
      Alert.alert(
        '초기화 완료',
        '앱을 다시 시작하면 초기 설정 화면이 표시됩니다.',
      );
    } catch (error) {
      console.error('Failed to reset first launch state:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>설정</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>신체 정보</Text>

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

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>저장하기</Text>
          </TouchableOpacity>
        </View>

        {/* <View style={styles.devSection}>
          <Text style={styles.devSectionTitle}>개발자 옵션</Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetToFirstLaunch}>
            <Text style={styles.resetButtonText}>초기 실행 상태로 리셋</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f8f8',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f1f8f8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d1b1a',
    marginBottom: 16,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0d1b1a',
    marginBottom: 16,
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
  saveButton: {
    backgroundColor: '#4ecdc4',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  devSection: {
    backgroundColor: '#f8f9fa',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  devSectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  resetButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SettingsScreen;
