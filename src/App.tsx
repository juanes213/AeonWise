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
import OnboardingQuestionnaire from './pages/onboarding/OnboardingQuestionnaire';
import OnboardingProfile from './pages/onboarding/OnboardingProfile';
import OnboardingRecommendations from './pages/onboarding/OnboardingRecommendations';
import SkillSwapPage from './pages/SkillSwapPage';
import MentorshipPage from './pages/MentorshipPage';
import CoursesPage from './pages/CoursesPage';
import ProfilePage from './pages/ProfilePage';
import RankingPage from './pages/RankingPage';
import TestPage from './pages/TestPage';
import NotFoundPage from './pages/NotFoundPage';
import StarfieldBackground from './components/effects/StarfieldBackground';
import AuthGuard from './components/auth/AuthGuard';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SupabaseProvider>
        <AuthProvider>
          <UserProvider>
            <Router>
              <div className="flex flex-col min-h-screen">
                <StarfieldBackground />
                <Routes>
                  {/* Public auth routes */}
                  <Route path="/auth/signin" element={<SignInPage />} />
                  <Route path="/auth/signup" element={<SignUpPage />} />
                  
                  {/* Onboarding routes */}
                  <Route path="/onboarding/questionnaire" element={<OnboardingQuestionnaire />} />
                  <Route path="/onboarding/profile" element={<OnboardingProfile />} />
                  <Route path="/onboarding/recommendations" element={<OnboardingRecommendations />} />
                  
                  {/* Protected main app routes */}
                  <Route path="/*" element={
                    <AuthGuard>
                      <Navbar />
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
                    </AuthGuard>
                  } />
                </Routes>
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