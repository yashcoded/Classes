import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBrandMark from '@/components/common/AppBrandMark';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { colors } from '@/constants/branding';
import { useAuth } from '@/hooks/useAuth';
import { useGoogleSignIn, isGoogleOAuthConfigured } from '@/hooks/useGoogleSignIn';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const { promptGoogle, canPrompt } = useGoogleSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const tokens = await promptGoogle();
      if (!tokens?.idToken && !tokens?.accessToken) {
        setError('Google sign-in was cancelled or failed.');
        return;
      }
      await loginWithGoogle({
        idToken: tokens.idToken,
        accessToken: tokens.accessToken,
      });
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <AppBrandMark variant="large" showTagline />
        <Text style={styles.screenTitle}>Welcome back! 👋</Text>
        <Text style={styles.screenSubtitle}>
          Teachers love the calm dashboard ✨ Students stay on top of class 🎯 — sign in and jump in!
        </Text>

        {error ? <ErrorMessage message={error} /> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title="🚀 Sign in"
          onPress={() => { void handleLogin(); }}
          loading={loading}
          style={styles.button}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or with Google</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          title="🔐 Continue with Google"
          onPress={() => { void handleGoogle(); }}
          loading={googleLoading}
          disabled={!canPrompt || !isGoogleOAuthConfigured()}
          variant="secondary"
          style={styles.googleButton}
        />
        {!isGoogleOAuthConfigured() ? (
          <Text style={styles.googleHint}>
            Add Google client IDs to mobile/.env (see docs/GOOGLE_AND_EMAIL.md).
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={() => router.push('/(auth)/register')}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            New here?{' '}
            <Text style={styles.link}>Create an account ✨</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
  container: {
    flex: 1,
  },
  dividerLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 20,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 13,
    marginHorizontal: 12,
  },
  googleButton: {
    marginTop: 0,
  },
  googleHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  screenSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
});

export default LoginScreen;
