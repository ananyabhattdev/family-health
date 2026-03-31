export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

export interface UserProfile {
  name?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'other' | 'prefer not to say';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  medicalConditions?: string[];
  emergencyContact?: EmergencyContact;
}

export type RootStackParamList = {
  Home: undefined;
  EditProfile: {userId: string};
};
