import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/auth/session';
import type { NewClientInput, NewConsultationInput, NewMeasurementInput, NewTaskInput, RequestStatus } from '@/api/types';

export const keys = {
  me: ['me'] as const,
  dashboard: ['dashboard'] as const,
  admin: ['admin'] as const,
  clients: (search?: string, status?: string) => ['clients', search ?? '', status ?? ''] as const,
  client: (id: string) => ['client', id] as const,
  consultations: (from?: string, to?: string) => ['consultations', from ?? '', to ?? ''] as const,
  conversations: ['conversations'] as const,
  messages: (id: string) => ['messages', id] as const,
  tasks: (status?: string) => ['tasks', status ?? ''] as const,
  requests: ['requests'] as const,
};

export const useMe = () => {
  const api = useApi();
  return useQuery({ queryKey: keys.me, queryFn: () => api.me(), staleTime: 5 * 60_000 });
};
export const useDashboard = () => {
  const api = useApi();
  return useQuery({ queryKey: keys.dashboard, queryFn: () => api.dashboard() });
};
export const useAdminSummary = () => {
  const api = useApi();
  return useQuery({ queryKey: keys.admin, queryFn: () => api.adminSummary() });
};
export const useClients = (search?: string, status?: string) => {
  const api = useApi();
  return useQuery({ queryKey: keys.clients(search, status), queryFn: () => api.clients({ search, status }) });
};
export const useClientOverview = (id: string) => {
  const api = useApi();
  return useQuery({ queryKey: keys.client(id), queryFn: () => api.clientOverview(id) });
};
export const useConsultations = (from?: string, to?: string) => {
  const api = useApi();
  return useQuery({ queryKey: keys.consultations(from, to), queryFn: () => api.consultations({ from, to }) });
};
export const useConversations = () => {
  const api = useApi();
  return useQuery({ queryKey: keys.conversations, queryFn: () => api.conversations(), refetchInterval: 20_000 });
};
export const useMessages = (clientId: string) => {
  const api = useApi();
  return useQuery({ queryKey: keys.messages(clientId), queryFn: () => api.messages(clientId), refetchInterval: 8_000 });
};
export const useTasks = (status?: 'open' | 'done') => {
  const api = useApi();
  return useQuery({ queryKey: keys.tasks(status), queryFn: () => api.tasks({ status }) });
};
export const useRequests = () => {
  const api = useApi();
  return useQuery({ queryKey: keys.requests, queryFn: () => api.requests() });
};

function useInvalidate() {
  const qc = useQueryClient();
  return (...prefixes: string[]) => Promise.all(prefixes.map((p) => qc.invalidateQueries({ queryKey: [p] })));
}

export const useCreateClient = () => {
  const api = useApi();
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: NewClientInput) => api.createClient(input), onSuccess: () => invalidate('clients', 'dashboard') });
};
export const useAddMeasurement = (clientId: string) => {
  const api = useApi();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: NewMeasurementInput) => api.addMeasurement(clientId, input),
    onSuccess: () => invalidate('client', 'clients', 'dashboard'),
  });
};
export const useCreateConsultation = () => {
  const api = useApi();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: NewConsultationInput) => api.createConsultation(input),
    onSuccess: () => invalidate('consultations', 'dashboard', 'client'),
  });
};
export const useUpdateConsultation = () => {
  const api = useApi();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; status?: 'scheduled' | 'done' | 'cancelled' }) => api.updateConsultation(id, input),
    onSuccess: () => invalidate('consultations', 'dashboard', 'client'),
  });
};
export const useSendMessage = (clientId: string) => {
  const api = useApi();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: string) => api.sendMessage(clientId, body),
    onSuccess: () => invalidate('messages', 'conversations'),
  });
};
export const useMarkRead = () => {
  const api = useApi();
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (clientId: string) => api.markRead(clientId), onSuccess: () => invalidate('conversations', 'dashboard') });
};
export const useCreateTask = (clientId: string) => {
  const api = useApi();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: NewTaskInput) => api.createTask(clientId, input),
    onSuccess: () => invalidate('tasks', 'client', 'dashboard', 'messages'),
  });
};
export const useToggleTask = () => {
  const api = useApi();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'open' | 'done' }) => api.updateTask(id, { status }),
    onSuccess: () => invalidate('tasks', 'dashboard', 'client'),
  });
};
export const useUpdateRequest = () => {
  const api = useApi();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; status?: RequestStatus; response?: string }) => api.updateRequest(id, input),
    onSuccess: () => invalidate('requests', 'dashboard', 'messages'),
  });
};
