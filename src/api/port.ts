import type {
  AdminSummary,
  Client,
  ClientOverview,
  Consultation,
  Conversation,
  Dashboard,
  Me,
  MemberRequest,
  Message,
  NewClientInput,
  NewConsultationInput,
  NewMeasurementInput,
  NewTaskInput,
  RequestStatus,
  Task,
} from './types';

/** What the screens need from the backend. Implemented by MainAPI and by the offline demo. */
export interface DietApi {
  me(): Promise<Me>;
  dashboard(): Promise<Dashboard>;
  adminSummary(): Promise<AdminSummary>;
  clients(params?: { status?: string; search?: string }): Promise<Client[]>;
  clientOverview(id: string): Promise<ClientOverview>;
  createClient(input: NewClientInput): Promise<Client>;
  addMeasurement(clientId: string, input: NewMeasurementInput): Promise<unknown>;
  consultations(params: { from?: string; to?: string; clientId?: string }): Promise<Consultation[]>;
  createConsultation(input: NewConsultationInput): Promise<Consultation>;
  updateConsultation(id: string, input: Partial<Pick<Consultation, 'status' | 'notes' | 'adherence'>>): Promise<Consultation>;
  conversations(): Promise<Conversation[]>;
  messages(clientId: string): Promise<Message[]>;
  sendMessage(clientId: string, body: string): Promise<Message>;
  markRead(clientId: string): Promise<unknown>;
  tasks(params?: { status?: 'open' | 'done'; clientId?: string }): Promise<Task[]>;
  createTask(clientId: string, input: NewTaskInput): Promise<Task>;
  updateTask(id: string, input: { status: 'open' | 'done' }): Promise<Task>;
  requests(params?: { status?: RequestStatus }): Promise<MemberRequest[]>;
  updateRequest(id: string, input: { status?: RequestStatus; response?: string }): Promise<MemberRequest>;
  registerDevice(token: string, platform: 'ios' | 'android' | 'web'): Promise<unknown>;
}
