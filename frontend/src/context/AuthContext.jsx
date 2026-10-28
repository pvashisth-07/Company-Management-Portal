import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getAllUsersApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cep_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cep_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cep_user');
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsersApi();
      setAllUsers(res.data);
    } catch (err) {
      console.error("Could not fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    setUser(res.data);
    return res.data;
  };

  const signup = async (userData) => {
    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || "USER"
    };
    const res = await registerApi(payload);
    setUser(res.data);
    await fetchUsers();
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cep_user');
  };

  // Quick switch for prototype testing & demonstration
  const switchUser = (selectedUser) => {
    setUser(selectedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, switchUser, allUsers, refreshUsers: fetchUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
