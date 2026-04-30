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
  { id: 'job-1', title: 'Limpeza Residencial', status: 'COMPLETED', date: '25 Abr 2024', price: 'R$ 150,00' },
  { id: 'job-2', title: 'Limpeza Pós-Obra', status: 'IN_PROGRESS', date: '30 Abr 2024', price: 'R$ 450,00' },
  { id: 'job-3', title: 'Limpeza de Sofá', status: 'PENDING', date: '02 Mai 2024', price: 'R$ 200,00' },
];

export const MOCK_AUTH_RESPONSE = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: MOCK_USER,
};
