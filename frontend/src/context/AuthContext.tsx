import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN';
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (credentials: any) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storageUser = await AsyncStorage.getItem('user_profile');
      const storageToken = await AsyncStorage.getItem('access_token');

      if (storageUser && storageToken) {
        setUser(JSON.parse(storageUser));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  const signIn = async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, refreshToken, user: userData } = response.data;

    // Note: The backend AuthResponse doesn't return the user object directly, 
    // it usually returns tokens. We might need to fetch the user profile separately 
    // or adjust the BFF to return it.
    // For now, I'll assume the BFF proxies the login and might enrich it, 
    // or we fetch the user profile immediately after login.
    
    await AsyncStorage.setItem('access_token', accessToken);
    await AsyncStorage.setItem('refresh_token', refreshToken);
    
    // Fetch profile if not returned in login
    if (!userData) {
      // In a real app, you'd decode the JWT to get the sub (userId)
      // or the BFF would have a /me endpoint.
      // Let's assume we can get it from the BFF home data for now or a /me endpoint.
      try {
        const profileResponse = await api.get('/home/me'); // Placeholder
        const profile = profileResponse.data.userProfile;
        setUser(profile);
        await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
      } catch (e) {
        console.error("Failed to fetch user profile after login", e);
      }
    } else {
      setUser(userData);
      await AsyncStorage.setItem('user_profile', JSON.stringify(userData));
    }
  };

  const signUp = async (userData: any) => {
    await api.post('/auth/register', userData);
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_profile']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
