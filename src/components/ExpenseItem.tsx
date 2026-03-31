import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Expense, Person } from '../storage/storage';
import { formatCurrency } from '../utils/split';
import PersonAvatar from './PersonAvatar';

interface ExpenseItemProps {
  expense: Expense;
  people: Person[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, people, onEdit, onDelete }) => {
  const payerNames = expense.payers
    .map(p => people.find(person => person.id === p.personId)?.name || 'Unknown')
    .filter((v, i, a) => a.indexOf(v) === i); // Unique names
  
  const mainPayerName = payerNames[0] || 'Unknown';
  const otherPayersCount = (expense.payers.length > 1) ? ` + ${expense.payers.length - 1} others` : '';
  
  const splitCount = expense.splitBetween.length;
  const dateStr = new Date(expense.createdAt).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onEdit(expense)}
      activeOpacity={0.8}
    >
      <View style={styles.leftSection}>
        <PersonAvatar name={mainPayerName} size={44} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{expense.title}</Text>
          <Text style={styles.subtext} numberOfLines={1}>
            Paid by <Text style={styles.bold}>{mainPayerName}{otherPayersCount}</Text>
          </Text>
          <Text style={styles.caption}>{splitCount} people split</Text>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        <Text style={styles.date}>{dateStr}</Text>
      </View>
    </TouchableOpacity>
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  info: {
    marginLeft: 15,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 2,
  },
  subtext: {
    fontSize: 13,
    color: '#636E72',
  },
  caption: {
    fontSize: 11,
    color: '#B2BEC3',
    marginTop: 2,
  },
  bold: {
    fontWeight: '600',
    color: '#4361EE',
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  amount: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  date: {
    fontSize: 11,
    color: '#B2BEC3',
    marginTop: 4,
  },
});

export default ExpenseItem;
