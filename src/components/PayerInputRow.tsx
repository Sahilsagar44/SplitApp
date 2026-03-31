import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Person } from '../storage/storage';
import PersonAvatar from './PersonAvatar';

interface PayerInputRowProps {
  person: Person;
  amount: string;
  onAmountChange: (amount: string) => void;
  onRemove: () => void;
}

const PayerInputRow: React.FC<PayerInputRowProps> = ({ person, amount, onAmountChange, onRemove }) => {
  return (
    <View style={styles.container}>
      <View style={styles.personInfo}>
        <PersonAvatar name={person.name} size={36} />
        <Text style={styles.name} numberOfLines={1}>{person.name}</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.currencySymbol}>₹</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={amount}
          onChangeText={onAmountChange}
          keyboardType="numeric"
          placeholderTextColor="#B2BEC3"
        />
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
    borderRadius: 8,
    paddingHorizontal: 8,
    width: 140,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3436',
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  removeButton: {
    padding: 4,
    marginLeft: 4,
  },
  removeButtonText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PayerInputRow;
