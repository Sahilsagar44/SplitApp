import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { 
  Person, 
  Expense, 
  Payment,
  getPeople, 
  getExpenses, 
  getPayments,
  saveExpenses,
  savePayments
} from '../storage/storage';
import { calculateBalances, BalanceSummary, formatCurrency } from '../utils/split';
import PersonItem from '../components/PersonItem';
import ExpenseItem from '../components/ExpenseItem';
import PaymentItem from '../components/PaymentItem';
import SummaryCard from '../components/SummaryCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface ActivityItem {
  id: string;
  type: 'expense' | 'payment';
  title: string;
  amount: number;
  date: number;
  data: Expense | Payment;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [people, setPeople] = useState<Person[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balances, setBalances] = useState<BalanceSummary[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const loadData = async () => {
    const p = await getPeople();
    const e = await getExpenses();
    const pay = await getPayments();
    
    setPeople(p);
    setExpenses(e);
    setPayments(pay);
    
    const b = calculateBalances(p, e, pay);
    setBalances(b);

    // Combine and sort activities
    const expenseActivities: ActivityItem[] = e.map(exp => ({
      id: exp.id,
      type: 'expense',
      title: exp.title,
      amount: exp.amount,
      date: exp.createdAt,
      data: exp
    }));

    const paymentActivities: ActivityItem[] = pay.map(payment => {
      const fromName = p.find(person => person.id === payment.from)?.name || 'Someone';
      const toName = p.find(person => person.id === payment.to)?.name || 'Someone';
      return {
        id: payment.id,
        type: 'payment',
        title: `${fromName} paid ${toName}`,
        amount: payment.amount,
        date: payment.createdAt,
        data: payment
      };
    });

    const combined = [...expenseActivities, ...paymentActivities]
      .sort((a, b) => b.date - a.date);
    
    setActivities(combined);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleEditExpense = (expense: Expense) => {
    navigation.navigate('AddExpense', { expense });
  };

  const handleDeleteExpense = async (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    await saveExpenses(updated);
    loadData();
  };

  const handleDeletePayment = async (id: string) => {
    const updated = payments.filter(p => p.id !== id);
    await savePayments(updated);
    loadData();
  };

  const renderActivityItem = ({ item }: { item: ActivityItem }) => {
    if (item.type === 'expense') {
      return (
        <ExpenseItem 
          expense={item.data as Expense} 
          people={people}
          onEdit={handleEditExpense} 
          onDelete={handleDeleteExpense}
        />
      );
    }

    return (
      <PaymentItem 
        payment={item.data as Payment}
        people={people}
        onDelete={handleDeletePayment}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey there! 👋</Text>
          <Text style={styles.subGreeting}>Manage your group debts easily</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('AddPerson', {})}
        >
          <Text style={styles.profileButtonText}>Add Friend</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={renderActivityItem}
        ListHeaderComponent={
          <>
            <SummaryCard balances={balances} />

            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryAction]}
                onPress={() => navigation.navigate('AddExpense', {})}
              >
                <Text style={styles.actionButtonText}>+ Add Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={() => navigation.navigate('AddPayment', {})}
              >
                <Text style={styles.secondaryActionText}>Settle Up</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Friends</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendsList}>
              {people.map(person => (
                <PersonItem 
                  key={person.id} 
                  person={person} 
                  onEdit={(p) => navigation.navigate('AddPerson', { person: p })} 
                />
              ))}
              {people.length === 0 && (
                <Text style={styles.emptyText}>Add some friends to get started!</Text>
              )}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No activities yet</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  header: {
    backgroundColor: '#4361EE',
    paddingHorizontal: 25,
    paddingBottom: 25,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 13,
    color: '#EEF2FF',
    marginTop: 2,
  },
  profileButton: {
    backgroundColor: '#FFFFFF30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF50',
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 100,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  primaryAction: {
    backgroundColor: '#4361EE',
    elevation: 4,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  secondaryAction: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#4361EE',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryActionText: {
    color: '#4361EE',
    fontWeight: 'bold',
    fontSize: 14,
  },
  friendsList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  emptyText: {
    color: '#B2BEC3',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    color: '#B2BEC3',
    fontSize: 16,
  },
});

export default HomeScreen;
