import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Companies } from './pages/Companies';
import { CompanyDetail } from './pages/CompanyDetail';
import { Activities } from './pages/Activities';
import { ApprovalsQueue } from './pages/ApprovalsQueue';
import { VisitsLog } from './pages/VisitsLog';
import { Reports } from './pages/Reports';
import { AdminUsers } from './pages/AdminUsers';
import { Login } from './pages/Login';

const Layout = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafd] dark:bg-[#0a0e1a] transition-colors">
      <Navbar />
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/companies"
              element={
                <Layout>
                  <Companies />
                </Layout>
              }
            />
            <Route
              path="/companies/:id"
              element={
                <Layout>
                  <CompanyDetail />
                </Layout>
              }
            />
            <Route
              path="/activities"
              element={
                <Layout>
                  <Activities />
                </Layout>
              }
            />
            <Route
              path="/approvals"
              element={
                <Layout>
                  <ApprovalsQueue />
                </Layout>
              }
            />
            <Route
              path="/visits"
              element={
                <Layout>
                  <VisitsLog />
                </Layout>
              }
            />
            <Route
              path="/reports"
              element={
                <Layout>
                  <Reports />
                </Layout>
              }
            />
            <Route
              path="/admin"
              element={
                <Layout>
                  <AdminUsers />
                </Layout>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
