import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/shared/Layout'
import HomePage from './components/HomePage/HomePage'
import LoginPage from './components/Auth/LoginPage'
import SignupPage from './components/Auth/SignupPage'
import ProfileSetup from './components/Profile/ProfileSetup'
import EmailVerificationPage from './components/Auth/EmailVerificationPage'
import VerifyEmailHandler from './components/Auth/VerifyEmailHandler'
import Dashboard from './components/Dashboard/Dashboard'
import DashboardSlug from './components/Dashboard/DashboardSlug'
import Projects from './components/Projects/Projects'
import ProjectSlug from './components/Projects/ProjectSlug'
import NotificationsPage from './components/Notifications/NotificationsPage'
import ProfileSlug from './components/Profile/ProfileSlug'
import Settings from './components/Profile/Settings'
import './App.css'

function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated but profile is not completed, show profile setup
  // BUT allow access to settings page to complete profile
  if (isAuthenticated && user && !user.profile_completed && location.pathname !== '/settings') {
    return <ProfileSetup />;
  }

  return (
    <NotificationProvider>
      <Routes>
        {/* Auth routes without layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/verify" element={<VerifyEmailHandler />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        
        {/* Main app routes with layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/:slug" element={<DashboardSlug />} />
              <Route path="/projects/:slug" element={<ProjectSlug />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile/:username" element={<ProfileSlug />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/reviews" element={<div className="p-8"><h1 className="text-3xl font-bold">Reviews Page</h1></div>} />
              <Route path="/profile" element={<div className="p-8"><h1 className="text-3xl font-bold">Profile Page</h1></div>} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </NotificationProvider>
  )
}

export default App
