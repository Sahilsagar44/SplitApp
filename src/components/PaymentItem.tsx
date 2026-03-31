import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Payment, Person } from '../storage/storage';
import { formatCurrency } from '../utils/split';

interface PaymentItemProps {
  payment: Payment;
  people: Person[];
  onDelete: (id: string) => void;
}

const PaymentItem: React.FC<PaymentItemProps> = ({ payment, people, onDelete }) => {
  const fromName = people.find(p => p.id === payment.from)?.name || 'Unknown';
  const toName = people.find(p => p.id === payment.to)?.name || 'Unknown';
  const dateStr = new Date(payment.createdAt).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric' 
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment record permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete(payment.id)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💸</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            <Text style={styles.bold}>{fromName}</Text> paid <Text style={styles.bold}>{toName}</Text>
          </Text>
          <Text style={styles.subtext}>{dateStr}</Text>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#2D3436',
    fontWeight: '500',
  },
  bold: {
    fontWeight: '700',
    color: '#2D3436',
  },
  subtext: {
    fontSize: 11,
    color: '#B2BEC3',
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  amount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#059669',
  },
  deleteButton: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  deleteText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF5252',
    textTransform: 'uppercase',
  },
});

export default PaymentItem;
