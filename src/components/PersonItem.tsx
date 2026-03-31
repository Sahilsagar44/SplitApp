import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Person } from '../storage/storage';
import PersonAvatar from './PersonAvatar';

interface PersonItemProps {
  person: Person;
  onEdit: (person: Person) => void;
  onDelete: (id: string) => void;
}

const PersonItem: React.FC<PersonItemProps> = ({ person, onEdit, onDelete }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onEdit(person)}
      activeOpacity={0.8}
    >
      <PersonAvatar name={person.name} size={48} />
      <Text style={styles.name} numberOfLines={1}>{person.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: 90,
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  name: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3436',
    textAlign: 'center',
  },
});

export default PersonItem;
