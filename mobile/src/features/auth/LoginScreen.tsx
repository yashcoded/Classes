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
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>🎓</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {error ? <ErrorMessage message={error} /> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title="Sign In"
          onPress={() => { void handleLogin(); }}
          loading={loading}
          style={styles.button}
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/register')}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            Don&apos;t have an account?{' '}
            <Text style={styles.link}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  link: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  logo: {
    fontSize: 56,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 32,
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default LoginScreen;
