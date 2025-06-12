import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toast';
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
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  console.log('App component rendering...');
  
  return (
    <I18nextProvider i18n={i18n}>
      <SupabaseProvider>
        <UserProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-cosmic-black">
              <StarfieldBackground />
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auth/signin" element={<SignInPage />} />
                  <Route path="/auth/signup" element={<SignUpPage />} />
                  
                  {/* Onboarding routes */}
                  <Route path="/onboarding/questionnaire" element={<OnboardingQuestionnaire />} />
                  <Route path="/onboarding/profile" element={<OnboardingProfile />} />
                  <Route path="/onboarding/recommendations" element={<OnboardingRecommendations />} />
                  
                  {/* Protected routes */}
                  <Route path="/skill-swap" element={
                    <ProtectedRoute>
                      <SkillSwapPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/mentorship" element={
                    <ProtectedRoute>
                      <MentorshipPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/courses" element={
                    <ProtectedRoute>
                      <CoursesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/ranking" element={
                    <ProtectedRoute>
                      <RankingPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/test" element={
                    <ProtectedRoute>
                      <TestPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
              <Toaster />
            </div>
          </Router>
        </UserProvider>
      </SupabaseProvider>
    </I18nextProvider>
  );
}

export default App;