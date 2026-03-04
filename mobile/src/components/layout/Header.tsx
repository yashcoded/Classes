import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: { label: string; onPress: () => void };
}

const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction }) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>
        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress}>
            <Text style={styles.actionText}>{rightAction.label}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    padding: 4,
  },
  backText: {
    color: '#4F46E5',
    fontSize: 15,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
    flex: 1,
  },
  title: {
    color: '#111827',
    flex: 2,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default Header;
