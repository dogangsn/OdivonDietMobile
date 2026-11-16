import type { DietApi } from './port';
import type {
  Client,
  Consultation,
  Conversation,
  Dashboard,
  Measurement,
  MemberRequest,
  Message,
  Plan,
  Task,
} from './types';

/** Offline demo backend with realistic Turkish sample data, relative to today. */
const DAY = 86_400_000;
const STAFF_ID = 'demo-owner';
const STAFF_NAME = 'Dyt. Deniz Arslan';

let seq = 1000;
const id = (prefix: string) => `${prefix}-${++seq}`;
const iso = (d: Date) => d.toISOString();

function at(dayOffset: number, hh: number, mm = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hh, mm, 0, 0);
  return iso(d);
}

function progress(c: Pick<Client, 'startWeightKg' | 'targetWeightKg' | 'currentWeightKg'>): number | null {
  const total = c.startWeightKg - c.targetWeightKg;
  if (Math.abs(total) < 0.01) return null;
  return Math.round(Math.min(100, Math.max(0, ((c.startWeightKg - c.currentWeightKg) / total) * 100)));
}

interface Db {
  clients: Client[];
  measurements: Measurement[];
  plans: Plan[];
  consultations: Consultation[];
  conversations: Conversation[];
  messages: Message[];
  tasks: Task[];
  requests: MemberRequest[];
}

function seed(): Db {
  const now = iso(new Date());
  const base = { createdAt: now, updatedAt: now };
  const people: [string, string, 'female' | 'male', number, number, number, Client['program'], number, number][] = [
    // first, last, sex, height, start, target, program, weeks in program, kg lost so far
    ['Elif', 'Kaya', 'female', 165, 82, 68, 'weight_loss', 10, 7.4],
    ['Mert', 'Yılmaz', 'male', 182, 96, 84, 'weight_loss', 6, 4.2],
    ['Zeynep', 'Demir', 'female', 170, 58, 62, 'weight_gain', 8, -1.6],
    ['Can', 'Öztürk', 'male', 178, 79, 76, 'sports', 4, 1.1],
    ['Selin', 'Aydın', 'female', 160, 74, 63, 'clinical', 12, 6.8],
    ['Burak', 'Şahin', 'male', 175, 88, 78, 'weight_loss', 2, 0.6],
    ['Ayşe', 'Çelik', 'female', 168, 69, 64, 'healthy', 16, 3.9],
  ];
  const clients: Client[] = [];
  const measurements: Measurement[] = [];
  people.forEach(([firstName, lastName, sex, heightCm, start, target, program, weeks, lost], i) => {
    const cid = `c${i + 1}`;
    const points = Math.max(2, Math.min(8, weeks));
    let lastDate = '';
    for (let p = 0; p < points; p++) {
      const daysAgo = Math.round(((points - 1 - p) / Math.max(1, points - 1)) * weeks * 7) + (i === 5 ? 18 : 1);
      const ratio = p / (points - 1);
      const wobble = p > 0 && p < points - 1 ? Math.sin(p * 1.7 + i) * 0.35 : 0;
      const weight = Math.round((start - lost * ratio + wobble) * 10) / 10;
      lastDate = iso(new Date(Date.now() - daysAgo * DAY));
      measurements.push({
        id: `m${i}-${p}`,
        clientId: cid,
        date: lastDate,
        weightKg: weight,
        waistCm: Math.round(70 + (start - 55) * 0.6 - lost * ratio * 0.9),
        hipCm: null,
        bodyFatPct: Math.round((sex === 'female' ? 34 : 26) - lost * ratio * 0.5),
        muscleMassKg: null,
        visceralFatRating: null,
        bodyWaterPct: null,
        metabolicAge: null,
        note: '',
        source: 'dietitian',
        ...base,
      });
    }
    const current = Math.round((start - lost) * 10) / 10;
    const c: Client = {
      id: cid,
      firstName,
      lastName,
      email: `${firstName.toLocaleLowerCase('tr-TR')}.${lastName.toLocaleLowerCase('tr-TR')}@ornek.com`
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/ç/g, 'c')
        .replace(/ö/g, 'o')
        .replace(/ü/g, 'u')
        .replace(/ğ/g, 'g'),
      phone: `0532 ${410 + i * 7} ${20 + i} ${30 + i}`,
      birthDate: null,
      sex,
      heightCm,
      startWeightKg: start,
      targetWeightKg: target,
      currentWeightKg: current,
      lastMeasuredAt: lastDate,
      activity: 'light',
      program,
      conditions: program === 'clinical' ? ['İnsülin direnci'] : [],
      allergies: i === 1 ? ['Fıstık'] : [],
      consentAt: now,
      status: i === 6 ? 'paused' : 'active',
      dietitianId: i % 3 === 2 ? 'demo-dyt2' : STAFF_ID,
      waistCm: null,
      hipCm: null,
      bodyFatPct: null,
      waterTargetL: 2.5,
      clinicalNotes: '',
      goalProgressPct: 0,
      createdAt: iso(new Date(Date.now() - weeks * 7 * DAY - DAY)),
      updatedAt: now,
    };
    c.goalProgressPct = progress(c);
    clients.push(c);
  });

  const meals = [
    { name: 'Kahvaltı', time: '08:00', kcal: 413, proteinG: 24, carbG: 38, fatG: 17 },
    { name: 'Ara öğün', time: '10:30', kcal: 165, proteinG: 8, carbG: 20, fatG: 6 },
    { name: 'Öğle', time: '13:00', kcal: 495, proteinG: 36, carbG: 48, fatG: 16 },
    { name: 'Ara öğün', time: '16:00', kcal: 165, proteinG: 10, carbG: 14, fatG: 7 },
    { name: 'Akşam', time: '19:00', kcal: 413, proteinG: 30, carbG: 32, fatG: 16 },
  ];
  const plans: Plan[] = clients.map((c, i) => ({
    id: `p${i + 1}`,
    clientId: c.id,
    title: c.program === 'weight_gain' ? 'Sağlıklı kilo alma · Faz 2' : c.program === 'sports' ? 'Performans beslenmesi' : 'Akdeniz tipi · 1650 kcal',
    startDate: at(-14, 0).slice(0, 10),
    endDate: at(14, 0).slice(0, 10),
    kcal: c.program === 'weight_gain' ? 2200 : c.program === 'sports' ? 2600 : 1650,
    proteinPct: 25,
    carbPct: 45,
    fatPct: 30,
    meals,
    status: 'active',
    notes: '',
    ...base,
  }));

  const consultations: Consultation[] = [
    { clientId: 'c1', at: at(0, 9, 30), channel: 'clinic' as const, status: 'done' as const },
    { clientId: 'c2', at: at(0, 11, 0), channel: 'video' as const, status: 'scheduled' as const },
    { clientId: 'c5', at: at(0, 14, 30), channel: 'clinic' as const, status: 'scheduled' as const },
    { clientId: 'c4', at: at(0, 17, 15), channel: 'phone' as const, status: 'scheduled' as const },
    { clientId: 'c3', at: at(1, 10, 0), channel: 'video' as const, status: 'scheduled' as const },
    { clientId: 'c6', at: at(2, 15, 0), channel: 'clinic' as const, status: 'scheduled' as const },
    { clientId: 'c1', at: at(-7, 9, 30), channel: 'clinic' as const, status: 'done' as const },
    { clientId: 'c2', at: at(-6, 11, 0), channel: 'video' as const, status: 'done' as const },
    { clientId: 'c7', at: at(-3, 12, 0), channel: 'phone' as const, status: 'cancelled' as const },
  ].map((c) => ({
    id: id('k'),
    dietitianId: STAFF_ID,
    durationMin: 45,
    adherence: c.status === 'done' ? 82 : null,
    notes: c.status === 'done' ? 'Öğün atlamaları azaldı, su tüketimi hedefte.' : '',
    nextAction: '',
    ...base,
    ...c,
  }));

  const messages: Message[] = [];
  const say = (clientId: string, author: Message['author'], body: string, minutesAgo: number) =>
    messages.push({
      id: id('msg'),
      clientId,
      author,
      authorName: author === 'dietitian' ? STAFF_NAME : author === 'system' ? 'OdivonDiet' : '',
      body,
      at: iso(new Date(Date.now() - minutesAgo * 60_000)),
      taskId: null,
      requestId: null,
      ...base,
    });
  say('c1', 'dietitian', 'Günaydın Elif Hanım, bu haftaki ölçümünüz harika görünüyor 👏', 300);
  say('c1', 'member', 'Teşekkürler! Akşam öğününde yoğurt yerine kefir içebilir miyim?', 42);
  say('c2', 'dietitian', 'Mert Bey, video görüşmemiz 11:00’de. Linki birazdan paylaşıyorum.', 95);
  say('c2', 'member', 'Tamamdır, hazırım 👍', 88);
  say('c5', 'member', 'Bugünkü kan tahlili sonuçlarımı yükledim.', 15);
  say('c4', 'dietitian', 'Antrenman sonrası protein shake’i unutmayalım.', 60 * 26);
  const conversations: Conversation[] = ['c1', 'c2', 'c5', 'c4'].map((clientId) => {
    const own = messages.filter((m) => m.clientId === clientId);
    const last = own[own.length - 1]!;
    return {
      id: clientId,
      clientId,
      clientName: '',
      lastMessageAt: last.at,
      lastMessagePreview: last.body,
      lastAuthor: last.author,
      unreadForStaff: clientId === 'c1' ? 1 : clientId === 'c5' ? 2 : 0,
      unreadForMember: 0,
    };
  });

  const tasks: Task[] = [
    { clientId: 'c1', title: 'Öğle yemeğinin fotoğrafını gönder', category: 'photo' as const, dueDate: at(1, 12).slice(0, 10) },
    { clientId: 'c1', title: 'Haftalık tartı ölçümü', category: 'measurement' as const, dueDate: at(3, 9).slice(0, 10) },
    { clientId: 'c2', title: 'Günde 2,5 L su', category: 'water' as const, dueDate: null },
    { clientId: 'c4', title: '3 gün direnç antrenmanı', category: 'exercise' as const, dueDate: at(5, 9).slice(0, 10) },
  ].map((t) => ({ id: id('t'), description: '', status: 'open' as const, completedAt: null, ...base, ...t }));

  const requests: MemberRequest[] = [
    { clientId: 'c3', type: 'appointment' as const, subject: 'Perşembe randevusu', detail: 'Perşembe öğleden sonra uygun musunuz?', preferredDate: at(3, 0).slice(0, 10), preferredTime: '15:00' },
    { clientId: 'c5', type: 'plan_change' as const, subject: 'Akşam öğününü değiştirmek', detail: 'İş çıkışı geç saatte yiyebiliyorum, akşamı 20:30’a alabilir miyiz?', preferredDate: null, preferredTime: null },
  ].map((r) => ({ id: id('r'), status: 'open' as const, response: '', ...base, ...r }));

  return { clients, measurements, plans, consultations, conversations, messages, tasks, requests };
}

export function createDemoApi(): DietApi {
  const db = seed();
  const name = (clientId: string) => {
    const c = db.clients.find((x) => x.id === clientId);
    return c ? `${c.firstName} ${c.lastName}` : '';
  };
  const wait = <T,>(value: T, ms = 220) => new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));
  const postMessage = (clientId: string, author: Message['author'], body: string) => {
    const now = iso(new Date());
    const message: Message = { id: id('msg'), clientId, author, authorName: author === 'dietitian' ? STAFF_NAME : 'OdivonDiet', body, at: now, taskId: null, requestId: null, createdAt: now, updatedAt: now };
    db.messages.push(message);
    let conv = db.conversations.find((c) => c.clientId === clientId);
    if (!conv) {
      conv = { id: clientId, clientId, clientName: '', lastMessageAt: null, lastMessagePreview: '', lastAuthor: null, unreadForStaff: 0, unreadForMember: 0 };
      db.conversations.push(conv);
    }
    Object.assign(conv, { lastMessageAt: now, lastMessagePreview: body, lastAuthor: author, unreadForMember: conv.unreadForMember + 1 });
    return message;
  };

  return {
    me: () =>
      wait({
        uid: STAFF_ID,
        email: 'deniz@odivon.com',
        displayName: STAFF_NAME,
        role: 'owner' as const,
        permissions: {},
        tenant: { id: 'demo', name: 'Arslan Beslenme Kliniği', membershipStatus: 'trial', trialEndsAt: at(9, 0) },
      }),
    dashboard: () => {
      const today = new Date().toDateString();
      const nowIso = iso(new Date());
      const todays = db.consultations
        .filter((c) => c.status !== 'cancelled' && new Date(c.at).toDateString() === today)
        .sort((a, b) => a.at.localeCompare(b.at))
        .map((c) => ({ id: c.id, at: c.at, clientId: c.clientId, clientName: name(c.clientId), channel: c.channel, status: c.status }));
      const active = db.clients.filter((c) => c.status === 'active');
      const prog = active.map((c) => c.goalProgressPct).filter((p): p is number => p !== null);
      const stale = iso(new Date(Date.now() - 14 * DAY));
      const result: Dashboard = {
        date: nowIso.slice(0, 10),
        activeClients: active.length,
        newClientsThisMonth: db.clients.filter((c) => c.createdAt.slice(0, 7) === nowIso.slice(0, 7)).length,
        todayConsultations: todays,
        nextConsultation: todays.find((c) => c.status === 'scheduled' && c.at >= nowIso) ?? null,
        avgGoalProgressPct: prog.length ? Math.round(prog.reduce((a, b) => a + b, 0) / prog.length) : null,
        unreadMessages: db.conversations.reduce((s, c) => s + c.unreadForStaff, 0),
        openTasks: db.tasks.filter((t) => t.status === 'open').length,
        openRequests: db.requests.filter((r) => r.status === 'open' || r.status === 'in_progress').length,
        attentionClients: active
          .filter((c) => !c.lastMeasuredAt || c.lastMeasuredAt < stale)
          .map((c) => ({ id: c.id, name: name(c.id), lastMeasuredAt: c.lastMeasuredAt, reason: 'no_recent_measurement' })),
      };
      return wait(result);
    },
    adminSummary: () => {
      const months: { month: string; count: number }[] = [];
      const counts = [2, 3, 2, 4, 5, 3];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i, 1);
        months.push({ month: d.toISOString().slice(0, 7), count: counts[5 - i]! });
      }
      return wait({
        clientsByStatus: {
          active: db.clients.filter((c) => c.status === 'active').length,
          paused: db.clients.filter((c) => c.status === 'paused').length,
          archived: 0,
        },
        newClientsByMonth: months,
        consultationsLast7Days: 14,
        consultationsLast30Days: 52,
        completionRatePct: 91,
        staff: [
          { uid: STAFF_ID, name: STAFF_NAME, role: 'owner', activeClients: db.clients.filter((c) => c.dietitianId === STAFF_ID && c.status === 'active').length, consultationsLast30Days: 34 },
          { uid: 'demo-dyt2', name: 'Dyt. Ece Korkmaz', role: 'user', activeClients: db.clients.filter((c) => c.dietitianId === 'demo-dyt2' && c.status === 'active').length, consultationsLast30Days: 18 },
          { uid: 'demo-desk', name: 'Gamze Ateş · Ön büro', role: 'user', activeClients: 0, consultationsLast30Days: 0 },
        ],
      });
    },
    clients: (p) => {
      const search = p?.search?.trim().toLocaleLowerCase('tr-TR');
      return wait(
        db.clients
          .filter((c) => (p?.status ? c.status === p.status : c.status !== 'archived'))
          .filter((c) => !search || `${c.firstName} ${c.lastName} ${c.phone}`.toLocaleLowerCase('tr-TR').includes(search))
          .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'tr-TR')),
        120,
      );
    },
    clientOverview: (cid) => {
      const client = db.clients.find((c) => c.id === cid);
      if (!client) return Promise.reject(new Error('Danışan bulunamadı.'));
      const nowIso = iso(new Date());
      const cons = db.consultations.filter((c) => c.clientId === cid).sort((a, b) => a.at.localeCompare(b.at));
      return wait({
        client,
        measurements: db.measurements.filter((m) => m.clientId === cid).sort((a, b) => b.date.localeCompare(a.date)),
        activePlan: db.plans.find((p) => p.clientId === cid && p.status === 'active') ?? null,
        nextConsultation: cons.find((c) => c.status === 'scheduled' && c.at >= nowIso) ?? null,
        recentConsultations: cons.filter((c) => c.at < nowIso).reverse(),
        openTasks: db.tasks.filter((t) => t.clientId === cid && t.status === 'open').length,
        unreadMessages: db.conversations.find((c) => c.clientId === cid)?.unreadForStaff ?? 0,
      });
    },
    createClient: (input) => {
      const now = iso(new Date());
      const client: Client = {
        id: id('c'),
        email: input.email ?? '',
        phone: input.phone ?? '',
        birthDate: null,
        activity: 'light',
        program: input.program ?? 'healthy',
        conditions: [],
        allergies: [],
        consentAt: null,
        status: 'active',
        dietitianId: STAFF_ID,
        waterTargetL: null,
        currentWeightKg: input.startWeightKg,
        lastMeasuredAt: null,
        goalProgressPct: 0,
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      client.goalProgressPct = progress(client);
      db.clients.push(client);
      return wait(client);
    },
    addMeasurement: (clientId, input) => {
      const now = iso(new Date());
      const m: Measurement = { id: id('m'), clientId, date: now, waistCm: null, hipCm: null, bodyFatPct: null, muscleMassKg: null, visceralFatRating: null, bodyWaterPct: null, metabolicAge: null, note: '', source: 'dietitian', createdAt: now, updatedAt: now, ...input };
      db.measurements.push(m);
      const client = db.clients.find((c) => c.id === clientId);
      if (client) {
        client.currentWeightKg = input.weightKg;
        client.lastMeasuredAt = now;
        client.goalProgressPct = progress(client);
      }
      return wait(m);
    },
    consultations: (p) =>
      wait(
        db.consultations
          .filter((c) => !p.clientId || c.clientId === p.clientId)
          .filter((c) => !p.from || c.at >= p.from)
          .filter((c) => !p.to || c.at <= p.to)
          .sort((a, b) => a.at.localeCompare(b.at))
          .map((c) => ({ ...c, clientName: name(c.clientId) })),
      ),
    createConsultation: (input) => {
      const now = iso(new Date());
      const c: Consultation = { id: id('k'), dietitianId: STAFF_ID, durationMin: 45, status: 'scheduled', adherence: null, notes: '', nextAction: '', createdAt: now, updatedAt: now, ...input };
      db.consultations.push(c);
      return wait({ ...c, clientName: name(c.clientId) });
    },
    updateConsultation: (cid, input) => {
      const c = db.consultations.find((x) => x.id === cid)!;
      Object.assign(c, input);
      return wait(c);
    },
    conversations: () =>
      wait(
        db.conversations
          .map((c) => ({ ...c, clientName: name(c.clientId) }))
          .sort((a, b) => (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? '')),
      ),
    messages: (clientId) => wait(db.messages.filter((m) => m.clientId === clientId).sort((a, b) => a.at.localeCompare(b.at)), 120),
    sendMessage: (clientId, body) => wait(postMessage(clientId, 'dietitian', body), 80),
    markRead: (clientId) => {
      const conv = db.conversations.find((c) => c.clientId === clientId);
      if (conv) conv.unreadForStaff = 0;
      return wait({ ok: true }, 40);
    },
    tasks: (p) =>
      wait(
        db.tasks
          .filter((t) => !p?.status || t.status === p.status)
          .filter((t) => !p?.clientId || t.clientId === p.clientId)
          .map((t) => ({ ...t, clientName: name(t.clientId) })),
      ),
    createTask: (clientId, input) => {
      const now = iso(new Date());
      const t: Task = { id: id('t'), clientId, description: '', dueDate: null, status: 'open', completedAt: null, createdAt: now, updatedAt: now, ...input };
      db.tasks.push(t);
      postMessage(clientId, 'system', `Yeni görev: ${t.title}`);
      return wait(t);
    },
    updateTask: (tid, input) => {
      const t = db.tasks.find((x) => x.id === tid)!;
      t.status = input.status;
      t.completedAt = input.status === 'done' ? iso(new Date()) : null;
      return wait(t, 80);
    },
    requests: (p) =>
      wait(
        db.requests
          .filter((r) => !p?.status || r.status === p.status)
          .map((r) => ({ ...r, clientName: name(r.clientId) }))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      ),
    updateRequest: (rid, input) => {
      const r = db.requests.find((x) => x.id === rid)!;
      Object.assign(r, input);
      return wait(r, 80);
    },
    registerDevice: () => wait({ ok: true }),
  };
}
