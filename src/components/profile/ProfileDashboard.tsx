import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, BookOpen, Sparkles, Trophy, Calendar, 
  TrendingUp, Target, MessageCircle, Users, Award
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { RankProgressWidget } from './RankProgressWidget';
import { PointsHistoryWidget } from './PointsHistoryWidget';

interface ProfileDashboardProps {
  className?: string;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  className = ''
}) => {
  const { user } = useUser();

  if (!user) return null;

  const stats = [
    { 
      label: 'Points', 
      value: user.points || 0, 
      icon: Trophy, 
      color: 'text-cosmic-gold-400',
      bgColor: 'bg-cosmic-gold-900/20'
    },
    { 
      label: 'Skills', 
      value: user.skills?.length || 0, 
      icon: Sparkles, 
      color: 'text-cosmic-purple-400',
      bgColor: 'bg-cosmic-purple-900/20'
    },
    { 
      label: 'Learning Goals', 
      value: user.learning_goals?.length || 0, 
      icon: Target, 
      color: 'text-cosmic-blue-400',
      bgColor: 'bg-cosmic-blue-900/20'
    },
    { 
      label: 'Member Since', 
      value: new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), 
      icon: Calendar, 
      color: 'text-cosmic-green-400',
      bgColor: 'bg-cosmic-green-900/20'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-xl font-display mb-4">Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-lg p-4 border border-${stat.color.replace('text-', '')}/30`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full bg-cosmic-black/30 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-gray-400">{stat.label}</div>
                <div className="text-lg font-bold">{stat.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankProgressWidget />
        <PointsHistoryWidget limit={3} />
      </div>

      {/* Activity Summary */}
      <div className="cosmos-card p-4">
        <h3 className="font-display text-lg mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-cosmic-gold-400 mr-2" />
          Activity Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-cosmic-black/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <BookOpen className="h-5 w-5 text-cosmic-blue-400" />
              <h4 className="font-medium">Learning</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Courses Enrolled</span>
                <span>3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lessons Completed</span>
                <span>12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hours Spent</span>
                <span>8.5</span>
              </div>
            </div>
          </div>
          
          <div className="bg-cosmic-black/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <MessageCircle className="h-5 w-5 text-cosmic-purple-400" />
              <h4 className="font-medium">Community</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Discussions</span>
                <span>5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Replies</span>
                <span>18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Likes Received</span>
                <span>24</span>
              </div>
            </div>
          </div>
          
          <div className="bg-cosmic-black/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Users className="h-5 w-5 text-cosmic-gold-400" />
              <h4 className="font-medium">Connections</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Skill Swaps</span>
                <span>2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mentor Sessions</span>
                <span>1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Events Attended</span>
                <span>3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="cosmos-card p-4">
        <h3 className="font-display text-lg mb-4 flex items-center">
          <Award className="h-5 w-5 text-cosmic-gold-400 mr-2" />
          Recent Achievements
        </h3>
        
        <div className="space-y-3">
          <div className="bg-cosmic-black/30 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-cosmic-gold-900/30">
                <Trophy className="h-5 w-5 text-cosmic-gold-400" />
              </div>
              <div>
                <h4 className="font-medium">Rank Up: Astral Apprentice</h4>
                <p className="text-sm text-gray-400">Reached 520 points and advanced to Astral Apprentice rank</p>
              </div>
            </div>
          </div>
          
          <div className="bg-cosmic-black/30 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-cosmic-blue-900/30">
                <BookOpen className="h-5 w-5 text-cosmic-blue-400" />
              </div>
              <div>
                <h4 className="font-medium">Course Completion</h4>
                <p className="text-sm text-gray-400">Completed "Python Programming Fundamentals" course</p>
              </div>
            </div>
          </div>
          
          <div className="bg-cosmic-black/30 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-cosmic-purple-900/30">
                <Users className="h-5 w-5 text-cosmic-purple-400" />
              </div>
              <div>
                <h4 className="font-medium">First Skill Swap</h4>
                <p className="text-sm text-gray-400">Completed your first skill swap with another community member</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};