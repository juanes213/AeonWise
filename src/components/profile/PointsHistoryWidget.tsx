import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, BookOpen, Users, Award, User, 
  Clock, Calendar, ChevronRight, Filter
} from 'lucide-react';
import { usePointsService } from '../../services/pointsService';
import { useUser } from '../../contexts/UserContext';

interface PointsHistoryWidgetProps {
  className?: string;
  limit?: number;
  showFilters?: boolean;
}

export const PointsHistoryWidget: React.FC<PointsHistoryWidgetProps> = ({
  className = '',
  limit = 5,
  showFilters = true
}) => {
  const { user } = useUser();
  const pointsService = usePointsService();
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'spent'>('all');

  useEffect(() => {
    if (user) {
      loadPointsHistory();
    }
  }, [user]);

  const loadPointsHistory = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const history = await pointsService.getPointsHistory(user.id);
      setPointsHistory(history);
    } catch (error) {
      console.error('Error loading points history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'lesson_completion':
        return <BookOpen className="h-4 w-4 text-cosmic-gold-400" />;
      case 'skill_swap':
        return <Users className="h-4 w-4 text-cosmic-purple-400" />;
      case 'profile_update':
        return <User className="h-4 w-4 text-cosmic-blue-400" />;
      case 'achievement':
        return <Award className="h-4 w-4 text-cosmic-gold-400" />;
      case 'decay':
        return <Clock className="h-4 w-4 text-red-400" />;
      default:
        return <TrendingUp className="h-4 w-4 text-cosmic-gold-400" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'lesson_completion':
        return 'Lesson Completed';
      case 'skill_swap':
        return 'Skill Swap';
      case 'profile_update':
        return 'Profile Updated';
      case 'achievement':
        return 'Achievement Unlocked';
      case 'decay':
        return 'Points Decay';
      default:
        return source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ');
    }
  };

  const filteredHistory = pointsHistory.filter(entry => {
    if (filter === 'all') return true;
    if (filter === 'earned') return entry.points > 0;
    if (filter === 'spent') return entry.points < 0;
    return true;
  }).slice(0, limit);

  if (loading) {
    return (
      <div className={`cosmos-card p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg flex items-center">
            <TrendingUp className="h-5 w-5 text-cosmic-gold-400 mr-2" />
            Points History
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`cosmos-card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg flex items-center">
          <TrendingUp className="h-5 w-5 text-cosmic-gold-400 mr-2" />
          Points History
        </h3>
        
        {showFilters && (
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md text-xs px-2 py-1 text-white"
            >
              <option value="all">All</option>
              <option value="earned">Earned</option>
              <option value="spent">Spent</option>
            </select>
          </div>
        )}
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No points history yet</p>
          <p className="text-sm">Complete activities to earn points</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-cosmic-black/30 rounded-lg p-3 hover:bg-cosmic-black/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    entry.points > 0 ? 'bg-cosmic-gold-900/30' : 'bg-red-900/30'
                  }`}>
                    {getSourceIcon(entry.source)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{getSourceLabel(entry.source)}</div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  entry.points > 0 ? 'text-cosmic-gold-400' : 'text-red-400'
                }`}>
                  {entry.points > 0 ? '+' : ''}{entry.points}
                </div>
              </div>
              
              {/* Details */}
              {entry.details && Object.keys(entry.details).length > 0 && (
                <div className="mt-2 ml-11 text-xs text-gray-400">
                  {entry.source === 'lesson_completion' && entry.details.lesson_title && (
                    <div className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {entry.details.lesson_title}
                    </div>
                  )}
                  {entry.source === 'skill_swap' && entry.details.match_username && (
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Matched with {entry.details.match_username}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {pointsHistory.length > limit && (
        <div className="mt-4 text-center">
          <button className="text-cosmic-blue-400 hover:text-cosmic-blue-300 text-sm flex items-center justify-center mx-auto">
            View all history
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};