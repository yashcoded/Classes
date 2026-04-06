import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { APP_NAME, APP_TAGLINE, colors } from '@/constants/branding';

interface AppBrandMarkProps {
  /** Large = login/register; small = dashboard header */
  variant?: 'large' | 'small';
  showTagline?: boolean;
}

const AppBrandMark: React.FC<AppBrandMarkProps> = ({
  variant = 'large',
  showTagline = true,
}) => {
  const isLarge = variant === 'large';
  return (
    <View style={[styles.wrap, !isLarge && styles.wrapSmall]}>
      <Text style={[styles.name, isLarge ? styles.nameLarge : styles.nameSmall]}>{APP_NAME}</Text>
      {isLarge ? <View style={styles.accentRule} /> : null}
      {showTagline && isLarge ? (
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  accentRule: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    height: 3,
    marginBottom: 12,
    marginTop: 10,
    width: 40,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  nameLarge: {
    fontSize: 28,
    textAlign: 'center',
  },
  nameSmall: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
    alignSelf: 'center',
  },
  wrap: {
    alignItems: 'center',
    marginBottom: 28,
  },
  wrapSmall: {
    alignItems: 'flex-start',
    marginBottom: 6,
  },
});

export default AppBrandMark;
