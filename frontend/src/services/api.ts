import AsyncStorage from '@react-native-async-storage/async-storage';
import * as mocks from './mockData';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    console.log(`[API ${options.method || 'GET'}] ${endpoint}`);
    
    if (USE_MOCKS) {
      await sleep(600); // Latência reduzida para melhor experiência de teste

      // AUTH
      if (endpoint === '/auth/login') return { data: mocks.MOCK_AUTH_RESPONSE, status: 200 };
      if (endpoint === '/auth/register') return { data: { message: 'Sucesso' }, status: 201 };
      
      // HOME DATA
      if (endpoint.startsWith('/home/')) {
        return {
          data: {
            userProfile: mocks.MOCK_USER,
            availableServices: mocks.MOCK_SERVICES,
          },
          status: 200,
        };
      }

      // JOBS DATA
      if (endpoint === '/jobs') {
        return { data: mocks.MOCK_JOBS, status: 200 };
      }

      // GENERIC ACTIONS (Simula qualquer POST/PUT de ação)
      if (options.method === 'POST' || options.method === 'PUT') {
        return { data: { message: 'Operação realizada com sucesso!', id: Math.random().toString(36).substr(2, 9) }, status: 200 };
      }

      return { data: {}, status: 200 };
    }

    // REAL CALL
    const url = `${API_BASE_URL}/bff${endpoint}`;
    const token = await AsyncStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401) await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_profile']);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { response: { status: response.status, data: errorData } };
      }
      return { data: await response.json(), status: response.status };
    } catch (error) {
      throw error;
    }
  },

  get(endpoint: string, options?: RequestInit) { return this.request(endpoint, { ...options, method: 'GET' }); },
  post(endpoint: string, data?: any, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'POST', body: data ? JSON.stringify(data) : undefined });
  },
  put(endpoint: string, data?: any, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'PUT', body: data ? JSON.stringify(data) : undefined });
  },
  delete(endpoint: string, options?: RequestInit) { return this.request(endpoint, { ...options, method: 'DELETE' }); },
};

export default api;
