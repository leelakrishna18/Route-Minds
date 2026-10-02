export interface User {
  id: string;
  email: string;
  mobile_number: string;
  role: 'passenger' | 'admin';
  is_active: boolean;
  created_at: string;
  profile?: PassengerProfile | null;
}

export interface PassengerProfile {
  id?: string;
  full_name: string;
  preferred_language: 'en' | 'te';
  emergency_blood_group?: string;
  medical_notes?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Stop {
  id: string;
  name: string;
  name_te?: string;
  code?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
}

export interface RouteStop {
  id: string;
  stop_id: string;
  sequence_order: number;
  stop_name: string;
  stop_name_te?: string;
  distance_km?: number;
}

export interface Route {
  id: string;
  route_name: string;
  source_stop?: Stop;
  destination_stop?: Stop;
  via_summary?: string;
  stops?: RouteStop[];
  is_active: boolean;
}

export interface BusSearchResult {
  service_id: string;
  service_number: string;
  bus_number?: string;
  bus_type: string;
  route_id: string;
  route_name: string;
  source_stop_id: string;
  source_stop_name: string;
  source_stop_name_te?: string;
  destination_stop_id: string;
  destination_stop_name: string;
  destination_stop_name_te?: string;
  boarding_time: string;
  arrival_time: string | null;
  has_verified_arrival_time: boolean;
  platform_number: string;
  remarks?: string;
  intermediate_stops: string[];
  travel_date: string;
  operating_days: string;
  verification_status: string;
  source_of_information: string;
  date_last_verified: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  mobile_number: string;
  relationship?: string;
  is_primary: boolean;
  created_at: string;
}

export interface ComplaintAttachment {
  id: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  file_size_bytes: number;
}

export interface ComplaintStatusHistory {
  id: string;
  previous_status: string;
  new_status: string;
  changed_by: string;
  note?: string;
  passenger_message?: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  reference_id: string;
  passenger_id: string;
  passenger_name?: string;
  passenger_mobile?: string;
  category: string;
  subject: string;
  description: string;
  service_number?: string;
  travel_date?: string;
  current_status: 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved' | 'Rejected';
  admin_response?: string;
  internal_note?: string;
  attachments: ComplaintAttachment[];
  status_history: ComplaintStatusHistory[];
  created_at: string;
  updated_at: string;
}

export interface SmsRouteCode {
  id: string;
  route_code: string;
  route_id: string;
  route_name?: string;
  description: string;
  is_active: boolean;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  intent?: string;
  data?: any;
}
