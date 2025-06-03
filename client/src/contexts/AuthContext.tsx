import React, { createContext, useContext, useState, useEffect } from 'react';
import { endpoints } from '../config/api';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string, userData: any) => void;
  logout: () => Promise<void>;
  lastRoute: string;
  setLastRoute: (route: string) => void;
  isLoading: boolean;
  updateProfile: (profileData: { name: string; email: string; phone?: string; location?: string }) => Promise<void>;
  updatePassword: (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [lastRoute, setLastRoute] = useState<string>('/login');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(endpoints.auth.logout, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      setLastRoute('/login');
    }
  };

  const updateProfile = async (profileData: { name: string; email: string; phone?: string; location?: string }) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No se encontró el token de autenticación");
    
    console.log('updateProfile - user:', user);
    console.log('updateProfile - profileData:', profileData);
    
    if (!user || !user.id) {
      throw new Error("No se encontró información del usuario");
    }

    try {
      console.log('updateProfile - Enviando request a:', endpoints.users.update(user.id));
      const response = await axios.put(
        endpoints.users.update(user.id),
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('updateProfile - Response:', response.data);

      if (response.data.success) {
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        throw new Error(response.data.message || 'Error al actualizar el perfil');
      }
    } catch (error: any) {
      console.error('updateProfile - Error:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el perfil');
    }
  };

  const updatePassword = async (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No se encontró el token de autenticación");
    
    console.log('updatePassword - user:', user);
    console.log('updatePassword - passwordData (sin passwords):', {
      currentPasswordLength: passwordData.currentPassword?.length,
      newPasswordLength: passwordData.newPassword?.length,
      confirmPasswordLength: passwordData.confirmPassword?.length
    });
    
    if (!user || !user.id) {
      throw new Error("No se encontró información del usuario");
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    try {
      console.log('updatePassword - Enviando request a:', `${endpoints.users.update(user.id)}/password`);
      const response = await axios.put(
        `${endpoints.users.update(user.id)}/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('updatePassword - Response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar la contraseña');
      }
    } catch (error: any) {
      console.error('updatePassword - Error:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar la contraseña');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      lastRoute, 
      setLastRoute, 
      isLoading,
      updateProfile,
      updatePassword,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}; 