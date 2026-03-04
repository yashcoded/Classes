import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4F46E5" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
