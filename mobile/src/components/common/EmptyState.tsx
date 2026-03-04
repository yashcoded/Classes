import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  description: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default EmptyState;
