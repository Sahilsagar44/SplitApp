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
import { Person, Payment, getPeople, getPayments, savePayments } from '../storage/storage';
import CustomButton from '../components/CustomButton';
import PersonAvatar from '../components/PersonAvatar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddPayment'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'AddPayment'>;

const AddPaymentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  
  const [amount, setAmount] = useState(route.params?.initialAmount?.toString() || '');
  const [payerId, setPayerId] = useState(route.params?.initialPayerId || '');
  const [payeeId, setPayeeId] = useState(route.params?.initialPayeeId || '');
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    const loadPeople = async () => {
      const p = await getPeople();
      setPeople(p);
    };
    loadPeople();
  }, []);

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!payerId || !payeeId) {
      Alert.alert('Error', 'Please select both who paid and who received');
      return;
    }

    if (payerId === payeeId) {
      Alert.alert('Error', 'Payer and Payee cannot be the same person');
      return;
    }

    const payments = await getPayments();
    const newPayment: Payment = {
      id: Date.now().toString(),
      from: payerId,
      to: payeeId,
      amount: numAmount,
      createdAt: Date.now(),
    };

    await savePayments([...payments, newPayment]);
    navigation.goBack();
  };

  const isFormValid = amount !== '' && !isNaN(parseFloat(amount)) && payerId !== '' && payeeId !== '';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Settle Up</Text>
            <Text style={styles.headerSubtitle}>Record a direct payment between members</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount Paid</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor="#B2BEC3"
                autoFocus
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payer (Who paid?)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.personPicker}>
              {people.map(person => (
                <TouchableOpacity 
                  key={`from-${person.id}`}
                  style={[styles.personItem, payerId === person.id && styles.personItemSelected]}
                  onPress={() => setPayerId(person.id)}
                >
                  <PersonAvatar name={person.name} size={48} />
                  <Text style={[styles.personName, payerId === person.id && styles.personNameSelected]}>
                    {person.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payee (Who received?)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.personPicker}>
              {people.map(person => (
                <TouchableOpacity 
                  key={`to-${person.id}`}
                  style={[styles.personItem, payeeId === person.id && styles.personItemSelectedPayee]}
                  onPress={() => setPayeeId(person.id)}
                >
                  <PersonAvatar name={person.name} size={48} />
                  <Text style={[styles.personName, payeeId === person.id && styles.personNameSelectedPayee]}>
                    {person.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <CustomButton 
              title="Record Payment" 
              onPress={handleSave}
              disabled={!isFormValid}
            />
            <CustomButton 
              title="Cancel" 
              onPress={() => navigation.goBack()}
              type="outline"
              style={{ marginTop: 12 }}
            />
          </View>
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
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 30,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E9AAF',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#4361EE20',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4361EE',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 20,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 15,
  },
  personPicker: {
    flexDirection: 'row',
  },
  personItem: {
    alignItems: 'center',
    marginRight: 20,
    padding: 10,
    borderRadius: 16,
    width: 80,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  personItemSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4361EE20',
  },
  personItemSelectedPayee: {
    backgroundColor: '#ECFDF5',
    borderColor: '#05966920',
  },
  personName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#636E72',
    textAlign: 'center',
  },
  personNameSelected: {
    color: '#4361EE',
    fontWeight: '700',
  },
  personNameSelectedPayee: {
    color: '#059669',
    fontWeight: '700',
  },
  footer: {
    marginTop: 10,
    marginBottom: 30,
  },
});

export default AddPaymentScreen;
