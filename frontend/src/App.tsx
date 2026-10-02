import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { PassengerDashboard } from './pages/dashboard/PassengerDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { BusScheduleSearchPage } from './pages/schedules/BusScheduleSearchPage';
import { BusServiceDetailPage } from './pages/schedules/BusServiceDetailPage';
import { WomensSafetyPage } from './pages/safety/WomensSafetyPage';
import { SharedLocationViewPage } from './pages/safety/SharedLocationViewPage';
import { SubmitComplaintPage } from './pages/complaints/SubmitComplaintPage';
import { TrackComplaintPage } from './pages/complaints/TrackComplaintPage';
import { SmsServicePage } from './pages/sms/SmsServicePage';
import { VoiceAssistantPage } from './pages/assistant/VoiceAssistantPage';
import { PassengerProfilePage } from './pages/profile/PassengerProfilePage';
import { AdminTimetablePage } from './pages/admin/AdminTimetablePage';
import { AdminComplaintsPage } from './pages/admin/AdminComplaintsPage';
import { AdminRouteCodesPage } from './pages/admin/AdminRouteCodesPage';
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage';
import { TermsPage } from './pages/legal/TermsPage';
import { NotFoundPage } from './pages/legal/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Transit Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/schedules" element={<BusScheduleSearchPage />} />
                <Route path="/schedules/service/:serviceId" element={<BusServiceDetailPage />} />
                <Route path="/sms" element={<SmsServicePage />} />
                <Route path="/assistant" element={<VoiceAssistantPage />} />
                <Route path="/complaints/track" element={<TrackComplaintPage />} />
                <Route path="/safety/live/:token" element={<SharedLocationViewPage />} />

                {/* Authentication Pages */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected Passenger Pages */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <PassengerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/safety"
                  element={
                    <ProtectedRoute>
                      <WomensSafetyPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/complaints"
                  element={
                    <ProtectedRoute>
                      <SubmitComplaintPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <PassengerProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Pages */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/timetables"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminTimetablePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/complaints"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminComplaintsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/routes"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminRouteCodesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Legal & Policy Pages */}
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
