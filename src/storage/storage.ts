import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Person {
  id: string;
  name: string;
}

export interface Payer {
  personId: string;
  amount: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  payers: Payer[]; // Replaced paidBy: string
  splitBetween: string[]; // person ids
  createdAt: number;
}

export interface Payment {
  id: string;
  from: string; // personId
  to: string; // personId
  amount: number;
  createdAt: number;
}

const PEOPLE_KEY = '@people';
const EXPENSES_KEY = '@expenses';
const PAYMENTS_KEY = '@payments';

export const getPeople = async (): Promise<Person[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PEOPLE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error fetching people', e);
    return [];
  }
};

export const savePeople = async (people: Person[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(people);
    await AsyncStorage.setItem(PEOPLE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving people', e);
  }
};

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(EXPENSES_KEY);
    if (jsonValue == null) return [];
    
    const expenses = JSON.parse(jsonValue);
    
    // Data Migration: Convert old 'paidBy' to 'payers' array
    return expenses.map((exp: any) => {
      if (exp.paidBy && !exp.payers) {
        return {
          ...exp,
          payers: [{ personId: exp.paidBy, amount: exp.amount }],
          paidBy: undefined // Clean up old field
        };
      }
      return exp as Expense;
    });
  } catch (e) {
    console.error('Error fetching expenses', e);
    return [];
  }
};

export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(expenses);
    await AsyncStorage.setItem(EXPENSES_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving expenses', e);
  }
};

export const getPayments = async (): Promise<Payment[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PAYMENTS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error fetching payments', e);
    return [];
  }
};

export const savePayments = async (payments: Payment[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(payments);
    await AsyncStorage.setItem(PAYMENTS_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving payments', e);
  }
};
