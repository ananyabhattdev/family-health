import React, {useEffect, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getProfile, saveProfile} from '../storage/profileStorage';
import {RootStackParamList, UserProfile} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const GENDERS = [
  'male',
  'female',
  'non-binary',
  'other',
  'prefer not to say',
] as const;

const BLOOD_TYPES = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
] as const;

function SectionTitle({title}: {title: string}) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function FieldLabel({text}: {text: string}) {
  return <Text style={styles.label}>{text}</Text>;
}

function OptionRow<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: readonly T[];
  selected: T | undefined;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={styles.optionsRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.optionBtn, selected === opt && styles.optionBtnActive]}
          onPress={() => onSelect(opt)}>
          <Text
            style={[
              styles.optionText,
              selected === opt && styles.optionTextActive,
            ]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function EditProfileScreen({navigation, route}: Props) {
  const {userId} = route.params;
  const [form, setForm] = useState<UserProfile>({});
  const [allergiesText, setAllergiesText] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [ecName, setEcName] = useState('');
  const [ecPhone, setEcPhone] = useState('');
  const [ecRelationship, setEcRelationship] = useState('');

  useEffect(() => {
    getProfile(userId).then(p => {
      if (p) {
        setForm(p);
        setAllergiesText((p.allergies ?? []).join(', '));
        setConditionsText((p.medicalConditions ?? []).join(', '));
        setEcName(p.emergencyContact?.name ?? '');
        setEcPhone(p.emergencyContact?.phone ?? '');
        setEcRelationship(p.emergencyContact?.relationship ?? '');
      }
    });
  }, [userId]);

  const handleSave = async () => {
    const errors: string[] = [];

    if (form.name !== undefined) {
      const trimmedName = form.name.trim();
      if (trimmedName.length === 0) {
        errors.push('Name must not be empty.');
      } else if (trimmedName.length > 100) {
        errors.push('Name must not exceed 100 characters.');
      }
    }
    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth);
      if (isNaN(dob.getTime())) {
        errors.push('Date of Birth must be a valid date (YYYY-MM-DD).');
      } else if (dob > new Date()) {
        errors.push('Date of Birth must not be in the future.');
      }
    }

    const ecPresent = ecName.trim() || ecPhone.trim() || ecRelationship.trim();
    if (ecPresent) {
      if (!ecName.trim()) {
        errors.push('Emergency contact name is required.');
      }
      if (!ecPhone.trim()) {
        errors.push('Emergency contact phone is required.');
      }
    }

    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    const allergies = allergiesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const medicalConditions = conditionsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const updated: UserProfile = {
      ...form,
      name: form.name?.trim(),
      allergies,
      medicalConditions,
    };

    if (ecPresent) {
      updated.emergencyContact = {
        name: ecName.trim(),
        phone: ecPhone.trim(),
        ...(ecRelationship.trim() ? {relationship: ecRelationship.trim()} : {}),
      };
    } else {
      delete updated.emergencyContact;
    }

    await saveProfile(userId, updated);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <SectionTitle title="Personal Details" />

        <FieldLabel text="Full Name" />
        <TextInput
          style={styles.input}
          value={form.name ?? ''}
          onChangeText={v => setForm(f => ({...f, name: v}))}
          placeholder="Enter your full name"
          maxLength={100}
        />

        <FieldLabel text="Date of Birth (YYYY-MM-DD)" />
        <TextInput
          style={styles.input}
          value={form.dateOfBirth ?? ''}
          onChangeText={v => setForm(f => ({...f, dateOfBirth: v}))}
          placeholder="e.g. 1990-06-15"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />

        <FieldLabel text="Gender" />
        <OptionRow
          options={GENDERS}
          selected={form.gender}
          onSelect={v => setForm(f => ({...f, gender: v}))}
        />

        <FieldLabel text="Blood Type" />
        <OptionRow
          options={BLOOD_TYPES}
          selected={form.bloodType}
          onSelect={v => setForm(f => ({...f, bloodType: v}))}
        />

        <SectionTitle title="Medical Information" />

        <FieldLabel text="Allergies (comma-separated)" />
        <TextInput
          style={styles.input}
          value={allergiesText}
          onChangeText={setAllergiesText}
          placeholder="e.g. peanuts, shellfish"
          multiline
        />

        <FieldLabel text="Medical Conditions (comma-separated)" />
        <TextInput
          style={styles.input}
          value={conditionsText}
          onChangeText={setConditionsText}
          placeholder="e.g. hypertension, asthma"
          multiline
        />

        <SectionTitle title="Emergency Contact" />

        <FieldLabel text="Name" />
        <TextInput
          style={styles.input}
          value={ecName}
          onChangeText={setEcName}
          placeholder="Emergency contact name"
          maxLength={100}
        />

        <FieldLabel text="Phone" />
        <TextInput
          style={styles.input}
          value={ecPhone}
          onChangeText={setEcPhone}
          placeholder="+1-555-0100"
          keyboardType="phone-pad"
          maxLength={30}
        />

        <FieldLabel text="Relationship (optional)" />
        <TextInput
          style={styles.input}
          value={ecRelationship}
          onChangeText={setEcRelationship}
          placeholder="e.g. spouse, parent"
          maxLength={50}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e7d32',
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    backgroundColor: '#fff',
  },
  optionBtnActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  optionText: {
    fontSize: 13,
    color: '#555',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
