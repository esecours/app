export type IncidentType = 'accident' | 'incendie' | 'agression' | 'vbg' | 'agression_sexuelle' | 'medical' | 'vol' | 'perte' | 'inondation' | 'seisme' | 'autre';

export interface LocationData {
  lat: number;
  lng: number;
  altitude?: number | null;
  precision: number;
  address?: string;
}

export type OperatorType = 'pompiers' | 'police' | 'vbg_agression';

export interface Incident {
  id?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userFullName?: string;
  userAddress?: string;
  medicalInfo?: string;
  age?: number;
  sex?: 'M' | 'F' | 'Autre';
  weight?: number;
  bloodType?: string;
  allergies?: string;
  medications?: string;
  emergencyContact?: string;
  type: IncidentType;
  targetOperatorType?: OperatorType;
  description?: string;
  audioUrl?: string;
  audioMimeType?: string;
  location: LocationData;
  status: 'pending' | 'active' | 'resolved';
  isSignalRequested?: boolean;
  responderId?: string;
  responderName?: string;
  responderPhone?: string;
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'user' | 'admin' | 'operator';
  operatorType?: OperatorType | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string;
  medicalInfo?: string;
  age?: number;
  sex?: 'M' | 'F' | 'Autre';
  weight?: number;
  bloodType?: string;
  allergies?: string;
  medications?: string;
  emergencyContact?: string;
  lastLogin: any;
  status?: 'active' | 'suspended';
}

export function getTargetOperatorType(type: IncidentType): OperatorType {
  if (['vbg', 'agression_sexuelle'].includes(type)) {
    return 'vbg_agression';
  }
  if (['medical', 'accident', 'incendie', 'inondation', 'seisme', 'autre'].includes(type)) {
    return 'pompiers';
  }
  return 'police';
}
