import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles, Search, UserPlus, ArrowRight, Loader2, Upload, FileText, Plus, X } from 'lucide-react';
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

const SkillSwapPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const supabase = useSupabase();
  
  const [skills, setSkills] = useState<string[]>([]);
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeInputs = () => {
      if (!isLoading && !user) {
        navigate('/auth/signin');
        return;
      }

      if (mounted && user) {
        if (user.skills?.length > 0) {
          setSkills([...user.skills]);
        }
        
        if (user.learning_goals?.length > 0) {
          setLearningGoals([...user.learning_goals]);
        }
      }
    };

    initializeInputs();

    return () => {
      mounted = false;
    };
  }, [user, isLoading, navigate]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addLearningGoal = () => {
    if (newGoal.trim() && !learningGoals.includes(newGoal.trim())) {
      setLearningGoals([...learningGoals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeLearningGoal = (index: number) => {
    setLearningGoals(learningGoals.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'skill' | 'goal') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'skill') {
        addSkill();
      } else {
        addLearningGoal();
      }
    }
  };

  const handleCvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.includes('text')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF or text file',
        variant: 'destructive',
      });
      return;
    }

    setCvFile(file);
    setIsAnalyzing(true);

    try {
      const text = await file.text();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cvText: text, 
          userId: user?.id 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze CV');
      }

      const data = await response.json();
      
      // Update the skills with extracted skills
      if (data.analysis.skills.length > 0) {
        const newSkills = [...skills];
        data.analysis.skills.forEach((skill: string) => {
          if (!newSkills.includes(skill)) {
            newSkills.push(skill);
          }
        });
        setSkills(newSkills);
      }

      toast({
        title: 'CV Analyzed Successfully',
        description: `Found ${data.analysis.skills.length} skills and awarded ${data.points} points!`,
      });

    } catch (error) {
      console.error('Error analyzing CV:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze CV. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const findMatches = async () => {
    if (skills.length === 0 || learningGoals.length === 0) {
      toast({
        title: 'Skills Required',
        description: 'Please add at least one skill and one learning goal',
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
      // Update user profile with skills and learning goals
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          skills,
          learning_goals: learningGoals,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Find matches using the edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/match-users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: user.id,
          skills, 
          learning_goals: learningGoals 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to find matches');
      }

      const data = await response.json();
      setMatches(data.matches || []);
      setShowMatches(true);
      
      if (data.matches.length === 0) {
        toast({
          title: 'No Matches Found',
          description: 'Try different skills or learning goals to find matches',
        });
      } else {
        toast({
          title: 'Matches Found!',
          description: `Found ${data.matches.length} potential matches`,
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
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="font-display mb-4">{t('skillSwap.title')}</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            {t('skillSwap.description')}
          </p>
        </div>

        <div className="cosmos-card p-8 mb-12">
          {/* CV Upload Section */}
          <div className="mb-8 p-6 bg-cosmic-black/30 rounded-lg">
            <h3 className="text-lg font-display mb-4 flex items-center">
              <FileText className="h-5 w-5 text-cosmic-gold-400 mr-2" />
              Upload Your CV (Optional)
            </h3>
            <p className="text-white/70 mb-4">
              Upload your CV to automatically extract skills and earn points based on your experience
            </p>
            <div className="flex items-center gap-4">
              <label className="btn-secondary cursor-pointer flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                {cvFile ? cvFile.name : 'Choose CV File'}
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleCvUpload}
                  className="hidden"
                  disabled={isAnalyzing}
                />
              </label>
              {isAnalyzing && (
                <div className="flex items-center text-cosmic-gold-400">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing CV...
                </div>
              )}
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-8">
            <h2 className="text-xl font-display mb-6 flex items-center">
              <Sparkles className="h-5 w-5 text-cosmic-gold-400 mr-2" />
              {t('skillSwap.yourSkills')}
            </h2>
            <p className="text-white/70 mb-4">
              Add the skills, knowledge, or expertise you can share with others
            </p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'skill')}
                className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                placeholder="e.g., Python, Graphic Design, Marketing..."
              />
              <button
                type="button"
                onClick={addSkill}
                className="btn-secondary px-4 py-2"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="inline-flex items-center bg-cosmic-purple-900/50 rounded-md px-3 py-1 text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="ml-2 text-white/70 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Goals Section */}
          <div className="mb-8">
            <h2 className="text-xl font-display mb-6 flex items-center">
              <Search className="h-5 w-5 text-cosmic-gold-400 mr-2" />
              {t('skillSwap.learningGoals')}
            </h2>
            <p className="text-white/70 mb-4">
              Add the skills or knowledge you're interested in learning
            </p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'goal')}
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
            
            <div className="flex flex-wrap gap-2">
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
              onClick={findMatches}
              disabled={isSearching || skills.length === 0 || learningGoals.length === 0}
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
              {t('skillSwap.matches.title')} ({matches.length} found)
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
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
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
                                {match.rank.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-cosmic-gold-400">
                            Match Score: {match.matchScore}
                          </div>
                          <div className="text-xs text-white/50">
                            {match.points} points
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-cosmic-gold-400 mb-2">
                          Can Teach:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {match.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-cosmic-purple-900/50 rounded-md text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {match.skills.length > 5 && (
                            <span className="text-xs text-white/50">
                              +{match.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-cosmic-gold-400 mb-2">
                          Wants to Learn:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {match.learning_goals.slice(0, 5).map((goal, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-cosmic-blue-900/50 rounded-md text-xs"
                            >
                              {goal}
                            </span>
                          ))}
                          {match.learning_goals.length > 5 && (
                            <span className="text-xs text-white/50">
                              +{match.learning_goals.length - 5} more
                            </span>
                          )}
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

export default SkillSwapPage;