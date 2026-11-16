/** Shapes returned by MainAPI `/api/v1/diet/*` (see OdivonMainApi/src/modules/diet/diet.types.ts). */
export type ClientStatus = 'active' | 'paused' | 'archived';
export type Program = 'weight_loss' | 'weight_gain' | 'sports' | 'clinical' | 'healthy';
export type Channel = 'clinic' | 'video' | 'phone' | 'message';
export type ConsultationStatus = 'scheduled' | 'done' | 'cancelled';
export type TaskCategory = 'meal_log' | 'measurement' | 'water' | 'exercise' | 'photo' | 'other';
export type RequestType = 'appointment' | 'plan_change' | 'question' | 'document' | 'other';
export type RequestStatus = 'open' | 'in_progress' | 'resolved' | 'rejected';

interface Base {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client extends Base {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string | null;
  sex: 'female' | 'male';
  heightCm: number;
  startWeightKg: number;
  targetWeightKg: number;
  currentWeightKg: number;
  lastMeasuredAt: string | null;
  activity: string;
  program: Program;
  conditions?: string[];
  allergies?: string[];
  consentAt: string | null;
  status: ClientStatus;
  dietitianId: string;
  waistCm?: number | null;
  hipCm?: number | null;
  bodyFatPct?: number | null;
  waterTargetL: number | null;
  clinicalNotes?: string;
  goalProgressPct: number | null;
}

export interface Measurement extends Base {
  clientId: string;
  date: string;
  weightKg: number;
  waistCm: number | null;
  hipCm: number | null;
  bodyFatPct: number | null;
  muscleMassKg: number | null;
  visceralFatRating: number | null;
  bodyWaterPct: number | null;
  metabolicAge: number | null;
  note: string;
  source: 'dietitian' | 'member';
}

export interface Meal {
  name: string;
  time: string;
  kcal: number;
  proteinG?: number;
  carbG?: number;
  fatG?: number;
  note?: string;
}

export interface Plan extends Base {
  clientId: string;
  title: string;
  startDate: string;
  endDate: string;
  kcal: number;
  proteinPct: number;
  carbPct: number;
  fatPct: number;
  meals: Meal[];
  status: 'draft' | 'active' | 'completed';
  notes: string;
}

export interface Consultation extends Base {
  clientId: string;
  clientName?: string;
  dietitianId: string;
  at: string;
  durationMin: number;
  channel: Channel;
  status: ConsultationStatus;
  adherence?: number | null;
  notes?: string;
  nextAction: string;
}

export interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  lastMessageAt: string | null;
  lastMessagePreview: string;
  lastAuthor: 'dietitian' | 'member' | 'system' | null;
  unreadForStaff: number;
  unreadForMember: number;
}

export interface Message extends Base {
  clientId: string;
  author: 'dietitian' | 'member' | 'system';
  authorName: string;
  body: string;
  at: string;
  taskId: string | null;
  requestId: string | null;
}

export interface Task extends Base {
  clientId: string;
  clientName?: string;
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string | null;
  status: 'open' | 'done';
  completedAt: string | null;
}

export interface MemberRequest extends Base {
  clientId: string;
  clientName?: string;
  type: RequestType;
  subject: string;
  detail: string;
  status: RequestStatus;
  response: string;
  preferredDate: string | null;
  preferredTime: string | null;
}

export interface Dashboard {
  date: string;
  activeClients: number;
  newClientsThisMonth: number;
  todayConsultations: { id: string; at: string; clientId: string; clientName: string; channel: Channel; status: ConsultationStatus }[];
  nextConsultation: Dashboard['todayConsultations'][number] | null;
  avgGoalProgressPct: number | null;
  unreadMessages: number;
  openTasks: number;
  openRequests: number;
  attentionClients: { id: string; name: string; lastMeasuredAt: string | null; reason: string }[];
}

export interface AdminSummary {
  clientsByStatus: Record<ClientStatus, number>;
  newClientsByMonth: { month: string; count: number }[];
  consultationsLast7Days: number;
  consultationsLast30Days: number;
  completionRatePct: number | null;
  staff: { uid: string; name: string; role: string; activeClients: number; consultationsLast30Days: number }[];
}

export interface ClientOverview {
  client: Client;
  measurements: Measurement[];
  activePlan: Plan | null;
  nextConsultation: Consultation | null;
  recentConsultations: Consultation[];
  openTasks: number;
  unreadMessages: number;
}

export interface Me {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'owner' | 'admin' | 'user';
  permissions: Record<string, string[]>;
  tenant: { id: string; name: string; membershipStatus: string; trialEndsAt: string | null; subscriptionEndsAt?: string | null };
}

export interface NewClientInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  sex: 'female' | 'male';
  heightCm: number;
  startWeightKg: number;
  targetWeightKg: number;
  program?: Program;
}

export interface NewMeasurementInput {
  weightKg: number;
  waistCm?: number;
  hipCm?: number;
  bodyFatPct?: number;
  muscleMassKg?: number;
  note?: string;
}

export interface NewConsultationInput {
  clientId: string;
  at: string;
  channel: Channel;
  durationMin?: number;
}

export interface NewTaskInput {
  title: string;
  category: TaskCategory;
  description?: string;
  dueDate?: string;
}
