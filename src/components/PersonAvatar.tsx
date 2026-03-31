import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getInitials, getRandomSoftColor, getContrastColor } from '../utils/split';

interface PersonAvatarProps {
  name: string;
  size?: number;
}

const PersonAvatar: React.FC<PersonAvatarProps> = ({ name, size = 50 }) => {
  const backgroundColor = getRandomSoftColor(name);
  const textColor = getContrastColor(name);
  const initials = getInitials(name);

  return (
    <View 
      style={[
        styles.avatar, 
        { width: size, height: size, borderRadius: size / 2, backgroundColor }
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4, color: textColor }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  initials: {
    fontWeight: 'bold',
  },
});

export default PersonAvatar;
