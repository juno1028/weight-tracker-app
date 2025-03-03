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
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useUser} from '../contexts/UserContext';
import {useSubscription} from '../contexts/SubscriptionContext';

const SettingsScreen = () => {
  const {height, weight, updateUserData} = useUser();
  const [heightInput, setHeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const {isSubscribed, loading, handlePurchase} = useSubscription();

  useEffect(() => {
    if (height) setHeightInput(height.toString());
    if (weight) setWeightInput(weight.toString());
  }, [height, weight]);

  const handleSaveProfile = async () => {
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

  const handleSubscribePress = async () => {
    if (!isSubscribed) {
      const success = await handlePurchase();
      if (success) {
        Alert.alert('성공', '구독이 완료되었습니다.');
      } else {
        Alert.alert('오류', '구독 처리 중 문제가 발생했습니다.');
      }
    }
  };

  const ListItem = ({icon, title, onPress, value, color}) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.listItemContent}>
        <View style={styles.listItemLeft}>
          <Icon name={icon} size={22} color={color || '#FF9500'} />
          <Text style={styles.listItemTitle}>{title}</Text>
        </View>
        {value ? (
          <Text style={styles.listItemValue}>{value}</Text>
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
          <Text style={styles.headerTitle}>설정</Text>
        </View>

        {/* User Profile Section */}
        <View style={styles.profileContainer}>
          <View style={styles.profileIconContainer}>
            <Icon name="account" size={40} color="#fff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileTitle}>내 프로필</Text>
            <Text style={styles.profileSubtitle}>
              {height && weight
                ? `${height}cm, ${weight}kg`
                : '신체 정보를 입력해주세요'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileEditButton}
            onPress={() => {
              // Open profile edit section
            }}>
            <Icon name="pencil" size={18} color="#FF9500" />
          </TouchableOpacity>
        </View>

        {/* Body Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>신체 정보</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>키</Text>
              <View style={styles.textInputContainer}>
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>몸무게</Text>
              <View style={styles.textInputContainer}>
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

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>저장</Text>
          </TouchableOpacity>
        </View>

        {/* Settings List */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>설정</Text>

          {/* Subscription Status */}
          <ListItem
            icon="crown"
            title="프리미엄"
            color={isSubscribed ? '#FFD700' : '#FF9500'}
            value={loading ? '로딩중...' : isSubscribed ? '사용중' : '미사용'}
            onPress={!isSubscribed ? handleSubscribePress : null}
          />

          {/* Other settings */}
          <ListItem icon="bell" title="알림 설정" onPress={() => {}} />

          <ListItem
            icon="theme-light-dark"
            title="테마 설정"
            onPress={() => {}}
          />

          <ListItem icon="information" title="앱 정보" onPress={() => {}} />
        </View>

        {/* Upgrade Button - only if not subscribed */}
        {!isSubscribed && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleSubscribePress}
            activeOpacity={0.8}>
            <Icon name="crown" size={20} color="#FFF" />
            <Text style={styles.upgradeButtonText}>
              프리미엄으로 업그레이드
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>버전 1.0.0</Text>
        </View>
      </ScrollView>
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
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  profileIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  profileEditButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  },
  unit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    paddingVertical: 12,
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
  },
  listItemValue: {
    fontSize: 14,
    color: '#999',
  },
  upgradeButton: {
    flexDirection: 'row',
    backgroundColor: '#FF9500',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;
