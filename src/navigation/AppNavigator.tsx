import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddPersonScreen from '../screens/AddPersonScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import AddPaymentScreen from '../screens/AddPaymentScreen';
import { Person, Expense, Payment } from '../storage/storage';

export type RootStackParamList = {
  Home: undefined;
  AddPerson: { person?: Person };
  AddExpense: { expense?: Expense };
  AddPayment: { initialPayerId?: string; initialPayeeId?: string; initialAmount?: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4361EE', // Updated to match our Indigo theme
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'SplitApp' }}
        />
        <Stack.Screen
          name="AddPerson"
          component={AddPersonScreen}
          options={({ route }) => ({
            title: route.params?.person ? 'Edit Person' : 'Add Person'
          })}
        />
        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
          options={({ route }) => ({
            title: route.params?.expense ? 'Edit Expense' : 'Add Expense'
          })}
        />
        <Stack.Screen
          name="AddPayment"
          component={AddPaymentScreen}
          options={{ title: 'Record Payment' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
