import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { APP_NAME, colors } from '@/constants/branding';

const HIDDEN_BACK_PATHS = new Set([
  '/',
  '/(auth)/login',
  '/(auth)/register',
  '/(teacher)/dashboard',
  '/(student)/dashboard',
  '/(parent)/dashboard',
  '/(admin)/dashboard',
]);

const TopNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const showBack = router.canGoBack() && !HIDDEN_BACK_PATHS.has(pathname);
  const backButton = (
    <View style={styles.side}>
      {showBack ? (
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed ? styles.backButtonPressed : null]}
        >
          <Text style={styles.backLabel}>←</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={52} tint="light" style={styles.container}>
          {backButton}
          <Text numberOfLines={1} style={styles.title}>
            {APP_NAME}
          </Text>
          <View style={styles.side} />
        </BlurView>
      ) : (
        <View style={[styles.container, styles.androidContainer]}>
          {backButton}
          <Text numberOfLines={1} style={styles.title}>
            {APP_NAME}
          </Text>
          <View style={styles.side} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  androidContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    borderColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
  },
  backLabel: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
  container: {
    alignItems: 'center',
    borderBottomColor: 'rgba(148, 163, 184, 0.28)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 52,
    paddingHorizontal: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  safe: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  side: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 40,
  },
  title: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default TopNavBar;
