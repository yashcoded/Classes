import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import type { UserRole } from '@/types';

const ROLES: { label: string; value: UserRole }[] = [
  { label: '👩‍🏫 Teacher', value: 'teacher' },
  { label: '🎒 Student', value: 'student' },
  { label: '👨‍👩‍👧 Parent', value: 'parent' },
];

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email and password are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(email.trim(), password, name.trim(), role, phone.trim() || undefined);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Classes today</Text>

        {error ? <ErrorMessage message={error} /> : null}

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
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
        <TextInput
          style={styles.input}
          placeholder="Phone (optional)"
          placeholderTextColor="#9CA3AF"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.roleLabel}>I am a:</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[styles.roleButton, role === r.value && styles.roleButtonActive]}
              onPress={() => setRole(r.value)}
            >
              <Text style={[styles.roleText, role === r.value && styles.roleTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Register"
          onPress={() => { void handleRegister(); }}
          loading={loading}
          style={styles.button}
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.link}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 24,
    paddingTop: 48,
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
  roleButton: {
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
  },
  roleButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  roleLabel: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  roleRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
  },
  roleTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 28,
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

export default RegisterScreen;
