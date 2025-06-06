import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles, Search, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
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
}

const SkillSwapPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const supabase = useSupabase();
  
  const [skillsInput, setSkillsInput] = useState('');
  const [learningInput, setLearningInput] = useState('');
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMatches, setShowMatches] = useState(false);

  useEffect(() => {
    // Redirect to signup if not authenticated and not loading
    if (!isLoading && !user) {
      navigate('/auth/signup');
      return;
    }

    // Load user's existing skills and learning goals if available
    if (user) {
      if (user.skills && user.skills.length > 0) {
        setSkillsInput(user.skills.join(', '));
      }
      
      if (user.learning_goals && user.learning_goals.length > 0) {
        setLearningInput(user.learning_goals.join(', '));
      }
    }
  }, [user, isLoading, navigate]);

  const findMatches = async () => {
    if (!skillsInput.trim() || !learningInput.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter both your skills and learning goals',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      navigate('/auth/signup');
      return;
    }

    setIsSearching(true);
    setShowMatches(false);

    try {
      // Update user's skills and learning goals in the database
      const skills = skillsInput.split(',').map(s => s.trim()).filter(s => s);
      const learning_goals = learningInput.split(',').map(g => g.trim()).filter(g => g);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          skills,
          learning_goals,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Find matches
      setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username, skills, learning_goals, points, avatar_url')
            .neq('id', user.id);

          if (error) {
            throw error;
          }

          // Simple matching algorithm
          const potentialMatches = data.map(profile => {
            let matchScore = 0;
            
            // Your skills matching their learning goals
            for (const skill of skills) {
              if (profile.learning_goals.some(goal => 
                goal.toLowerCase().includes(skill.toLowerCase())
              )) {
                matchScore += 1;
              }
            }
            
            // Their skills matching your learning goals
            for (const goal of learning_goals) {
              if (profile.skills.some(skill => 
                skill.toLowerCase().includes(goal.toLowerCase())
              )) {
                matchScore += 1;
              }
            }
            
            return {
              ...profile,
              matchScore,
              rank: profile.points >= 801 ? 'master' :
                    profile.points >= 601 ? 'expert' :
                    profile.points >= 401 ? 'journeyman' :
                    profile.points >= 201 ? 'apprentice' : 'novice'
            };
          });
          
          // Filter to only include users with a match score > 0 and sort by match score
          const matchedUsers = potentialMatches
            .filter(profile => profile.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5); // Limit to top 5 matches
          
          setMatches(matchedUsers);
          setShowMatches(true);
          
          if (matchedUsers.length === 0) {
            toast({
              title: 'No Matches Found',
              description: 'Try different skills or learning goals to find matches',
            });
          }
        } catch (error) {
          console.error('Error finding matches:', error);
          toast({
            title: 'Error',
            description: 'Failed to find matches. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsSearching(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
      setIsSearching(false);
    }
  };

  const initiateConnection = (matchId: string) => {
    toast({
      title: 'Connection Initiated',
      description: 'A connection request has been sent!',
    });
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
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="font-display mb-4">{t('skillSwap.title')}</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            {t('skillSwap.description')}
          </p>
        </div>

        <div className="cosmos-card p-8 mb-12">
          <div className="mb-8">
            <h2 className="text-xl font-display mb-6 flex items-center">
              <Sparkles className="h-5 w-5 text-cosmic-gold-400 mr-2" />
              {t('skillSwap.yourSkills')}
            </h2>
            <p className="text-white/70 mb-3">
              What skills, knowledge, or expertise can you share with others?
            </p>
            <textarea
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder={t('skillSwap.skillPlaceholder')}
              className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 min-h-[100px]"
            />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-display mb-6 flex items-center">
              <Search className="h-5 w-5 text-cosmic-gold-400 mr-2" />
              {t('skillSwap.learningGoals')}
            </h2>
            <p className="text-white/70 mb-3">
              What skills or knowledge are you interested in learning?
            </p>
            <textarea
              value={learningInput}
              onChange={(e) => setLearningInput(e.target.value)}
              placeholder={t('skillSwap.goalsPlaceholder')}
              className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 min-h-[100px]"
            />
          </div>

          <div className="text-center">
            <button
              onClick={findMatches}
              disabled={isSearching}
              className="btn-primary"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Searching for matches...
                </>
              ) : (
                <>
                  {t('skillSwap.findMatches')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

        {showMatches && (
          <div>
            <h2 className="text-2xl font-display mb-8 text-center">
              {t('skillSwap.matches.title')}
            </h2>

            {matches.length === 0 ? (
              <div className="text-center text-white/70">
                {t('skillSwap.matches.empty')}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {matches.map((match) => (
                  <motion.div
                    key={match.id}
                    className="cosmos-card overflow-hidden"
                    variants={itemVariant}
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-cosmic-purple-800 flex items-center justify-center mr-4">
                          {match.avatar_url ? (
                            <img
                              src={match.avatar_url}
                              alt={match.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Sparkles className="h-6 w-6 text-cosmic-gold-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-display">{match.username}</h3>
                          <div className="mt-1">
                            <span className={`badge ${getRankBadgeClass(match.rank)}`}>
                              {t(`ranks.${match.rank}`)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-cosmic-gold-400 mb-2">
                          Can Teach:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {match.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-cosmic-purple-900/50 rounded-md text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-cosmic-gold-400 mb-2">
                          Wants to Learn:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {match.learning_goals.map((goal, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-cosmic-blue-900/50 rounded-md text-xs"
                            >
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => initiateConnection(match.id)}
                        className="btn-primary w-full flex items-center justify-center"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t('common.connect')}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};