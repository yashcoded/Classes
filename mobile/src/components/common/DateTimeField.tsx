import React, { useMemo, useState } from 'react';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '@/constants/branding';

type PickerMode = 'date' | 'datetime';
type IosPickerMode = 'date' | 'time' | null;

interface DateTimeFieldProps {
  label: string;
  value: Date | null;
  onChange: (next: Date) => void;
  mode?: PickerMode;
}

function resolvePickerDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (
    typeof value === 'object' &&
    value !== null &&
    'nativeEvent' in value &&
    typeof (value as { nativeEvent?: { timestamp?: unknown } }).nativeEvent?.timestamp === 'number'
  ) {
    return new Date((value as { nativeEvent: { timestamp: number } }).nativeEvent.timestamp);
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'timestamp' in value &&
    typeof (value as { timestamp?: unknown }).timestamp === 'number'
  ) {
    return new Date((value as { timestamp: number }).timestamp);
  }
  return null;
}

const DateTimeField: React.FC<DateTimeFieldProps> = ({
  label,
  value,
  onChange,
  mode = 'date',
}) => {
  const [iosPickerMode, setIosPickerMode] = useState<IosPickerMode>(null);
  const [iosPickerDraft, setIosPickerDraft] = useState<Date>(value ?? new Date());

  const isDateTime = mode === 'datetime';

  const preview = useMemo(() => {
    if (!value) return isDateTime ? 'Select date and time' : 'Select date';
    if (isDateTime) {
      return value.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return value.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [value, isDateTime]);

  const applyDate = (selected: Date) => {
    const base = value ?? new Date();
    const next = new Date(base);
    next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    onChange(next);
  };

  const applyTime = (selected: Date) => {
    const base = value ?? new Date();
    const next = new Date(base);
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    onChange(next);
  };

  const onAndroidPick = (target: 'date' | 'time') => {
    DateTimePickerAndroid.open({
      mode: target,
      value: value ?? new Date(),
      onChange: (_event, selectedDate) => {
        const selected = resolvePickerDate(selectedDate);
        if (!selected) return;
        if (target === 'date') applyDate(selected);
        else applyTime(selected);
      },
      is24Hour: false,
    });
  };

  const openDate = () => {
    if (Platform.OS === 'android') return onAndroidPick('date');
    setIosPickerDraft(value ?? new Date());
    setIosPickerMode('date');
  };

  const openTime = () => {
    if (Platform.OS === 'android') return onAndroidPick('time');
    setIosPickerDraft(value ?? new Date());
    setIosPickerMode('time');
  };

  const closeIosPicker = () => setIosPickerMode(null);

  const applyIosSelection = () => {
    if (iosPickerMode === 'date') applyDate(iosPickerDraft);
    if (iosPickerMode === 'time') applyTime(iosPickerDraft);
    closeIosPicker();
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {isDateTime ? (
        <>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.button, styles.half]} onPress={openDate}>
              <Text style={styles.buttonLabel}>Date</Text>
              <Text style={styles.buttonValue}>
                {value
                  ? value.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Choose'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.half]} onPress={openTime}>
              <Text style={styles.buttonLabel}>Time</Text>
              <Text style={styles.buttonValue}>
                {value
                  ? value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Choose'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Selected schedule</Text>
            <Text style={styles.previewValue}>{preview}</Text>
          </View>
        </>
      ) : (
        <TouchableOpacity style={styles.button} onPress={openDate}>
          <Text style={styles.buttonLabel}>Date</Text>
          <Text style={styles.buttonValue}>{preview}</Text>
        </TouchableOpacity>
      )}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={iosPickerMode !== null}
          animationType="slide"
          transparent
          onRequestClose={closeIosPicker}
        >
          <BlurView intensity={38} tint="light" style={styles.modalBackdrop}>
            <Pressable style={styles.overlay} onPress={closeIosPicker}>
              <Pressable style={styles.sheet} onPress={() => undefined}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>
                    Select {iosPickerMode === 'date' ? 'Date' : 'Time'}
                  </Text>
                  <TouchableOpacity onPress={applyIosSelection}>
                    <Text style={styles.sheetDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  mode={iosPickerMode ?? 'date'}
                  display="spinner"
                  value={iosPickerDraft}
                  style={styles.picker}
                  themeVariant="light"
                  textColor={colors.textPrimary}
                  onChange={(_event, selectedDate) => {
                    const selected = resolvePickerDate(selectedDate);
                    if (!selected) return;
                    setIosPickerDraft(selected);
                  }}
                />
              </Pressable>
            </Pressable>
          </BlurView>
        </Modal>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  half: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  buttonValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  preview: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  previewLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  previewValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderColor: 'rgba(255, 255, 255, 0.55)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    paddingBottom: 24,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  sheetTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  sheetDone: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  picker: {
    backgroundColor: '#FFFFFF',
    height: 220,
    width: '100%',
  },
});

export default DateTimeField;
