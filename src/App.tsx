import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toast';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { SupabaseProvider } from './lib/supabase/SupabaseProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n/i18n';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import SkillSwapPage from './pages/SkillSwapPage';
import MentorshipPage from './pages/MentorshipPage';
import CoursesPage from './pages/CoursesPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import StarfieldBackground from './components/effects/StarfieldBackground';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SupabaseProvider>
        <AuthProvider>
          <UserProvider>
            <Router>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <StarfieldBackground />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth/signin" element={<SignInPage />} />
                    <Route path="/auth/signup" element={<SignUpPage />} />
                    <Route path="/skill-swap" element={<SkillSwapPage />} />
                    <Route path="/mentorship" element={<MentorshipPage />} />
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
                <Toaster />
              </div>
            </Router>
          </UserProvider>
        </AuthProvider>
      </SupabaseProvider>
    </I18nextProvider>
  );
}

export default App;