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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from '../contexts/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTranslation} from 'react-i18next';

const PRIMARY_COLOR = '#FF9500'; // App's primary orange color

const InitialSetupModal = ({isVisible, onComplete}) => {
  const {t} = useTranslation();
  const [heightInput, setHeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const {updateUserData} = useUser();

  const handleComplete = async () => {
    // 버튼 클릭 시 키보드 닫기 (선택사항)
    Keyboard.dismiss();

    if (!heightInput || !weightInput) {
      Alert.alert(t('initialSetup.inputError'), t('initialSetup.bothRequired'));
      return;
    }

    const heightNum = parseFloat(heightInput);
    const weightNum = parseFloat(weightInput);

    if (isNaN(heightNum) || isNaN(weightNum)) {
      Alert.alert(
        t('initialSetup.inputError'),
        t('initialSetup.invalidNumber'),
      );
      return;
    }

    if (heightNum < 100 || heightNum > 250) {
      Alert.alert(t('initialSetup.inputError'), t('initialSetup.heightRange'));
      return;
    }

    if (weightNum < 20 || weightNum > 200) {
      Alert.alert(t('initialSetup.inputError'), t('initialSetup.weightRange'));
      return;
    }

    try {
      await AsyncStorage.setItem('isFirstLaunch', 'false');
      await AsyncStorage.setItem('initialWeight', weightInput);
      await updateUserData(heightInput, weightInput);
      onComplete(weightNum);
    } catch (error) {
      console.error('Failed to save user data:', error);
      Alert.alert(t('common.error'), t('initialSetup.saveError'));
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon name="scale-bathroom" size={64} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>{t('initialSetup.welcome')}</Text>
            <Text style={styles.subtitle}>{t('initialSetup.subtitle')}</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('initialSetup.height')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={heightInput}
                    onChangeText={setHeightInput}
                    placeholder={t('initialSetup.heightPlaceholder')}
                    placeholderTextColor="#bbb"
                    keyboardType="decimal-pad"
                    maxLength={5}
                  />
                  <Text style={styles.unit}>cm</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('initialSetup.weight')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={weightInput}
                    onChangeText={setWeightInput}
                    placeholder={t('initialSetup.weightPlaceholder')}
                    placeholderTextColor="#bbb"
                    keyboardType="decimal-pad"
                    maxLength={5}
                  />
                  <Text style={styles.unit}>kg</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleComplete}>
              <Text style={styles.buttonText}>{t('initialSetup.start')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
    fontFamily: 'System',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
    fontFamily: 'System',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 18,
    color: '#333',
    fontFamily: 'System',
  },
  unit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
    fontFamily: 'System',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: PRIMARY_COLOR,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default InitialSetupModal;
