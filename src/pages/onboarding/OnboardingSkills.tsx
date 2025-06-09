import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Search, ArrowRight, Loader2, Plus, X } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../hooks/useToast';

const OnboardingSkills: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();
  const { toast } = useToast();
  
  const [skills, setSkills] = useState<string[]>([]);
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth/signin');
    }
  }, [user, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (skills.length === 0 || learningGoals.length === 0) {
      toast({
        title: 'Skills Required',
        description: 'Please add at least one skill and one learning goal',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await updateProfile({
        skills,
        learning_goals: learningGoals,
      });
      
      if (error) {
        throw error;
      }
      
      // Store skills data for recommendations
      localStorage.setItem('onboarding_skills', JSON.stringify({
        skills,
        learningGoals,
      }));
      
      toast({
        title: 'Skills Saved!',
        description: 'Now let\'s find your perfect matches and recommendations.',
      });
      
      navigate('/onboarding/recommendations');
    } catch (error: any) {
      console.error('Skills update error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save skills',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <div className="cosmos-card p-8">
          <div className="text-center mb-8">
            <Sparkles className="h-12 w-12 text-cosmic-gold-400 mx-auto mb-4" />
            <h1 className="text-3xl font-display mb-2">Share Your Cosmic Knowledge</h1>
            <p className="text-gray-400">
              Tell us about your skills and what you'd like to learn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Skills Section */}
            <div>
              <h2 className="text-xl font-display mb-4 flex items-center">
                <Sparkles className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                What skills can you share?
              </h2>
              <p className="text-gray-400 mb-4">
                Add the skills, knowledge, or expertise you can teach others
              </p>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'skill')}
                  className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                  placeholder="e.g., Python, Graphic Design, Marketing..."
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn-secondary px-4 py-2"
                  disabled={loading}
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
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Goals Section */}
            <div>
              <h2 className="text-xl font-display mb-4 flex items-center">
                <Search className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                What would you like to learn?
              </h2>
              <p className="text-gray-400 mb-4">
                Add the skills or knowledge you're interested in acquiring
              </p>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'goal')}
                  className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                  placeholder="e.g., Machine Learning, Public Speaking, Photography..."
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addLearningGoal}
                  className="btn-secondary px-4 py-2"
                  disabled={loading}
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
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || skills.length === 0 || learningGoals.length === 0}
              className="w-full btn-primary flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Saving your cosmic profile...
                </>
              ) : (
                <>
                  Get My Recommendations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingSkills;