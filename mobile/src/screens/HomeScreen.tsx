import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getProfile} from '../storage/profileStorage';
import {RootStackParamList, UserProfile} from '../types';

const DEFAULT_USER_ID = 'current-user';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function Row({label, value}: {label: string; value?: string}) {
  if (!value) {
    return null;
  }
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function HomeScreen({navigation}: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const p = await getProfile(DEFAULT_USER_ID);
    setProfile(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadProfile);
    return unsubscribe;
  }, [navigation, loadProfile]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Family Health</Text>
        <Text style={styles.subtitle}>Your personal health profile</Text>
      </View>

      {profile ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Health Profile</Text>
          <Row label="Name" value={profile.name} />
          <Row label="Date of Birth" value={profile.dateOfBirth} />
          <Row label="Gender" value={profile.gender} />
          <Row label="Blood Type" value={profile.bloodType} />
          <Row
            label="Allergies"
            value={
              profile.allergies && profile.allergies.length > 0
                ? profile.allergies.join(', ')
                : undefined
            }
          />
          <Row
            label="Medical Conditions"
            value={
              profile.medicalConditions && profile.medicalConditions.length > 0
                ? profile.medicalConditions.join(', ')
                : undefined
            }
          />
          {profile.emergencyContact && (
            <View style={styles.ecSection}>
              <Text style={styles.ecTitle}>Emergency Contact</Text>
              <Row label="Name" value={profile.emergencyContact.name} />
              <Row label="Phone" value={profile.emergencyContact.phone} />
              <Row
                label="Relationship"
                value={profile.emergencyContact.relationship}
              />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No profile created yet.</Text>
          <Text style={styles.emptySubText}>
            Tap the button below to add your health details.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('EditProfile', {userId: DEFAULT_USER_ID})
        }>
        <Text style={styles.buttonText}>
          {profile ? 'Edit Profile' : 'Create Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  rowLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  rowValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  ecSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8f5e9',
  },
  ecTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
