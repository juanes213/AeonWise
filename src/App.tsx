import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toast';
import { SimpleAuthProvider } from './contexts/SimpleAuthContext';
import { SupabaseProvider } from './lib/supabase/SupabaseProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n/i18n';
import SimpleNavbar from './components/layout/SimpleNavbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import SimpleSignInPage from './pages/auth/SimpleSignInPage';
import SimpleSignUpPage from './pages/auth/SimpleSignUpPage';
import SkillSwapPage from './pages/SkillSwapPage';
import MentorshipPage from './pages/MentorshipPage';
import CoursesPage from './pages/CoursesPage';
import ProfilePage from './pages/ProfilePage';
import RankingPage from './pages/RankingPage';
import TestPage from './pages/TestPage';
import NotFoundPage from './pages/NotFoundPage';
import StarfieldBackground from './components/effects/StarfieldBackground';
import SimpleAuthGuard from './components/auth/SimpleAuthGuard';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SupabaseProvider>
        <SimpleAuthProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <StarfieldBackground />
              <Routes>
                {/* Public auth routes */}
                <Route path="/auth/signin" element={<SimpleSignInPage />} />
                <Route path="/auth/signup" element={<SimpleSignUpPage />} />
                
                {/* Protected main app routes */}
                <Route path="/*" element={
                  <SimpleAuthGuard>
                    <SimpleNavbar />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/skill-swap" element={<SkillSwapPage />} />
                        <Route path="/mentorship" element={<MentorshipPage />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/ranking" element={<RankingPage />} />
                        <Route path="/test" element={<TestPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </main>
                    <Footer />
                  </SimpleAuthGuard>
                } />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </SimpleAuthProvider>
      </SupabaseProvider>
    </I18nextProvider>
  );
}

export default App;