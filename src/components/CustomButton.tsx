import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CustomButtonProps {
  onPress: () => void;
  title: string;
  type?: 'primary' | 'secondary' | 'outline' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  onPress, 
  title, 
  type = 'primary', 
  style, 
  textStyle,
  disabled = false 
}) => {
  const getButtonStyle = () => {
    switch (type) {
      case 'secondary': return styles.secondaryButton;
      case 'outline': return styles.outlineButton;
      case 'danger': return styles.dangerButton;
      default: return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'outline': return styles.outlineText;
      case 'danger': return styles.dangerText;
      default: return styles.buttonText;
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.baseButton, 
        getButtonStyle(), 
        disabled && styles.disabledButton, 
        style
      ]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#4361EE', // Modern Indigo/Blue
  },
  secondaryButton: {
    backgroundColor: '#3F37C9',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#4361EE',
  },
  dangerButton: {
    backgroundColor: '#FF4D4D',
  },
  disabledButton: {
    backgroundColor: '#E1E4E8',
    borderColor: '#E1E4E8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineText: {
    color: '#4361EE',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton;
