import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Person, getPeople, savePeople } from '../storage/storage';
import CustomButton from '../components/CustomButton';
import PersonAvatar from '../components/PersonAvatar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddPerson'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'AddPerson'>;

const AddPersonScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const editingPerson = route.params?.person;

  const [name, setName] = useState(editingPerson?.name || '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    const people = await getPeople();
    
    if (editingPerson) {
      const updated = people.map(p => 
        p.id === editingPerson.id ? { ...p, name: name.trim() } : p
      );
      await savePeople(updated);
    } else {
      const newPerson: Person = {
        id: Date.now().toString(),
        name: name.trim(),
      };
      await savePeople([...people, newPerson]);
    }

    navigation.goBack();
  };

  const handleDelete = async () => {
    if (!editingPerson) return;

    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this person from your friends list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            const people = await getPeople();
            const updated = people.filter(p => p.id !== editingPerson.id);
            await savePeople(updated);
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <View style={styles.header}>
              <PersonAvatar name={name || '?'} size={100} />
              <Text style={styles.subtitle}>
                {editingPerson ? 'Update their details' : 'Add a new friend'}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter name"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  placeholderTextColor="#B2BEC3"
                />
              </View>

              <CustomButton 
                title={editingPerson ? 'Update Friend' : 'Add Friend'} 
                onPress={handleSave}
                disabled={!name.trim()}
                style={styles.saveButton}
              />

              {editingPerson && (
                <CustomButton 
                  title="Remove Friend" 
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E9AAF',
    marginTop: 15,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F8F9FE',
    borderRadius: 16,
    padding: 18,
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#F1F3F5',
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

export default AddPersonScreen;
