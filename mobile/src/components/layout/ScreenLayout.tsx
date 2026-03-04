import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface ScreenLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  style,
  scrollable = true,
}) => {
  if (scrollable) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, style]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, styles.content, style]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  safe: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});

export default ScreenLayout;
