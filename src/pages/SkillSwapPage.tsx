import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Loader2, BookOpen, Users, Sparkles, Star, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { aiService } from '../services/aiService';

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
  name: string;
  specialty: string;
  price: number;
  currency: string;
  sessionLength: number;
  bio: string;
  rating: number;
}

interface Match {
  id: string;
  name: string;
  skills: string[];
  bio: string;
  matchScore: number;
}

const SkillSwapPage: React.FC = () => {
  const { toast } = useToast();
  
  const [learningGoal, setLearningGoal] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<{
    courses: Course[];
    mentors: Mentor[];
    matches: Match[];
  }>({
    courses: [],
    mentors: [],
    matches: []
  });

  const findRecommendations = async () => {
    if (!learningGoal.trim()) {
      toast({
        title: 'Learning Goal Required',
        description: 'Please enter what you want to learn',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    setShowResults(false);

    try {
      const aiRecommendations = await aiService.generateRecommendations(learningGoal);
      
      setRecommendations(aiRecommendations);
      setShowResults(true);
      
      toast({
        title: 'Recommendations Generated! 🎯',
        description: `Found ${aiRecommendations.courses.length} courses, ${aiRecommendations.mentors.length} mentors, and ${aiRecommendations.matches.length} learning partners`,
      });

    } catch (error) {
      console.error('Error finding recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
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

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-display mb-4">AI-Powered Skill Swap</h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Tell us what you want to learn and our AI will find the perfect courses, mentors, and learning partners for you
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="cosmos-card p-8 mb-12"
        >
          <div className="mb-8">
            <h2 className="text-xl font-display mb-6 flex items-center">
              <Search className="h-5 w-5 text-cosmic-gold-400 mr-2" />
              What do you want to learn?
            </h2>
            
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && findRecommendations()}
                className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                placeholder="e.g., Web Development, Machine Learning, Public Speaking, Photography..."
              />
              <button
                onClick={findRecommendations}
                disabled={isSearching || !learningGoal.trim()}
                className="btn-primary px-6 flex items-center"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Find Matches
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>

            {/* AI Service Status */}
            {!aiService.isConfigured() && (
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 text-yellow-300">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">AI features are in demo mode</span>
                </div>
                <p className="text-sm text-yellow-200 mt-1">
                  Add VITE_GROQ_API_KEY to your environment variables to enable real AI-powered recommendations.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {showResults && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Recommended Courses */}
            <motion.div
              variants={itemVariant}
              className="cosmos-card p-6"
            >
              <div className="flex items-center mb-6">
                <BookOpen className="h-6 w-6 text-cosmic-gold-400 mr-3" />
                <h2 className="text-xl font-display">Recommended Courses</h2>
              </div>
              
              <div className="space-y-4">
                {recommendations.courses.length === 0 ? (
                  <p className="text-gray-400 text-sm">No course suggestions available</p>
                ) : (
                  recommendations.courses.map((course) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-cosmic-black/30 rounded-lg p-4 hover:bg-cosmic-black/50 transition-colors"
                    >
                      <h3 className="font-medium mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className={`badge ${
                          course.level === 'beginner' ? 'bg-cosmic-blue-800 text-cosmic-blue-100' :
                          course.level === 'intermediate' ? 'bg-cosmic-purple-800 text-cosmic-purple-100' :
                          'bg-cosmic-gold-800 text-cosmic-gold-100'
                        } mr-2`}>
                          {course.level}
                        </span>
                        <span>{course.duration}h • {course.modules} modules</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              <button className="btn-secondary w-full mt-4">
                View All Courses
              </button>
            </motion.div>

            {/* Expert Mentors */}
            <motion.div
              variants={itemVariant}
              className="cosmos-card p-6"
            >
              <div className="flex items-center mb-6">
                <Sparkles className="h-6 w-6 text-cosmic-gold-400 mr-3" />
                <h2 className="text-xl font-display">Expert Mentors</h2>
              </div>
              
              <div className="space-y-4">
                {recommendations.mentors.length === 0 ? (
                  <p className="text-gray-400 text-sm">No mentors found for your learning goal</p>
                ) : (
                  recommendations.mentors.map((mentor) => (
                    <motion.div
                      key={mentor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-cosmic-black/30 rounded-lg p-4 hover:bg-cosmic-black/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{mentor.name}</h3>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          <span className="text-xs">{mentor.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-cosmic-gold-400 mb-2">{mentor.specialty}</p>
                      <div className="text-xs text-gray-400 mb-2">
                        ${mentor.price} {mentor.currency} / {mentor.sessionLength}min
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{mentor.bio}</p>
                    </motion.div>
                  ))
                )}
              </div>
              
              <button className="btn-secondary w-full mt-4">
                Find More Mentors
              </button>
            </motion.div>

            {/* Learning Partners */}
            <motion.div
              variants={itemVariant}
              className="cosmos-card p-6"
            >
              <div className="flex items-center mb-6">
                <Users className="h-6 w-6 text-cosmic-gold-400 mr-3" />
                <h2 className="text-xl font-display">Learning Partners</h2>
              </div>
              
              <div className="space-y-4">
                {recommendations.matches.length === 0 ? (
                  <p className="text-gray-400 text-sm">No learning partners found yet</p>
                ) : (
                  recommendations.matches.map((match) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-cosmic-black/30 rounded-lg p-4 hover:bg-cosmic-black/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{match.name}</h3>
                        <span className="text-xs bg-cosmic-purple-800 text-cosmic-purple-100 px-2 py-1 rounded">
                          {match.matchScore}/10 match
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="text-cosmic-purple-300 mb-1">
                          Skills: {match.skills.slice(0, 2).join(', ')}
                          {match.skills.length > 2 && '...'}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-2">{match.bio}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              <button className="btn-secondary w-full mt-4">
                View Community
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Quick Start Tips */}
        {!showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="cosmos-card p-6 text-center"
          >
            <h2 className="text-xl font-display mb-4">Popular Learning Goals</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Web Development',
                'Machine Learning',
                'Digital Marketing',
                'Photography',
                'Public Speaking',
                'Data Science',
                'Mobile App Development',
                'Graphic Design',
                'Python Programming',
                'UI/UX Design',
                'Blockchain',
                'Cybersecurity'
              ].map((goal) => (
                <button
                  key={goal}
                  onClick={() => setLearningGoal(goal)}
                  className="bg-cosmic-purple-800/30 hover:bg-cosmic-purple-700/50 text-white px-3 py-1 rounded-full text-sm transition-colors"
                >
                  {goal}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Click any topic above or type your own learning goal
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SkillSwapPage;