import React, { useCallback, useEffect, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBrandMark from '@/components/common/AppBrandMark';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { colors } from '@/constants/branding';
import { useAuth } from '@/hooks/useAuth';
import { useGoogleSignIn, isGoogleOAuthConfigured } from '@/hooks/useGoogleSignIn';
import * as approvalApi from '@/services/approvalApi';
import type { User, UserRole } from '@/types';

const ROLES: { label: string; value: UserRole }[] = [
  { label: '👩‍🏫 Teacher', value: 'teacher' },
  { label: '🎓 Student', value: 'student' },
  { label: '👪 Parent', value: 'parent' },
];

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const { promptGoogle, canPrompt } = useGoogleSignIn();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [teachersLoading, setTeachersLoading] = useState(false);

  const loadTeachers = useCallback(async () => {
    setTeachersLoading(true);
    try {
      const list = await approvalApi.getApprovedTeachers();
      setTeachers(list);
    } catch {
      /* non-blocking */
    } finally {
      setTeachersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === 'student') {
      void loadTeachers();
    }
  }, [role, loadTeachers]);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email and password are required.');
      return;
    }
    if (role === 'student' && !selectedTeacherId) {
      setError('Please select a teacher.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(email.trim(), password, name.trim(), role, phone.trim() || undefined);
      if (role === 'student' && selectedTeacherId) {
        try {
          await approvalApi.requestStudentTeacherLink(selectedTeacherId);
        } catch {
          /* link request is best-effort; student can retry from dashboard */
        }
      }
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (role === 'student' && !selectedTeacherId) {
      setError('Please select a teacher before continuing with Google.');
      return;
    }
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
        role,
        teacherId: role === 'student' && selectedTeacherId ? selectedTeacherId : undefined,
      });
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google registration failed');
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
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <AppBrandMark variant="large" showTagline />
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Join Class Konnect 🌟</Text>
          <Text style={styles.screenSubtitle}>
            Pick your role, sign up in seconds — stay organized, celebrate progress 🎉 (Teachers get
            admin approval first.)
          </Text>
        </View>

        {error ? <ErrorMessage message={error} /> : null}

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
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
        <TextInput
          style={styles.input}
          placeholder="Phone (optional)"
          placeholderTextColor={colors.textMuted}
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

        {role === 'teacher' && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Your account will require admin approval before you can access all features.
            </Text>
          </View>
        )}

        {role === 'student' && (
          <View style={styles.teacherSection}>
            <Text style={styles.roleLabel}>Select your teacher:</Text>
            {teachersLoading ? (
              <Text style={styles.loadingText}>Loading teachers...</Text>
            ) : teachers.length === 0 ? (
              <Text style={styles.loadingText}>No approved teachers available yet.</Text>
            ) : (
              teachers.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.teacherOption,
                    selectedTeacherId === t.id && styles.teacherOptionActive,
                  ]}
                  onPress={() => setSelectedTeacherId(t.id)}
                >
                  <Text
                    style={[
                      styles.teacherName,
                      selectedTeacherId === t.id && styles.teacherNameActive,
                    ]}
                  >
                    {t.name}
                  </Text>
                  <Text style={styles.teacherEmail}>{t.email}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          title="🔐 Continue with Google"
          onPress={() => { void handleGoogleRegister(); }}
          loading={googleLoading}
          disabled={!canPrompt || !isGoogleOAuthConfigured()}
          variant="secondary"
          style={styles.googleButton}
        />
        {!isGoogleOAuthConfigured() ? (
          <Text style={styles.googleHint}>
            Add Google client IDs to mobile/.env (see docs/GOOGLE_AND_EMAIL.md).
          </Text>
        ) : (
          <Text style={styles.googleHint}>
            Uses your Google name and email. Pick your role (and teacher if student) first.
          </Text>
        )}

        <Button
          title="✨ Register with email"
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
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
    marginBottom: 16,
    marginTop: 8,
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
    marginBottom: 8,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    marginBottom: 20,
    marginTop: 0,
  },
  inner: {
    flexGrow: 1,
    paddingBottom: 36,
    paddingHorizontal: 24,
    paddingTop: 20,
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
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 12,
  },
  notice: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },
  noticeText: {
    color: '#78350F',
    fontSize: 13,
    lineHeight: 19,
  },
  roleButton: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
  },
  roleButtonActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  roleLabel: {
    color: colors.textPrimary,
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
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  roleTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  screenSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  teacherEmail: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  teacherName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  teacherNameActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  teacherOption: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    padding: 14,
  },
  teacherOptionActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  teacherSection: {
    marginBottom: 16,
  },
});

export default RegisterScreen;
