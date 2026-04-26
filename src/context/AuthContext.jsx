import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// API URL - продакшен (Render)
const API_URL = import.meta.env.VITE_API_URL || 'https://freedomlife-server.onrender.com/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Ошибка входа');
    }
    
    // Сохраняем token и сразу получаем данные пользователя
    localStorage.setItem('token', data.token);
    setToken(data.token);
    
    // Сразу загружаем данные пользователя
    const userRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${data.token}` }
    });
    if (userRes.ok) {
      const userData = await userRes.json();
      setUser(userData);
    }
    
    return data;
  };

  const register = async (email, password, name, phone, weight) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone, weight })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Ошибка регистрации');
    }
    
    localStorage.setItem('token', data.token);
    setToken(data.token);
    
    // Сразу загружаем данные пользователя
    const userRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${data.token}` }
    });
    if (userRes.ok) {
      const userData = await userRes.json();
      setUser(userData);
    }
    
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout, 
      updateUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// API helper
export function useApi() {
  const { token } = useAuth();
  
  const api = {
    get: async (url) => {
      const res = await fetch(`${API_URL}${url}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res;
    },
    post: async (url, body) => {
      const res = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      return res;
    },
    put: async (url, body) => {
      const res = await fetch(`${API_URL}${url}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      return res;
    },
    delete: async (url) => {
      const res = await fetch(`${API_URL}${url}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return res;
    }
  };
  
  return api;
}
