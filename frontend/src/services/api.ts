import AsyncStorage from '@react-native-async-storage/async-storage';
import * as mocks from './mockData';

const USE_MOCKS = true; // Set to false to use the real backend
const API_BASE_URL = 'http://localhost:8080';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    console.log(`[API ${options.method || 'GET'}] ${endpoint}`);

    if (USE_MOCKS) {
      await sleep(400);

      const method = options.method || 'GET';

      // AUTH
      if (endpoint === '/auth/login') return { data: mocks.MOCK_AUTH_RESPONSE, status: 200 };
      if (endpoint === '/auth/register') return { data: { message: 'Sucesso' }, status: 201 };

      // HOME DATA
      if (endpoint.startsWith('/home/')) {
        return {
          data: { userProfile: mocks.MOCK_USER, availableServices: mocks.MOCK_SERVICES },
          status: 200,
        };
      }

      // SCHEDULINGS
      if (endpoint.startsWith('/schedule/client/') || endpoint.startsWith('/schedule/contractor/')) {
        return { data: mocks.MOCK_JOBS, status: 200 };
      }
      if (endpoint.endsWith('/cancel') && method === 'PATCH') {
        return { data: { ...mocks.MOCK_JOBS[0], status: 'CANCELED' }, status: 200 };
      }
      if (endpoint === '/schedule/recurring' && method === 'POST') {
        const body = options.body ? JSON.parse(options.body as string) : {};
        return {
          data: [
            { id: 'sched-rec-1', ...body },
            { id: 'sched-rec-2', ...body },
            { id: 'sched-rec-3', ...body },
            { id: 'sched-rec-4', ...body },
          ],
          status: 201,
        };
      }
      if (endpoint === '/schedule' && method === 'POST') {
        const body = options.body ? JSON.parse(options.body as string) : {};
        return { data: { id: 'sched-new-1', ...body }, status: 201 };
      }
      // Single scheduling fetch: /schedule/{id}
      if (endpoint.startsWith('/schedule/') && method === 'GET') {
        const id = endpoint.split('/').pop() || '';
        const detail = (mocks.MOCK_JOB_DETAILS as Record<string, any>)[id] || mocks.MOCK_JOB_DETAILS['job-2'];
        return { data: detail, status: 200 };
      }

      // CONTRACTS
      if (endpoint.includes('/cancel-with-refund') && method === 'PATCH') {
        return { data: { ...mocks.MOCK_CONTRACTS[0], status: 'CANCELED', refundPercent: 100 }, status: 200 };
      }
      if (endpoint === '/contract' && method === 'POST') {
        const body = options.body ? JSON.parse(options.body as string) : {};
        return { data: { id: 'contract-new-1', status: 'PENDING_PAYMENT', ...body }, status: 201 };
      }
      if (endpoint.startsWith('/contracts/client/') && method === 'GET') {
        return { data: mocks.MOCK_CONTRACTS, status: 200 };
      }
      if (endpoint.startsWith('/contracts/contractor/') && method === 'GET') {
        return { data: mocks.MOCK_CONTRACTS, status: 200 };
      }
      if (endpoint.startsWith('/contracts/') && method === 'GET') {
        const id = endpoint.split('/').pop() || '';
        const contract = mocks.MOCK_CONTRACTS.find((c: any) => c.id === id) || mocks.MOCK_CONTRACTS[0];
        return { data: contract, status: 200 };
      }

      // PAYMENTS
      if (endpoint.startsWith('/payments/contract/') && method === 'GET') {
        return { data: { id: 'pay-1', contractId: endpoint.split('/').pop(), status: 'PENDING', amount: 250 }, status: 200 };
      }
      if (endpoint === '/payments/webhook' && method === 'POST') {
        return { data: { message: 'Pagamento processado com sucesso!' }, status: 200 };
      }

      // AVAILABILITY
      if (endpoint.startsWith('/availability/contractor/') && method === 'GET') {
        return { data: [
          { id: 'slot-1', contractorId: endpoint.split('/').pop(), startTime: '2026-06-01T10:00:00Z', endTime: '2026-06-01T14:00:00Z' },
          { id: 'slot-2', contractorId: endpoint.split('/').pop(), startTime: '2026-06-03T09:00:00Z', endTime: '2026-06-03T12:00:00Z' },
        ], status: 200 };
      }
      if (endpoint.startsWith('/availability/check') && method === 'GET') {
        return { data: true, status: 200 };
      }

      // NOTIFICATIONS
      if (endpoint.startsWith('/notifications/')) {
        return { data: mocks.MOCK_NOTIFICATIONS, status: 200 };
      }

      // RATINGS
      if (endpoint === '/ratings' && method === 'POST') {
        return { data: { message: 'Avaliação enviada!' }, status: 201 };
      }
      if (endpoint.endsWith('/average') && method === 'GET') {
        return { data: 4.8, status: 200 };
      }
      if (endpoint.startsWith('/ratings/') && method === 'GET') {
        return {
          data: [
            { id: 'rat-1', rating: 5, comment: 'Excelente serviço!', reviewerId: 'user-abc' },
            { id: 'rat-2', rating: 4, comment: 'Muito boa profissional.', reviewerId: 'user-def' },
            { id: 'rat-3', rating: 5, comment: 'Super pontual e caprichosa.', reviewerId: 'user-ghi' },
          ],
          status: 200,
        };
      }

      // CHAT
      if (endpoint === '/chat/rooms' && method === 'POST') {
        return { data: mocks.MOCK_CHAT_ROOMS[0], status: 200 };
      }
      if (endpoint.includes('/messages') && method === 'GET') {
        const parts = endpoint.split('/');
        const roomId = parts[2];
        const msgs = mocks.MOCK_CHAT_MESSAGES[roomId] || mocks.MOCK_CHAT_MESSAGES['room-1'] || [];
        return { data: msgs, status: 200 };
      }
      if (endpoint.includes('/messages') && method === 'POST') {
        const body = options.body ? JSON.parse(options.body as string) : {};
        return {
          data: {
            id: `msg-${Date.now()}`,
            roomId: endpoint.split('/')[2],
            senderId: body.senderId,
            content: body.content,
            sentAt: new Date().toISOString(),
          },
          status: 201,
        };
      }

      // SERVICES
      if (endpoint.startsWith('/services/search')) {
        return { data: mocks.MOCK_SEARCH_RESULTS, status: 200 };
      }
      if (endpoint === '/services' && method === 'GET') {
        return { data: mocks.MOCK_SERVICES, status: 200 };
      }
      if (endpoint.startsWith('/services/') && method === 'GET') {
        const id = endpoint.split('/').pop() || '';
        const svc = mocks.MOCK_SERVICES.find(s => s.id === id) || mocks.MOCK_SERVICES[0];
        return { data: svc, status: 200 };
      }

      // TICKETS
      if (endpoint === '/tickets' && method === 'POST') {
        const body = options.body ? JSON.parse(options.body as string) : {};
        return {
          data: {
            id: 'ticket-new-1',
            status: 'OPEN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...body,
          },
          status: 201,
        };
      }
      if (endpoint.startsWith('/tickets/requester/') && method === 'GET') {
        return { data: mocks.MOCK_TICKETS, status: 200 };
      }
      if (endpoint.startsWith('/tickets/contract/') && method === 'GET') {
        const contractId = endpoint.split('/').pop() || '';
        return { data: mocks.MOCK_TICKETS.filter(t => t.contractId === contractId), status: 200 };
      }
      if (endpoint.endsWith('/assign') && method === 'PATCH') {
        return { data: { ...mocks.MOCK_TICKETS[0], status: 'IN_PROGRESS' }, status: 200 };
      }
      if (endpoint.endsWith('/resolve') && method === 'PATCH') {
        return { data: { ...mocks.MOCK_TICKETS[0], status: 'RESOLVED' }, status: 200 };
      }
      if (endpoint.endsWith('/close') && method === 'PATCH') {
        return { data: { ...mocks.MOCK_TICKETS[0], status: 'CLOSED' }, status: 200 };
      }
      if (endpoint.startsWith('/tickets/') && method === 'GET') {
        const id = endpoint.split('/').pop() || '';
        const ticket = mocks.MOCK_TICKETS.find(t => t.id === id) || mocks.MOCK_TICKETS[0];
        return { data: ticket, status: 200 };
      }

      // GENERIC FALLBACK
      if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        return {
          data: { message: 'Operação realizada com sucesso!', id: 'mock-id-123' },
          status: 200,
        };
      }

      return { data: {}, status: 200 };
    }

    // REAL CALL
    const url = `${API_BASE_URL}/bff${endpoint}`;
    const token = await AsyncStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401) {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_profile']);
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { response: { status: response.status, data: errorData } };
      }
      return { data: await response.json(), status: response.status };
    } catch (error) {
      throw error;
    }
  },

  get(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },
  post(endpoint: string, data?: any, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'POST', body: data ? JSON.stringify(data) : undefined });
  },
  put(endpoint: string, data?: any, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'PUT', body: data ? JSON.stringify(data) : undefined });
  },
  patch(endpoint: string, data?: any, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'PATCH', body: data ? JSON.stringify(data) : undefined });
  },
  delete(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};

export default api;
