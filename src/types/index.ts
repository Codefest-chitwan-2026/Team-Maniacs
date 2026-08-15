export type EmergencyCategory =
  | 'flood'
  | 'landslide'
  | 'earthquake'
  | 'fire'
  | 'storm'
  | 'medical'
  | 'building'
  | 'road'
  | 'other';

export type PriorityLevel = 'critical' | 'urgent' | 'non-critical';

export type ReportStatus =
  | 'NEW'
  | 'UNDER REVIEW'
  | 'VERIFIED'
  | 'RESPONDING'
  | 'RESOLVED';

export type TrustLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type ReliefCategory =
  | 'food'
  | 'water'
  | 'medicine'
  | 'shelter'
  | 'rescue'
  | 'transport'
  | 'other';

export type VolunteerSkill =
  | 'First Aid'
  | 'Rescue'
  | 'Transportation'
  | 'Food Distribution'
  | 'Medical'
  | 'Logistics'
  | 'Communication'
  | 'Other';

export interface TrustDetails {
  gpsVerified: boolean;
  recentSubmission: boolean;
  mediaAttached: boolean;
  humanVerified: boolean;
  aiStatus: 'Verified' | 'Needs Review' | 'Suspicious';
}

export interface AIVerification {
  status: 'Verified' | 'Needs Review' | 'Suspicious';
  confidence: number;
  observations: string[];
  recommendation: string;
}

export interface EmergencyReport {
  id: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  type: EmergencyCategory;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  priority: PriorityLevel;
  status: ReportStatus;
  trustLevel: TrustLevel;
  trustDetails: TrustDetails;
  aiVerification?: AIVerification;
  mediaUrl?: string;
  mediaType?: 'photo' | 'video' | 'audio';
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface Alert {
  id: string;
  title: string;
  titleNp?: string;
  description: string;
  descriptionNp?: string;
  type: EmergencyCategory;
  severity: 'high' | 'moderate' | 'low';
  location: string;
  source: 'Official Emergency Agency' | 'Satark Verified' | 'Community Report';
  verified: boolean;
  createdAt: string;
  expiresAt?: string;
  isDemo?: boolean;
}

export interface Volunteer {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  area: string;
  skills: VolunteerSkill[];
  availability: string;
  verified: boolean;
  points: number;
  rank: 'Newcomer' | 'Helper' | 'Responder' | 'Guardian' | 'Community Leader' | 'Satark Hero' | 'Satark Champion';
  reportsVerifiedCount: number;
  reliefTasksCompleted: number;
  isDemo?: boolean;
}

export type ReliefHelpStatus =
  | 'REGISTERED'
  | 'IN_PROGRESS'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED';

export interface ReliefHelpRecord {
  reliefRequestId: string;
  volunteerId: string;
  status: ReliefHelpStatus;
  registeredAt: string;
  completedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  pointsAwarded?: number;
}

export interface EmergencySosRecord {
  id: string;
  userId: string;
  latitude?: number;
  longitude?: number;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  createdAt: string;
  resolvedAt?: string;
  cancelledAt?: string;
  updatedAt: string;
  locationSource: 'gps' | 'manual' | 'unavailable';
  notes?: string;
}

export interface SosNotificationRecord {
  id: string;
  sosId: string;
  userId: string;
  recipientType: 'responder' | 'coordinator' | 'admin';
  status: 'QUEUED' | 'DISPATCHED';
  createdAt: string;
  message: string;
}

export interface ReliefRequest {
  id: string;
  createdBy: string;
  contactPhone?: string;
  type: ReliefCategory;
  description: string;
  location: string;
  urgency: PriorityLevel;
  peopleAffected: number;
  currentResponders: number;
  status: 'NEEDED' | 'ASSIGNED' | 'IN PROGRESS' | 'COMPLETED';
  createdAt: string;
  assignedVolunteers?: string[];
  helpRecords?: ReliefHelpRecord[];
  isDemo?: boolean;
}

export interface SatarkPointTransaction {
  id: string;
  userId: string;
  points: number;
  reason: string;
  reasonNp?: string;
  referenceType: 'report' | 'volunteer' | 'relief' | 'verification' | 'preparedness' | 'admin';
  referenceId?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  language: 'en' | 'np';
  role: 'citizen' | 'volunteer' | 'admin';
  satarkPoints: number;
  rank: 'Newcomer' | 'Helper' | 'Responder' | 'Guardian' | 'Community Leader' | 'Satark Hero' | 'Satark Champion';
  isVolunteer: boolean;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  conditionNp: string;
  rainProbability: number;
  windSpeed: number;
  forecast: string;
  isDemo?: boolean;
}

export interface SatarkPulseState {
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  reasons: { en: string; np: string }[];
  updatedAt: string;
  heavyRain: boolean;
  activeReportCount: number;
  roadBlockageCount: number;
}
