import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Loader2, BookOpen, Users, Sparkles, Star } from 'lucide-react';
import { useToast } from '../hooks/useToast';

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
      // Check if Groq API key is available
      const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      if (!groqApiKey) {
        // Fallback to mock data if no API key
        console.log('No Groq API key found, using mock data');
        const mockRecommendations = generateMockRecommendations(learningGoal);
        setRecommendations(mockRecommendations);
        setShowResults(true);
        toast({
          title: 'Recommendations Found!',
          description: `Found recommendations for ${learningGoal}`,
        });
        return;
      }

      // Call Groq API for AI-powered recommendations
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant for AeonWise, a skill-sharing platform. Based on the user's learning goal, provide recommendations in JSON format with three arrays:
              
              1. "courses" - Array of 3 course objects with: title, description, level (beginner/intermediate/advanced), duration (in hours), modules (number), category
              2. "mentors" - Array of 3 mentor objects with: name, specialty, price (number), currency ("USD"), sessionLength (in minutes), bio, rating (4.0-5.0)
              3. "matches" - Array of 3 user match objects with: name, skills (array), bio, matchScore (1-10)
              
              Make recommendations realistic and relevant to the learning goal.
              
              IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text before or after the JSON.`
            },
            {
              role: 'user',
              content: `Generate recommendations for someone wanting to learn: ${learningGoal}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        // Gracefully handle API failure by using mock data
        console.log('Groq API request failed, using mock data');
        const mockRecommendations = generateMockRecommendations(learningGoal);
        setRecommendations(mockRecommendations);
        setShowResults(true);
        toast({
          title: 'Recommendations Found!',
          description: 'AI recommendations unavailable, showing demo recommendations',
        });
        return;
      }

      const groqResponse = await response.json();
      let aiRecommendations;
      
      try {
        // Clean the response content to ensure it's valid JSON
        let content = groqResponse.choices[0].message.content.trim();
        
        // Remove any markdown code blocks if present
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Try to find JSON content if there's extra text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          content = jsonMatch[0];
        }
        
        aiRecommendations = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse AI response:', groqResponse.choices[0].message.content);
        // Fallback to mock recommendations
        aiRecommendations = generateMockRecommendations(learningGoal);
      }

      // Add IDs to the recommendations
      const coursesWithIds = aiRecommendations.courses?.map((course: any, index: number) => ({
        ...course,
        id: `ai-course-${index}`
      })) || [];

      const mentorsWithIds = aiRecommendations.mentors?.map((mentor: any, index: number) => ({
        ...mentor,
        id: `ai-mentor-${index}`
      })) || [];

      const matchesWithIds = aiRecommendations.matches?.map((match: any, index: number) => ({
        ...match,
        id: `ai-match-${index}`
      })) || [];

      setRecommendations({
        courses: coursesWithIds,
        mentors: mentorsWithIds,
        matches: matchesWithIds
      });

      setShowResults(true);

      toast({
        title: 'Recommendations Found!',
        description: `Found ${coursesWithIds.length} courses, ${mentorsWithIds.length} mentors, and ${matchesWithIds.length} matches`,
      });

    } catch (error) {
      console.error('Error finding recommendations:', error);
      // Fallback to mock data on error
      const mockRecommendations = generateMockRecommendations(learningGoal);
      setRecommendations(mockRecommendations);
      setShowResults(true);
      
      toast({
        title: 'Recommendations Found!',
        description: 'Using demo recommendations for your learning goal',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const generateMockRecommendations = (goal: string) => {
    return {
      courses: [
        {
          id: 'mock-course-1',
          title: `Introduction to ${goal}`,
          description: `Learn the fundamentals of ${goal} from scratch with hands-on projects`,
          level: 'beginner',
          duration: 8,
          modules: 6,
          category: 'General'
        },
        {
          id: 'mock-course-2',
          title: `Advanced ${goal} Techniques`,
          description: `Master advanced concepts and best practices in ${goal}`,
          level: 'intermediate',
          duration: 12,
          modules: 10,
          category: 'Advanced'
        },
        {
          id: 'mock-course-3',
          title: `${goal} for Professionals`,
          description: `Professional-level ${goal} skills for career advancement`,
          level: 'advanced',
          duration: 16,
          modules: 12,
          category: 'Professional'
        }
      ],
      mentors: [
        {
          id: 'mock-mentor-1',
          name: 'Alex Johnson',
          specialty: goal,
          price: 75,
          currency: 'USD',
          sessionLength: 60,
          bio: `Expert in ${goal} with 8+ years of experience helping students master the subject`,
          rating: 4.8
        },
        {
          id: 'mock-mentor-2',
          name: 'Sarah Chen',
          specialty: `Advanced ${goal}`,
          price: 95,
          currency: 'USD',
          sessionLength: 45,
          bio: `Senior specialist in ${goal} with industry experience and proven teaching methods`,
          rating: 4.9
        },
        {
          id: 'mock-mentor-3',
          name: 'Mike Rodriguez',
          specialty: `${goal} Fundamentals`,
          price: 60,
          currency: 'USD',
          sessionLength: 60,
          bio: `Passionate educator specializing in making ${goal} accessible to beginners`,
          rating: 4.7
        }
      ],
      matches: [
        {
          id: 'mock-match-1',
          name: 'Emma Wilson',
          skills: [goal, 'Teaching', 'Mentoring'],
          bio: `Experienced in ${goal} and loves helping others learn`,
          matchScore: 9
        },
        {
          id: 'mock-match-2',
          name: 'David Kim',
          skills: [goal, 'Project Management', 'Communication'],
          bio: `Professional with strong ${goal} background, happy to share knowledge`,
          matchScore: 8
        },
        {
          id: 'mock-match-3',
          name: 'Lisa Thompson',
          skills: [goal, 'Problem Solving', 'Collaboration'],
          bio: `Enthusiastic learner and teacher in the ${goal} community`,
          matchScore: 7
        }
      ]
    };
  };

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="font-display mb-4">Skill Swap</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Tell us what you want to learn and we'll find the perfect courses, mentors, and learning partners for you
          </p>
        </div>

        <div className="cosmos-card p-8 mb-12">
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
                className="btn-primary px-6"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    Find Matches
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recommended Courses */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
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
              
              <button className="btn-secondary w-full mt-4">
                View All Courses
              </button>
            </motion.div>

            {/* Expert Mentors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
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
                    <div key={mentor.id} className="bg-cosmic-black/30 rounded-lg p-4">
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
                    </div>
                  ))
                )}
              </div>
              
              <button className="btn-secondary w-full mt-4">
                Find More Mentors
              </button>
            </motion.div>

            {/* Learning Partners */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
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
                    <div key={match.id} className="bg-cosmic-black/30 rounded-lg p-4">
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
                    </div>
                  ))
                )}
              </div>
              
              <button className="btn-secondary w-full mt-4">
                View Community
              </button>
            </motion.div>
          </div>
        )}

        {/* Quick Start Tips */}
        {!showResults && (
          <div className="cosmos-card p-6 text-center">
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
                'Graphic Design'
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
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillSwapPage;