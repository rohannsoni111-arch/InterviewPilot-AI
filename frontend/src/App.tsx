import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { HealthPage } from './pages/HealthPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { InterviewSetupPage } from './pages/InterviewSetupPage';
import { InterviewsListPage } from './pages/InterviewsListPage';
import { InterviewRoomPage } from './pages/InterviewRoomPage';
import { InterviewReportPage } from './pages/InterviewReportPage';
import { ResumesPage } from './pages/ResumesPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="health" element={<HealthPage />} />
                    <Route path="auth/login" element={<LoginPage />} />
                    <Route path="auth/register" element={<RegisterPage />} />
                    
                    {/* Protected Routes */}
                    <Route
                      path="dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="interviews"
                      element={
                        <ProtectedRoute>
                          <InterviewsListPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="interviews/new"
                      element={
                        <ProtectedRoute>
                          <InterviewSetupPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="resumes"
                      element={
                        <ProtectedRoute>
                          <ResumesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="interviews/:id/room"
                      element={
                        <ProtectedRoute>
                          <InterviewRoomPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="interviews/:id/report"
                      element={
                        <ProtectedRoute>
                          <InterviewReportPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="interviews/:id"
                      element={
                        <ProtectedRoute>
                          <InterviewRoomPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="settings"
                      element={
                        <ProtectedRoute>
                          <SettingsPage />
                        </ProtectedRoute>
                      }
                    />


                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </QueryClientProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
