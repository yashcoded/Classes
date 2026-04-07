import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

const VARIANT_COLORS: Record<
  NonNullable<BadgeProps['variant']>,
  { bg: string; text: string }
> = {
  default: { bg: '#F3F4F6', text: '#374151' },
  danger: { bg: '#FEE2E2', text: '#B91C1C' },
  info: { bg: '#DBEAFE', text: '#1D4ED8' },
  success: { bg: '#D1FAE5', text: '#065F46' },
  warning: { bg: '#FEF3C7', text: '#92400E' },
};

const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const { bg, text } = VARIANT_COLORS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default Badge;
