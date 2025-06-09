import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, UserPlus, ArrowRight, Loader2, Plus, X, Sparkles, BookOpen, Users } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../hooks/useToast';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { getRankBadgeClass } from '../lib/utils';

interface MatchUser {
  id: string;
  username: string;
  skills: string[];
  learning_goals: string[];
  rank: string;
  points: number;
  avatar_url?: string;
  matchScore: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: number;
  modules: number;
  category: string;
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

const SkillSwapPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const supabase = useSupabase();
  
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [relatedMentors, setRelatedMentors] = useState<Mentor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/signin');
      return;
    }

    if (user && user.learning_goals?.length > 0) {
      setLearningGoals([...user.learning_goals]);
    }
  }, [user, isLoading, navigate]);

  const addLearningGoal = () => {
    if (newGoal.trim() && !learningGoals.includes(newGoal.trim())) {
      setLearningGoals([...learningGoals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeLearningGoal = (index: number) => {
    setLearningGoals(learningGoals.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLearningGoal();
    }
  };

  const findRecommendations = async () => {
    if (learningGoals.length === 0) {
      toast({
        title: 'Learning Goals Required',
        description: 'Please add at least one learning goal',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      navigate('/auth/signup');
      return;
    }

    setIsSearching(true);
    setShowResults(false);

    try {
      // Update user profile with learning goals
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          learning_goals: learningGoals,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Use Groq API to get intelligent recommendations
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant for AeonWise, a skill-sharing platform. Based on the user's learning goals, provide recommendations in JSON format with three arrays:
              
              1. "suggestedCourses" - Array of course objects with: title, description, level (beginner/intermediate/advanced), estimatedDuration (in hours), modules (number), category
              2. "skillMatches" - Array of skills that would complement their learning goals
              3. "mentorSpecialties" - Array of mentor specialties they should look for
              
              Keep recommendations practical and relevant. Limit each array to 3-5 items.`
            },
            {
              role: 'user',
              content: `Generate recommendations for someone wanting to learn: ${learningGoals.join(', ')}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI recommendations');
      }

      const groqResponse = await response.json();
      const recommendations = JSON.parse(groqResponse.choices[0].message.content);

      // Set suggested courses from AI
      const aiCourses = recommendations.suggestedCourses?.map((course: any, index: number) => ({
        id: `ai-${index}`,
        title: course.title,
        description: course.description,
        level: course.level,
        duration: course.estimatedDuration || 10,
        modules: course.modules || 8,
        category: course.category || 'General'
      })) || [];

      setSuggestedCourses(aiCourses);

      // Find user matches based on skills they want to learn
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, skills, learning_goals, points, avatar_url')
        .neq('id', user.id);

      if (profilesError) throw profilesError;

      const userMatches = profilesData?.map(profile => {
        let matchScore = 0;
        
        // Check if their skills match our learning goals
        for (const goal of learningGoals) {
          if (profile.skills?.some((skill: string) => 
            skill.toLowerCase().includes(goal.toLowerCase()) ||
            goal.toLowerCase().includes(skill.toLowerCase())
          )) {
            matchScore += 2;
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
        .slice(0, 5) || [];

      setMatches(userMatches);

      // Find related mentors
      const { data: mentorsData, error: mentorsError } = await supabase
        .from('mentorship_profiles')
        .select(`
          *,
          profiles!inner(username, points)
        `)
        .limit(5);

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
      })).filter(mentor => 
        learningGoals.some(goal => 
          mentor.specialty.toLowerCase().includes(goal.toLowerCase()) ||
          goal.toLowerCase().includes(mentor.specialty.toLowerCase())
        )
      ) || [];

      setRelatedMentors(formattedMentors);
      setShowResults(true);

      toast({
        title: 'Recommendations Found!',
        description: `Found ${aiCourses.length} courses, ${userMatches.length} matches, and ${formattedMentors.length} mentors`,
      });

    } catch (error) {
      console.error('Error finding recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to get recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const initiateConnection = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .insert({
          user_id: user?.id,
          matched_user_id: matchId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Connection Initiated',
        description: 'A connection request has been sent!',
      });
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: 'Error',
        description: 'Failed to send connection request',
        variant: 'destructive',
      });
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cosmic-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="font-display mb-4">{t('skillSwap.title')}</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Tell us what you want to learn and we'll find the perfect courses, mentors, and learning partners for you
          </p>
        </div>

        <div className="cosmos-card p-8 mb-12">
          {/* Learning Goals Section */}
          <div className="mb-8">
            <h2 className="text-xl font-display mb-6 flex items-center">
              <Search className="h-5 w-5 text-cosmic-gold-400 mr-2" />
              What do you want to learn?
            </h2>
            <p className="text-white/70 mb-4">
              Add the skills or knowledge you're interested in learning
            </p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                placeholder="e.g., Web Development, Machine Learning, Public Speaking..."
              />
              <button
                type="button"
                onClick={addLearningGoal}
                className="btn-secondary px-4 py-2"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {learningGoals.map((goal, index) => (
                <div
                  key={index}
                  className="inline-flex items-center bg-cosmic-blue-900/50 rounded-md px-3 py-1 text-sm"
                >
                  {goal}
                  <button
                    type="button"
                    onClick={() => removeLearningGoal(index)}
                    className="ml-2 text-white/70 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={findRecommendations}
              disabled={isSearching || learningGoals.length === 0}
              className="btn-primary"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Finding recommendations...
                </>
              ) : (
                <>
                  Get AI-Powered Recommendations
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

        {showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Suggested Courses */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="cosmos-card p-6"
            >
              <div className="flex items-center mb-6">
                <BookOpen className="h-6 w-6 text-cosmic-gold-400 mr-3" />
                <h2 className="text-xl font-display">Suggested Courses</h2>
              </div>
              
              <div className="space-y-4">
                {suggestedCourses.length === 0 ? (
                  <p className="text-gray-400 text-sm">No course suggestions available</p>
                ) : (
                  suggestedCourses.map((course) => (
                    <div key={course.id} className="bg-cosmic-black/30 rounded-lg p-4">
                      <h3 className="font-medium mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">{course.description}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className={`badge ${
                          course.level === 'beginner' ? 'bg-cosmic-blue-800 text-cosmic-blue-100' :
                          course.level === 'intermediate' ? 'bg-cosmic-purple-800 text-cosmic-purple-100' :
                          'bg-cosmic-gold-800 text-cosmic-gold-100'
                        } mr-2`}>
                          {course.level}
                        </span>
                        <span>{course.duration}h • {course.modules} modules</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <button
                onClick={() => navigate('/courses')}
                className="btn-secondary w-full mt-4"
              >
                View All Courses
              </button>
            </motion.div>

            {/* Learning Partners */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="cosmos-card p-6"
            >
              <div className="flex items-center mb-6">
                <Users className="h-6 w-6 text-cosmic-gold-400 mr-3" />
                <h2 className="text-xl font-display">Learning Partners</h2>
              </div>
              
              <div className="space-y-4">
                {matches.length === 0 ? (
                  <p className="text-gray-400 text-sm">No learning partners found yet</p>
                ) : (
                  matches.map((match) => (
                    <div key={match.id} className="bg-cosmic-black/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{match.username}</h3>
                        <span className={`badge ${getRankBadgeClass(match.rank)} text-xs`}>
                          {match.rank.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        Match Score: {match.matchScore} • {match.points} points
                      </div>
                      <div className="text-sm">
                        <p className="text-cosmic-purple-300 mb-1">
                          Can teach: {match.skills.slice(0, 2).join(', ')}
                          {match.skills.length > 2 && '...'}
                        </p>
                      </div>
                      <button
                        onClick={() => initiateConnection(match.id)}
                        className="btn-secondary w-full mt-3 text-sm"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Connect
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              <button
                onClick={() => navigate('/skill-swap')}
                className="btn-secondary w-full mt-4"
              >
                Find More Partners
              </button>
            </motion.div>

            {/* Expert Mentors */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="cosmos-card p-6"
            >
              <div className="flex items-center mb-6">
                <Sparkles className="h-6 w-6 text-cosmic-gold-400 mr-3" />
                <h2 className="text-xl font-display">Expert Mentors</h2>
              </div>
              
              <div className="space-y-4">
                {relatedMentors.length === 0 ? (
                  <p className="text-gray-400 text-sm">No mentors found for your learning goals</p>
                ) : (
                  relatedMentors.map((mentor) => (
                    <div key={mentor.id} className="bg-cosmic-black/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{mentor.username}</h3>
                        <span className={`badge ${getRankBadgeClass(mentor.rank)} text-xs`}>
                          {mentor.rank.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-cosmic-gold-400 mb-2">{mentor.specialty}</p>
                      <div className="text-xs text-gray-400 mb-2">
                        ${mentor.price} {mentor.currency} / {mentor.session_length}min
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{mentor.bio}</p>
                    </div>
                  ))
                )}
              </div>
              
              <button
                onClick={() => navigate('/mentorship')}
                className="btn-secondary w-full mt-4"
              >
                Find More Mentors
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillSwapPage;