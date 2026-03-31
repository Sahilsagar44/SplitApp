import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Person, Expense, Payer, getPeople, getExpenses, saveExpenses } from '../storage/storage';
import CustomButton from '../components/CustomButton';
import PersonAvatar from '../components/PersonAvatar';
import PayerInputRow from '../components/PayerInputRow';
import { formatCurrency, autoAddAllPayers } from '../utils/split';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddExpense'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;

interface PayerState {
  personId: string;
  amount: string;
}

const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const editingExpense = route.params?.expense;

  const [title, setTitle] = useState(editingExpense?.title || '');
  const [amount, setAmount] = useState(editingExpense?.amount?.toString() || '');
  const [payers, setPayers] = useState<PayerState[]>(
    editingExpense?.payers.map(p => ({ personId: p.personId, amount: p.amount.toString() })) || []
  );
  const [splitBetween, setSplitBetween] = useState<string[]>(editingExpense?.splitBetween || []);
  const [people, setPeople] = useState<Person[]>([]);
  const [showPayerPicker, setShowPayerPicker] = useState(false);
  const [isSplitEqually, setIsSplitEqually] = useState<boolean>(!editingExpense); // Default to true for new ones

  useEffect(() => {
    const loadPeople = async () => {
      const p = await getPeople();
      setPeople(p);
      if (!editingExpense && p.length > 0) {
        // Default with first person as payer
        setPayers([{ personId: p[0].id, amount: '' }]);
        setSplitBetween(p.map(person => person.id));
      }
    };
    loadPeople();
  }, []);

  // Reactive Re-balancing: Auto-update payer amounts if in "Equal" mode
  useEffect(() => {
    if (isSplitEqually && payers.length > 0) {
      const total = parseFloat(amount);
      if (!isNaN(total) && total > 0) {
        // Use the robust utility that handles precision/rounding remainders
        const balancedPayers = autoAddAllPayers(payers.map(p => p.personId), total);
        
        // Only update if current amounts are different (to avoid loops)
        const currentAmountsString = JSON.stringify(payers.map(p => p.amount));
        const newAmountsString = JSON.stringify(balancedPayers.map(p => p.amount));
        
        if (currentAmountsString !== newAmountsString) {
          setPayers(balancedPayers);
        }
      }
    }
  }, [isSplitEqually, amount, payers.length]);

  // Sync logic: If a person is removed from splitBetween, also remove them from payers
  useEffect(() => {
    const updatedPayersList = payers.filter(p => splitBetween.includes(p.personId));
    if (updatedPayersList.length !== payers.length) {
      setPayers(updatedPayersList);
    }
  }, [splitBetween]);

  const toggleSplitParticipant = (id: string) => {
    if (splitBetween.includes(id)) {
      setSplitBetween(splitBetween.filter(pid => pid !== id));
    } else {
      setSplitBetween([...splitBetween, id]);
    }
  };

  const addPayer = (personId: string) => {
    if (payers.some(p => p.personId === personId)) return;
    setPayers([...payers, { personId, amount: '' }]);
    setShowPayerPicker(false);
  };

  const handleAutoAddAll = () => {
    const total = parseFloat(amount);
    if (isNaN(total) || total <= 0) {
      Alert.alert('Error', 'Please enter a total amount first');
      return;
    }
    if (splitBetween.length === 0) {
      Alert.alert('Error', 'Please select people in "Split between" first');
      return;
    }
    
    // Switch on equal split mode
    setIsSplitEqually(true);
    
    const newPayers = autoAddAllPayers(splitBetween, total);
    setPayers(newPayers);
    setShowPayerPicker(false);
  };

  const updatePayerAmount = (index: number, val: string) => {
    // Manually editing turns off equal split mode
    setIsSplitEqually(false);
    
    const updated = [...payers];
    updated[index].amount = val;
    setPayers(updated);
  };

  const removePayer = (index: number) => {
    if (payers.length === 1) return;
    const updated = [...payers];
    updated.splice(index, 1);
    setPayers(updated);
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!title.trim() || !amount.trim() || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid title and amount');
      return;
    }

    const payerObjs: Payer[] = payers.map(p => ({
      personId: p.personId,
      amount: parseFloat(p.amount) || 0
    }));

    const sumPayers = payerObjs.reduce((sum, p) => sum + p.amount, 0);
    
    // Check for precision issues with floating numbers
    if (Math.abs(sumPayers - numAmount) > 0.01) {
      Alert.alert('Error', `Sum of payer amounts (${formatCurrency(sumPayers)}) doesn't match total (${formatCurrency(numAmount)})`);
      return;
    }

    if (splitBetween.length === 0) {
      Alert.alert('Error', 'Please select at least one person to split with');
      return;
    }

    const expenses = await getExpenses();
    
    const expenseData: Expense = {
      id: editingExpense?.id || Date.now().toString(),
      title: title.trim(),
      amount: numAmount,
      payers: payerObjs,
      splitBetween,
      createdAt: editingExpense?.createdAt || Date.now(),
    };

    if (editingExpense) {
      const updated = expenses.map(e => e.id === editingExpense.id ? expenseData : e);
      await saveExpenses(updated);
    } else {
      await saveExpenses([...expenses, expenseData]);
    }

    navigation.goBack();
  };

  const handleDelete = async () => {
    if (!editingExpense) return;

    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const expenses = await getExpenses();
            const updated = expenses.filter(e => e.id !== editingExpense.id);
            await saveExpenses(updated);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const totalAllocated = payers.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const remaining = parseFloat(amount) ? parseFloat(amount) - totalAllocated : 0;
  
  const isFormValid = title.trim() !== '' && 
                      amount.trim() !== '' && 
                      !isNaN(parseFloat(amount)) && 
                      payers.length > 0 && 
                      splitBetween.length > 0 && 
                      Math.abs(remaining) < 0.01;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Info Section */}
          <View style={styles.mainInfo}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Dinner, Movies, etc."
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#B2BEC3"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Total Amount</Text>
              <View style={[styles.amountContainer, amount && isNaN(parseFloat(amount)) && styles.inputError]}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholderTextColor="#B2BEC3"
                />
              </View>
            </View>
          </View>

          {/* Payers Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Paid By</Text>
              <View style={styles.payerActions}>
                <TouchableOpacity 
                  onPress={handleAutoAddAll} 
                  style={[styles.quickAddButton, isSplitEqually && styles.quickAddButtonActive]}
                >
                  <Text style={[styles.quickAddText, isSplitEqually && styles.quickAddTextActive]}>
                    {isSplitEqually ? '⚡ Equally' : '⚡ Split Equally'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowPayerPicker(!showPayerPicker)}>
                  <Text style={styles.addPayerText}>{showPayerPicker ? 'Cancel' : '+ Add'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {showPayerPicker && (
              <View style={styles.payerPicker}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {people.filter(p => !payers.some(payer => payer.personId === p.id)).map(person => (
                    <TouchableOpacity 
                      key={person.id}
                      style={styles.pickerItem}
                      onPress={() => addPayer(person.id)}
                    >
                      <PersonAvatar name={person.name} size={36} />
                      <Text style={styles.pickerName}>{person.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {payers.map((payerState, idx) => {
              const person = people.find(p => p.id === payerState.personId);
              if (!person) return null;
              return (
                <PayerInputRow 
                  key={payerState.personId}
                  person={person}
                  amount={payerState.amount}
                  onAmountChange={(val) => updatePayerAmount(idx, val)}
                  onRemove={() => removePayer(idx)}
                />
              );
            })}

            {amount && !isNaN(parseFloat(amount)) && (
              <View style={styles.validationRow}>
                <Text style={[styles.validationText, Math.abs(remaining) > 0.01 ? styles.textDebt : styles.textSuccess]}>
                  {Math.abs(remaining) < 0.01 
                    ? 'Total Allocated' 
                    : `${formatCurrency(Math.abs(remaining))} ${remaining > 0 ? 'remaining to allocate' : 'over allocated'}`}
                </Text>
              </View>
            )}
          </View>

          {/* Split Between Section */}
          <View style={styles.section}>
            <View style={styles.splitHeader}>
              <Text style={styles.sectionTitle}>Split between</Text>
              <Text style={styles.splitCount}>
                {splitBetween.length} selected
              </Text>
            </View>
            <View style={styles.checkboxList}>
              {people.map(person => {
                const isSelected = splitBetween.includes(person.id);
                const perPersonValue = isFormValid ? parseFloat(amount) / splitBetween.length : 0;
                
                return (
                  <TouchableOpacity 
                    key={person.id}
                    style={[
                      styles.checkboxItem,
                      isSelected && styles.checkboxItemSelected
                    ]}
                    onPress={() => toggleSplitParticipant(person.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.checkboxInfo}>
                      <PersonAvatar name={person.name} size={32} />
                      <Text style={[
                        styles.checkboxName,
                        isSelected && styles.checkboxNameSelected
                      ]}>{person.name}</Text>
                    </View>
                    {isSelected && isFormValid && (
                      <Text style={styles.perPersonValue}>
                        {formatCurrency(perPersonValue)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <CustomButton 
              title={editingExpense ? 'Update Expense' : 'Add Expense'} 
              onPress={handleSave}
              disabled={!isFormValid}
              style={styles.saveButton}
            />

            {editingExpense && (
              <CustomButton 
                title="Delete Expense" 
                onPress={handleDelete}
                type="danger"
                style={styles.deleteButton}
              />
            )}
            
            <CustomButton 
              title="Cancel" 
              onPress={() => navigation.goBack()}
              type="outline"
              style={styles.cancelButton}
            />
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 25,
  },
  mainInfo: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E9AAF',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#F8F9FE',
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#FF5252',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
  },
  payerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickAddButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 10,
  },
  quickAddButtonActive: {
    backgroundColor: '#4361EE',
  },
  quickAddText: {
    color: '#4361EE',
    fontWeight: '700',
    fontSize: 12,
  },
  quickAddTextActive: {
    color: '#fff',
  },
  addPayerText: {
    color: '#4361EE',
    fontWeight: '700',
    fontSize: 14,
  },
  payerPicker: {
    backgroundColor: '#F8F9FE',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  pickerItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 60,
  },
  pickerName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#636E72',
    marginTop: 4,
    textAlign: 'center',
  },
  validationRow: {
    alignItems: 'flex-end',
    marginTop: 5,
  },
  validationText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textSuccess: {
    color: '#00C853',
  },
  textDebt: {
    color: '#FF5252',
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  splitCount: {
    fontSize: 12,
    color: '#4361EE',
    fontWeight: '700',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  checkboxList: {
    backgroundColor: '#F8F9FE',
    borderRadius: 16,
    padding: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 5,
  },
  checkboxItemSelected: {
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  checkboxInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxName: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#636E72',
  },
  checkboxNameSelected: {
    color: '#2D3436',
    fontWeight: '700',
  },
  perPersonValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4361EE',
  },
  footer: {
    marginTop: 10,
  },
  saveButton: {
    marginBottom: 12,
  },
  deleteButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default AddExpenseScreen;
