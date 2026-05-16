export const MOCK_USER = {
  id: 'user-123',
  name: 'Emerson Silva',
  email: 'emerson@cleanpro.com.br',
  userType: 'CUSTOMER',
  avatar: null,
};

export const MOCK_SERVICES = [
  { id: '1', name: 'Limpeza Residencial', price: 120, description: 'Limpeza completa de casas e apartamentos.' },
  { id: '2', name: 'Limpeza Pós-Obra', price: 450, description: 'Remoção de entulhos e limpeza fina após construção.' },
  { id: '3', name: 'Limpeza de Escritório', price: 200, description: 'Manutenção de ambientes corporativos.' },
  { id: '4', name: 'Limpeza de Estofados', price: 180, description: 'Higienização profunda de sofás e poltronas.' },
  { id: '5', name: 'Limpeza de Janelas', price: 100, description: 'Limpeza de vidros e esquadrias.' },
];

export const MOCK_JOBS = [
  { id: 'job-1', serviceId: 'svc-1', clientId: 'user-123', contractorId: 'ctr-1', status: 'COMPLETED', startTime: '2024-04-25T10:00:00Z', endTime: '2024-04-25T14:00:00Z', createdAt: '2024-04-20T09:00:00Z', updatedAt: '2024-04-25T14:00:00Z' },
  { id: 'job-2', serviceId: 'svc-2', clientId: 'user-123', contractorId: 'ctr-2', status: 'IN_PROGRESS', startTime: '2024-04-30T08:00:00Z', endTime: '2024-04-30T16:00:00Z', createdAt: '2024-04-28T09:00:00Z', updatedAt: '2024-04-30T08:00:00Z' },
  { id: 'job-3', serviceId: 'svc-3', clientId: 'user-123', contractorId: 'ctr-3', status: 'PENDING', startTime: '2024-05-02T14:00:00Z', endTime: '2024-05-02T18:00:00Z', createdAt: '2024-04-29T09:00:00Z', updatedAt: '2024-04-29T09:00:00Z' },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n-1', recipientId: 'user-123', relatedEventId: 'evt-1', message: 'Seu agendamento foi confirmado para amanhã às 14h.', channel: 'IN_APP', status: 'SENT', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'n-2', recipientId: 'user-123', relatedEventId: 'evt-2', message: 'Use o cupom CLEAN20 para ganhar 20% de desconto!', channel: 'IN_APP', status: 'READ', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 'n-3', recipientId: 'user-123', relatedEventId: 'evt-3', message: 'Como foi sua experiência com o profissional João Silva? Deixe sua avaliação.', channel: 'IN_APP', status: 'READ', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

export const MOCK_AUTH_RESPONSE = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: MOCK_USER,
};

export const MOCK_CONTRACTORS = [
  {
    id: 'ctr-1',
    name: 'Maria Silva',
    rating: 4.9,
    specialties: ['Limpeza Residencial', 'Limpeza de Estofados'],
    bio: 'Profissional com mais de 5 anos de experiência em limpeza residencial e comercial. Atenciosa, pontual e eficiente.',
    portfolioPhotos: [] as string[],
    certifications: ['Técnica em Higienização', 'Curso de Produtos Sustentáveis'],
    verificationStatus: 'VERIFIED',
    reviewCount: 48,
    location: 'São Paulo, SP',
  },
  {
    id: 'ctr-2',
    name: 'João Santos',
    rating: 4.7,
    specialties: ['Limpeza Pós-Obra', 'Limpeza de Escritório'],
    bio: 'Especialista em limpeza pós-obra e ambientes corporativos. Equipe treinada e equipamentos profissionais.',
    portfolioPhotos: [] as string[],
    certifications: ['Certificado em Limpeza Industrial'],
    verificationStatus: 'VERIFIED',
    reviewCount: 32,
    location: 'São Paulo, SP',
  },
  {
    id: 'ctr-3',
    name: 'Ana Oliveira',
    rating: 4.8,
    specialties: ['Limpeza de Janelas', 'Limpeza Residencial'],
    bio: 'Especialista em limpeza de janelas e fachadas. Trabalho seguro com equipamentos adequados para alturas.',
    portfolioPhotos: [] as string[],
    certifications: ['NR-35 Trabalho em Altura', 'Técnica em Limpeza Predial'],
    verificationStatus: 'PENDING',
    reviewCount: 21,
    location: 'São Paulo, SP',
  },
];

export const MOCK_CHAT_ROOMS = [
  { id: 'room-1', clientId: 'user-123', contractorId: 'ctr-1', contractId: 'contract-1', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'room-2', clientId: 'user-123', contractorId: 'ctr-2', contractId: 'contract-2', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
];

export const MOCK_CHAT_MESSAGES: Record<string, Array<{ id: string; roomId: string; senderId: string; content: string; sentAt: string }>> = {
  'room-1': [
    { id: 'msg-1', roomId: 'room-1', senderId: 'ctr-1', content: 'Olá! Tudo bem? Meu nome é Maria, serei a profissional responsável pela sua limpeza.', sentAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: 'msg-2', roomId: 'room-1', senderId: 'user-123', content: 'Olá Maria! Tudo ótimo. Que bom, estou aguardando.', sentAt: new Date(Date.now() - 50 * 60 * 1000).toISOString() },
    { id: 'msg-3', roomId: 'room-1', senderId: 'ctr-1', content: 'Chegarei por volta das 14h, conforme agendado. Há alguma instrução especial para a portaria?', sentAt: new Date(Date.now() - 40 * 60 * 1000).toISOString() },
  ],
  'room-2': [
    { id: 'msg-4', roomId: 'room-2', senderId: 'ctr-2', content: 'Boa tarde! Confirmando o serviço de limpeza pós-obra para amanhã.', sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'msg-5', roomId: 'room-2', senderId: 'user-123', content: 'Perfeito! Estarei lá para abrir.', sentAt: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
  ],
};

export const MOCK_TICKETS = [
  {
    id: 'ticket-1',
    requesterId: 'user-123',
    contractId: 'contract-1',
    type: 'SUPPORT',
    priority: 'LOW',
    status: 'OPEN',
    subject: 'Dúvida sobre reagendamento',
    description: 'Preciso reagendar meu serviço de limpeza para outro dia. Como faço isso pelo aplicativo?',
    resolution: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ticket-2',
    requesterId: 'user-123',
    contractId: 'contract-2',
    type: 'DISPUTE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    subject: 'Serviço não realizado conforme combinado',
    description: 'O profissional não limpou os banheiros conforme o escopo combinado no agendamento.',
    resolution: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ticket-3',
    requesterId: 'user-123',
    contractId: 'contract-1',
    type: 'COMPLAINT',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    subject: 'Atraso do profissional',
    description: 'O profissional chegou 2 horas atrasado sem avisar previamente.',
    resolution: 'Pedimos desculpas pelo transtorno. Um cupom de desconto foi adicionado à sua conta.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_SEARCH_RESULTS = [
  { id: '1', name: 'Limpeza Residencial', price: 120, description: 'Limpeza completa de casas e apartamentos.' },
  { id: '3', name: 'Limpeza de Escritório', price: 200, description: 'Manutenção de ambientes corporativos.' },
  { id: '4', name: 'Limpeza de Estofados', price: 180, description: 'Higienização profunda de sofás e poltronas.' },
];

export const MOCK_JOB_DETAILS: Record<string, object> = {
  'job-1': {
    id: 'job-1',
    serviceId: '1',
    serviceName: 'Limpeza Residencial',
    clientId: 'user-123',
    contractorId: 'ctr-1',
    contractorName: 'Maria Silva',
    contractorRating: 4.9,
    startTime: '2024-04-25T10:00:00Z',
    endTime: '2024-04-25T14:00:00Z',
    status: 'COMPLETED',
    agreedPrice: 120,
    address: 'Rua das Flores, 123 - Apto 45',
    schedulingId: 'job-1',
    contractId: 'contract-1',
  },
  'job-2': {
    id: 'job-2',
    serviceId: '2',
    serviceName: 'Limpeza Pós-Obra',
    clientId: 'user-123',
    contractorId: 'ctr-2',
    contractorName: 'João Santos',
    contractorRating: 4.7,
    startTime: '2024-04-30T08:00:00Z',
    endTime: '2024-04-30T16:00:00Z',
    status: 'IN_PROGRESS',
    agreedPrice: 450,
    address: 'Av. Paulista, 1000 - Sala 210',
    schedulingId: 'job-2',
    contractId: 'contract-2',
  },
  'job-3': {
    id: 'job-3',
    serviceId: '3',
    serviceName: 'Limpeza de Escritório',
    clientId: 'user-123',
    contractorId: 'ctr-3',
    contractorName: 'Ana Oliveira',
    contractorRating: 4.8,
    startTime: '2024-05-02T14:00:00Z',
    endTime: '2024-05-02T18:00:00Z',
    status: 'PENDING',
    agreedPrice: 200,
    address: 'Rua Augusta, 500 - Conjunto 32',
    schedulingId: 'job-3',
    contractId: 'contract-3',
  },
};

const futureDate1 = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
const futureDate2 = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

export const MOCK_CONTRACTS = [
  {
    id: 'contract-1',
    clientId: 'user-123',
    contractorId: 'ctr-1',
    serviceId: '1',
    schedulingId: 'job-1',
    agreedPrice: 120,
    status: 'CONFIRMED',
    serviceStartTime: futureDate1,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'contract-2',
    clientId: 'user-123',
    contractorId: 'ctr-2',
    serviceId: '2',
    schedulingId: 'job-2',
    agreedPrice: 450,
    status: 'PENDING_PAYMENT',
    serviceStartTime: futureDate2,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
