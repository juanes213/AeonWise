import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, BookOpen, Users, Home, ArrowRight, Loader2, 
  Star, Clock, DollarSign, Play, Volume2 
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { useToast } from '../../hooks/useToast';
import { getRankBadgeClass } from '../../lib/utils';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: number;
  modules: number;
  category: string;
  image_url: string;
}

interface Mentor {
  id: string;
  username: string;
  specialty: string;
  price: number;
  currency: string;
  session_length: number;
  availability: string;
  bio: string;
  points: number;
  rank: string;
}

interface Match {
  id: string;
  username: string;
  skills: string[];
  learning_goals: string[];
  points: number;
  rank: string;
  matchScore: number;
}

const OnboardingRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();
  const supabase = useSupabase();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      // User should be created by now, but if not, wait a bit
      const timer = setTimeout(() => {
        if (!user) {
          toast({
            title: 'Authentication Error',
            description: 'Please complete the signup process again',
            variant: 'destructive',
          });
          navigate('/onboarding/questionnaire');
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      loadRecommendations();
    }
  }, [user, navigate, toast]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      // Get stored profile data
      const storedProfileData = localStorage.getItem('onboarding_complete_profile');
      if (!storedProfileData) {
        navigate('/onboarding/questionnaire');
        return;
      }
      
      const parsedProfileData = JSON.parse(storedProfileData);
      setProfileData(parsedProfileData);
      
      // Update the user's profile with all the collected data
      if (user) {
        await updateProfile({
          skills: parsedProfileData.skills,
          points: parsedProfileData.points,
          bio: parsedProfileData.bio,
        });
      }
      
      // Load recommended courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .limit(3);
      
      if (coursesError) throw coursesError;
      setCourses(coursesData || []);
      
      // Load mentors
      const { data: mentorsData, error: mentorsError } = await supabase
        .from('mentorship_profiles')
        .select(`
          *,
          profiles!inner(username, points)
        `)
        .limit(3);
      
      if (mentorsError) throw mentorsError;
      
      const formattedMentors = mentorsData?.map(mentor => ({
        id: mentor.id,
        username: mentor.profiles.username,
        specialty: mentor.specialty,
        price: mentor.price,
        currency: mentor.currency,
        session_length: mentor.session_length,
        availability: mentor.availability,
        bio: mentor.bio,
        points: mentor.profiles.points,
        rank: mentor.profiles.points >= 1601 ? 'cosmic_sage' :
              mentor.profiles.points >= 1201 ? 'galactic_guide' :
              mentor.profiles.points >= 801 ? 'comet_crafter' :
              mentor.profiles.points >= 501 ? 'astral_apprentice' :
              mentor.profiles.points >= 251 ? 'nebula_novice' : 'starspark'
      })) || [];
      
      setMentors(formattedMentors);
      
      // Find skill swap matches
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id);
      
      if (profilesError) throw profilesError;
      
      const potentialMatches = profilesData?.map(profile => {
        let matchScore = 0;
        
        for (const skill of parsedProfileData.skills) {
          if (profile.learning_goals?.some((goal: string) => 
            goal.toLowerCase().includes(skill.toLowerCase())
          )) {
            matchScore += 1;
          }
        }
        
        return {
          ...profile,
          matchScore,
          rank: profile.points >= 1601 ? 'cosmic_sage' :
                profile.points >= 1201 ? 'galactic_guide' :
                profile.points >= 801 ? 'comet_crafter' :
                profile.points >= 501 ? 'astral_apprentice' :
                profile.points >= 251 ? 'nebula_novice' : 'starspark'
        };
      }).filter(profile => profile.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3) || [];
      
      setMatches(potentialMatches);
      
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recommendations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const playIntroduction = (id: string) => {
    if (playingAudio === id) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(id);
      setTimeout(() => setPlayingAudio(null), 3000);
    }
  };

  const goToMainApp = () => {
    // Clear all onboarding data
    localStorage.removeItem('onboarding_account');
    localStorage.removeItem('onboarding_complete_profile');
    
    toast({
      title: 'Welcome to AeonWise!',
      description: 'Your cosmic journey begins now.',
    });
    
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-cosmic-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white/70">Setting up your cosmic profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <Sparkles className="h-12 w-12 text-cosmic-gold-400 mx-auto mb-4" />
          <h1 className="text-4xl font-display mb-4">Your Cosmic Recommendations</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Based on your skills and profile, we've curated the perfect matches, 
            courses, and mentors to accelerate your journey.
          </p>
          {profileData && (
            <div className="mt-6 inline-flex items-center bg-cosmic-purple-900/30 rounded-full px-6 py-2">
              <Star className="h-5 w-5 text-cosmic-gold-400 mr-2" />
              <span className="text-cosmic-gold-400 font-medium">
                {profileData.points} Cosmic Points Earned
              </span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Recommended Courses */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="cosmos-card p-6"
          >
            <div className="flex items-center mb-6">
              <BookOpen className="h-6 w-6 text-cosmic-gold-400 mr-3" />
              <h2 className="text-xl font-display">Recommended Courses</h2>
            </div>
            
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-cosmic-black/30 rounded-lg p-4">
                  <h3 className="font-medium mb-2">{course.title}</h3>
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration}h • {course.modules} modules</span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => navigate('/courses')}
              className="btn-secondary w-full mt-4"
            >
              View All Courses
            </button>
          </motion.div>

          {/* Recommended Mentors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="cosmos-card p-6"
          >
            <div className="flex items-center mb-6">
              <Star className="h-6 w-6 text-cosmic-gold-400 mr-3" />
              <h2 className="text-xl font-display">Expert Mentors</h2>
            </div>
            
            <div className="space-y-4">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="bg-cosmic-black/30 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{mentor.username}</h3>
                    <button
                      onClick={() => playIntroduction(mentor.id)}
                      className={`p-1 rounded ${
                        playingAudio === mentor.id
                          ? 'bg-cosmic-gold-500 text-white'
                          : 'bg-cosmic-purple-800/50 text-white/70'
                      }`}
                    >
                      {playingAudio === mentor.id ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-cosmic-gold-400 mb-2">{mentor.specialty}</p>
                  <div className="flex items-center text-sm text-gray-400">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>{mentor.price} {mentor.currency} / {mentor.session_length}min</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => navigate('/mentorship')}
              className="btn-secondary w-full mt-4"
            >
              Find More Mentors
            </button>
          </motion.div>

          {/* Skill Swap Matches */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="cosmos-card p-6"
          >
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-cosmic-gold-400 mr-3" />
              <h2 className="text-xl font-display">Perfect Matches</h2>
            </div>
            
            <div className="space-y-4">
              {matches.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No matches found yet. More users will join soon!
                </p>
              ) : (
                matches.map((match) => (
                  <div key={match.id} className="bg-cosmic-black/30 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{match.username}</h3>
                      <span className={`badge ${getRankBadgeClass(match.rank)} text-xs`}>
                        {match.rank.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      Match Score: {match.matchScore}
                    </div>
                    <div className="text-sm">
                      <p className="text-cosmic-purple-300 mb-1">
                        Can teach: {match.skills?.slice(0, 2).join(', ') || 'Various skills'}
                        {match.skills?.length > 2 && '...'}
                      </p>
                      <p className="text-cosmic-blue-300">
                        Wants to learn: {match.learning_goals?.slice(0, 2).join(', ') || 'Various topics'}
                        {match.learning_goals?.length > 2 && '...'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button
              onClick={() => navigate('/skill-swap')}
              className="btn-secondary w-full mt-4"
            >
              Find More Matches
            </button>
          </motion.div>
        </div>

        {/* Navigation Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="cosmos-card p-8 text-center"
        >
          <h2 className="text-2xl font-display mb-4">Ready to Begin Your Cosmic Journey?</h2>
          <p className="text-gray-400 mb-8">
            Choose where you'd like to start exploring the universe of knowledge
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/courses')}
              className="btn-secondary flex items-center justify-center"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Explore Courses
            </button>
            
            <button
              onClick={() => navigate('/mentorship')}
              className="btn-secondary flex items-center justify-center"
            >
              <Star className="h-4 w-4 mr-2" />
              Find Mentors
            </button>
            
            <button
              onClick={() => navigate('/skill-swap')}
              className="btn-secondary flex items-center justify-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Skill Swap
            </button>
            
            <button
              onClick={goToMainApp}
              className="btn-primary flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Enter AeonWise
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingRecommendations;