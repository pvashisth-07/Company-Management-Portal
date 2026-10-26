import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getAllUsersApi } from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  user_id: 1,
  name: "Hitesh Jain",
  email: "hitesh.coordinator@lnmiit.ac.in",
  role: "COORDINATOR",
  account_status: "ACTIVE"
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cep_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
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

  const logout = () => {
    setUser(null);
  };

  // Quick switch for prototype testing & demonstration
  const switchUser = (selectedUser) => {
    setUser(selectedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchUser, allUsers, refreshUsers: fetchUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
