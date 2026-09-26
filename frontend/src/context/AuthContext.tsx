import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IUser, RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto } from '@interviewpilot/shared';
import { api } from '../api/client';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileDto) => Promise<void>;
  changePassword: (data: ChangePasswordDto) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('ip_access_token'));
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('ip_access_token');
    localStorage.removeItem('ip_refresh_token');
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const setAuthData = useCallback((userData: IUser, token: string, refreshToken?: string) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem('ip_access_token', token);
    if (refreshToken) {
      localStorage.setItem('ip_refresh_token', refreshToken);
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  // Configure Axios interceptors for automatic token attachment and refresh
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('ip_access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem('ip_refresh_token');
          if (refreshToken) {
            try {
              const res = await api.post('/auth/refresh', { refreshToken });
              if (res.data?.success && res.data?.data) {
                const { user: refreshedUser, tokens } = res.data.data;
                setAuthData(refreshedUser, tokens.accessToken, tokens.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
                return api(originalRequest);
              }
            } catch (refreshErr) {
              clearAuth();
              showToast('Session expired. Please log in again.', 'warning');
            }
          } else {
            clearAuth();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [clearAuth, setAuthData, showToast]);

  // Initial session restoration
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('ip_access_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.data?.user) {
            setUser(res.data.data.user);
          } else {
            clearAuth();
          }
        } catch {
          // Token might be expired, try refresh
          const refreshToken = localStorage.getItem('ip_refresh_token');
          if (refreshToken) {
            try {
              const refreshRes = await api.post('/auth/refresh', { refreshToken });
              if (refreshRes.data?.success && refreshRes.data?.data) {
                const { user: refreshedUser, tokens } = refreshRes.data.data;
                setAuthData(refreshedUser, tokens.accessToken, tokens.refreshToken);
              } else {
                clearAuth();
              }
            } catch {
              clearAuth();
            }
          } else {
            clearAuth();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [clearAuth, setAuthData]);

  const login = async (data: LoginDto) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      if (res.data?.success && res.data?.data) {
        const { user: authUser, tokens } = res.data.data;
        setAuthData(authUser, tokens.accessToken, tokens.refreshToken);
        showToast(`Welcome back, ${authUser.name}!`, 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterDto) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      if (res.data?.success && res.data?.data) {
        const { user: authUser, tokens } = res.data.data;
        setAuthData(authUser, tokens.accessToken, tokens.refreshToken);
        showToast('Account created successfully!', 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Registration failed. Please check your inputs.';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('ip_refresh_token');
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore API logout error and clear local storage anyway
    } finally {
      clearAuth();
      showToast('You have been logged out.', 'info');
    }
  };

  const updateProfile = async (data: UpdateProfileDto) => {
    try {
      const res = await api.patch('/users/profile', data);
      if (res.data?.success && res.data?.data?.user) {
        setUser(res.data.data.user);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Could not update profile';
      showToast(msg, 'error');
      throw err;
    }
  };

  const changePassword = async (data: ChangePasswordDto) => {
    try {
      const res = await api.post('/users/change-password', data);
      if (res.data?.success) {
        showToast('Password changed successfully. Please log in again.', 'success');
        clearAuth();
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Password update failed';
      showToast(msg, 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
