// src/screens/SettingsScreen.js
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
  Linking,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTranslation} from 'react-i18next';
import {languageDetails} from '../localization/i18n';
import LanguageSelector from '../components/LanguageSelector';
import {useUser} from '../contexts/UserContext';
import {useSubscription} from '../contexts/SubscriptionContext';
import {useWeight} from '../contexts/WeightContext';

const SettingsScreen = () => {
  const {t, i18n} = useTranslation();
  const {height, weight, updateUserData} = useUser();
  const {weightEntries, setWeightEntries} = useWeight();
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [heightInput, setHeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [isLanguageSelectorVisible, setIsLanguageSelectorVisible] =
    useState(false);

  // Get subscription state including purchasing status
  const {
    isSubscribed,
    loading,
    purchasing,
    handlePurchase,
    openSubscriptionManagement,
  } = useSubscription();

  const TERMS_URL =
    'https://juno1028.github.io/weight-tracker-legal/terms.html';
  const PRIVACY_URL =
    'https://juno1028.github.io/weight-tracker-legal/privacy.html';

  useEffect(() => {
    if (height) setHeightInput(height.toString());
    if (weight) setWeightInput(weight.toString());
  }, [height, weight]);

  const handleSaveProfile = async () => {
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
      await updateUserData(heightInput, weightInput);
      Alert.alert(t('common.success'), t('settingsScreen.saveSuccess'));
      setIsProfileEditMode(false);
    } catch (error) {
      console.error('Failed to save user data:', error);
      Alert.alert(t('common.error'), t('initialSetup.saveError'));
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      t('settingsScreen.deleteConfirm'),
      t('settingsScreen.deletePrompt'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          onPress: async () => {
            try {
              await setWeightEntries([]);
              Alert.alert(
                t('common.success'),
                t('settingsScreen.deleteSuccess'),
              );
            } catch (error) {
              console.error('Failed to delete data:', error);
              Alert.alert(t('common.error'), t('settingsScreen.deleteError'));
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleSubscribePress = async () => {
    if (purchasing) {
      // Already processing, ignore
      return;
    }

    if (!isSubscribed) {
      const success = await handlePurchase();
      if (success) {
        Alert.alert(t('common.success'), '구독이 활성화되었습니다.');
      }
      // Error handling is done in the subscription context
    }
  };

  const getCurrentLanguageName = () => {
    const currentLang = i18n.language;
    return currentLang
      ? `${languageDetails[currentLang].flag} ${languageDetails[currentLang].name}`
      : null;
  };

  const renderProfileEditSection = () => {
    if (!isProfileEditMode) return null;

    return (
      <View style={styles.profileEditSection}>
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('initialSetup.height')}</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.input}
                value={heightInput}
                onChangeText={setHeightInput}
                placeholder={t('initialSetup.heightPlaceholder')}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={styles.unit}>cm</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('initialSetup.weight')}</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.input}
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder={t('initialSetup.weightPlaceholder')}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={styles.unit}>kg</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setIsProfileEditMode(false)}>
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ListItem = ({icon, title, value, onPress, rightElement}) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.listItemContent}>
        <View style={styles.listItemLeft}>
          <Icon name={icon} size={22} color="#FF9500" />
          <Text style={styles.listItemTitle}>{title}</Text>
        </View>
        {value ? (
          <Text style={styles.listItemValue}>{value}</Text>
        ) : rightElement ? (
          rightElement
        ) : (
          <Icon name="chevron-right" size={18} color="#CCC" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('settingsScreen.title')}</Text>
        </View>

        {/* Settings List */}
        <View style={styles.listSection}>
          {/* Profile Setting */}
          <ListItem
            icon="account"
            title={t('settingsScreen.profile')}
            value={height && weight ? `${height}cm, ${weight}kg` : null}
            onPress={() => setIsProfileEditMode(!isProfileEditMode)}
          />
          {renderProfileEditSection()}

          {/* Language Setting */}
          <ListItem
            icon="translate"
            title={t('settingsScreen.language')}
            value={getCurrentLanguageName()}
            onPress={() => setIsLanguageSelectorVisible(true)}
          />

          {/* Subscription Status - Currently Commented Out */}

          <ListItem
            icon="crown"
            title={t('settingsScreen.subscription')}
            value={
              loading
                ? t('common.loading')
                : purchasing
                ? '처리 중...'
                : isSubscribed
                ? t('settingsScreen.subscriptionActive')
                : t('settingsScreen.subscriptionInactive')
            }
            onPress={!isSubscribed && !purchasing ? handleSubscribePress : null}
            rightElement={
              purchasing ? (
                <View style={styles.purchasingIndicator}>
                  <Text style={styles.purchasingText}>처리 중...</Text>
                </View>
              ) : null
            }
          />

          {/* Delete All Data */}
          <ListItem
            icon="trash-can"
            title={t('settingsScreen.deleteData')}
            onPress={handleDeleteAllData}
          />

          {/* Legal Information Section */}
          <View style={styles.sectionSeparator} />

          <ListItem
            icon="file-document-outline"
            title="Terms of Use"
            onPress={() => Linking.openURL(TERMS_URL)}
          />

          <ListItem
            icon="shield-check"
            title="Privacy Policy"
            onPress={() => Linking.openURL(PRIVACY_URL)}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('settingsScreen.appVersion')}
          </Text>
        </View>
      </ScrollView>

      <LanguageSelector
        isVisible={isLanguageSelectorVisible}
        onClose={() => setIsLanguageSelectorVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d1b1a',
    marginBottom: 16,
    fontFamily: 'System',
  },
  listSection: {
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
  listItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontFamily: 'System',
  },
  listItemValue: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'System',
  },
  profileEditSection: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'System',
  },
  textInputContainer: {
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
    fontFamily: 'System',
  },
  unit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'System',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  saveButton: {
    backgroundColor: '#FF9500',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  purchasingIndicator: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  purchasingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'System',
  },
});

export default SettingsScreen;
