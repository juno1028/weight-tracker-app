import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import TimePicker from './TimePicker';
import WeightPicker from './WeightPicker';
import WeightCase from './WeightCase';
import {COLORS, COMMON_STYLES} from './styles';
import {WEIGHT_CASES} from './constants';

const WeightInputModal = ({
  isVisible,
  onClose,
  onComplete,
  onDelete,
  editingEntry,
  initialWeight = 67.5,
  initialTime = new Date(),
}) => {
  const [selectedWeight, setSelectedWeight] = useState(initialWeight);
  const [selectedHour, setSelectedHour] = useState(initialTime.getHours());
  const [selectedMinute, setSelectedMinute] = useState(
    initialTime.getMinutes(),
  );
  const [selectedCase, setSelectedCase] = useState(WEIGHT_CASES.NONE.id);

  useEffect(() => {
    if (isVisible) {
      if (editingEntry) {
        setSelectedWeight(editingEntry.weight);
        setSelectedHour(new Date(editingEntry.timestamp).getHours());
        setSelectedMinute(new Date(editingEntry.timestamp).getMinutes());
        setSelectedCase(editingEntry.case);
      } else {
        setSelectedWeight(initialWeight);
        setSelectedHour(initialTime.getHours());
        setSelectedMinute(initialTime.getMinutes());
        setSelectedCase(WEIGHT_CASES.NONE.id);
      }
    }
  }, [isVisible, initialWeight, initialTime, editingEntry]);

  const handleTimeChange = (hour, minute) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
  };

  const handleComplete = () => {
    const date = new Date();
    date.setHours(selectedHour);
    date.setMinutes(selectedMinute);
    onComplete(selectedWeight, date, selectedCase);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
          onTouchEnd={e => e.stopPropagation()}>
          {/* 시간 선택 섹션 */}
          <View style={styles.section}>
            <View style={COMMON_STYLES.sectionContent}>
              <View style={COMMON_STYLES.displaySide}>
                <Text style={styles.timeDisplay}>
                  {selectedHour.toString().padStart(2, '0')}:
                  {selectedMinute.toString().padStart(2, '0')}
                </Text>
              </View>
              <TimePicker
                selectedHour={selectedHour}
                selectedMinute={selectedMinute}
                onTimeChange={handleTimeChange}
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* 체중 선택 섹션 */}
          <View style={styles.section}>
            <View style={COMMON_STYLES.sectionContent}>
              <View style={COMMON_STYLES.displaySide}>
                <Text style={styles.weightDisplay}>
                  {selectedWeight.toFixed(1)}
                  <Text style={styles.unit}>kg</Text>
                </Text>
              </View>
              <WeightPicker
                selectedWeight={selectedWeight}
                onWeightChange={setSelectedWeight}
              />
            </View>
          </View>
          <WeightCase
            selectedCase={selectedCase}
            onSelectCase={setSelectedCase}
          />

          <View style={styles.buttonContainer}>
            {editingEntry && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    '삭제 확인',
                    '정말 삭제하시겠습니까?',
                    [
                      {
                        text: '취소',
                        style: 'cancel',
                      },
                      {
                        text: '삭제',
                        onPress: () => onDelete?.(editingEntry),
                        style: 'destructive',
                      },
                    ],
                    {cancelable: false},
                  );
                }}>
                <Text style={styles.deleteButtonText}>삭제</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.completeButton,
                !editingEntry && styles.completeButtonFullWidth,
              ]}
              onPress={handleComplete}>
              <Text style={styles.completeButtonText}>완료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  section: {
    marginVertical: 10,
  },
  timeDisplay: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  weightDisplay: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  unit: {
    fontSize: 20,
    marginLeft: 5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.separator,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    paddingVertical: 20,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  completeButton: {
    flex: 2,
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    borderRadius: 10,
  },
  completeButtonFullWidth: {
    flex: 1,
  },
  completeButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WeightInputModal;
