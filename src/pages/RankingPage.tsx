import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Star, Sparkles, Medal, Award, Loader2, User } from 'lucide-react';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { useToast } from '../hooks/useToast';

interface RankedUser {
  id: string;
  username: string;
  points: number;
  rank: string;
  skills: string[];
  avatar_url?: string;
  position: number;
}

const RankingPage: React.FC = () => {
  const supabase = useSupabase();
  const { toast } = useToast();
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'top10' | 'masters'>('all');
  const [timeoutError, setTimeoutError] = useState(false);

  const loadRankings = async () => {
    try {
      setLoading(true);
      setTimeoutError(false);
      console.log('Loading rankings...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, points, skills, avatar_url')
        .order('points', { ascending: false });
      console.log('Supabase response:', data, error);
      if (error) throw error;
      const rankedUsers = data?.map((user: any, index: number) => ({
        ...user,
        position: index + 1,
        rank: user.points >= 1601 ? 'cosmic_sage' :
              user.points >= 1201 ? 'galactic_guide' :
              user.points >= 801 ? 'comet_crafter' :
              user.points >= 501 ? 'astral_apprentice' :
              user.points >= 251 ? 'nebula_novice' : 'starspark'
      })) || [];
      setUsers(rankedUsers);
    } catch (error) {
      console.error('Error loading rankings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rankings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
    const timeout = setTimeout(() => {
      if (loading) {
        setTimeoutError(true);
        setLoading(false);
      }
    }, 7000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const getFilteredUsers = () => {
    switch (filter) {
      case 'top10':
        return users.slice(0, 10);
      case 'masters':
        return users.filter(user => ['cosmic_sage', 'galactic_guide', 'comet_crafter'].includes(user.rank));
      default:
        return users;
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-cosmic-gold-400">#{position}</span>;
    }
  };

  const getPositionBg = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-400/30';
      case 2:
        return 'bg-gradient-to-r from-gray-300/20 to-gray-500/20 border-gray-300/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-600/30';
      default:
        return 'bg-cosmic-black/30 border-cosmic-purple-700/30';
    }
  };

  const getRankBadgeClass = (rank: string) => {
    switch (rank) {
      case 'cosmic_sage':
        return 'bg-cosmic-gold-800 text-cosmic-gold-100';
      case 'galactic_guide':
        return 'bg-cosmic-purple-800 text-cosmic-purple-100';
      case 'comet_crafter':
        return 'bg-cosmic-blue-800 text-cosmic-blue-100';
      case 'astral_apprentice':
        return 'bg-cosmic-purple-900 text-cosmic-purple-100';
      case 'nebula_novice':
        return 'bg-cosmic-blue-900 text-cosmic-blue-100';
      default:
        return 'bg-cosmic-blue-900 text-cosmic-blue-100';
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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

  if (timeoutError) {
    return (
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center text-red-400">
              Something went wrong loading the rankings.<br />
              Please check your connection or try again later.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Trophy className="h-16 w-16 text-cosmic-gold-400 mx-auto mb-4" />
            <h1 className="font-display mb-4">Cosmic Leaderboard</h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Discover the most accomplished knowledge seekers and wisdom sharers in our cosmic community
            </p>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex bg-cosmic-black/50 backdrop-blur-sm rounded-lg p-1 border border-cosmic-purple-700/30">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-cosmic-purple-600 text-white'
                  : 'bg-transparent text-white/70 hover:text-white'
              }`}
              onClick={() => setFilter('all')}
            >
              All Users
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'top10'
                  ? 'bg-cosmic-purple-600 text-white'
                  : 'bg-transparent text-white/70 hover:text-white'
              }`}
              onClick={() => setFilter('top10')}
            >
              Top 10
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'masters'
                  ? 'bg-cosmic-purple-600 text-white'
                  : 'bg-transparent text-white/70 hover:text-white'
              }`}
              onClick={() => setFilter('masters')}
            >
              Masters Only
            </button>
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        {filter !== 'masters' && users.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-12"
          >
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {/* Second Place */}
              <div className="flex flex-col items-center pt-8">
                <div className="cosmos-card p-4 text-center bg-gradient-to-r from-gray-300/20 to-gray-500/20 border-gray-300/30">
                  <Medal className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <div className="w-16 h-16 rounded-full bg-cosmic-purple-800 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                    {users[1].avatar_url ? (
                      <img
                        src={users[1].avatar_url}
                        alt={users[1].username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-cosmic-gold-400" />
                    )}
                  </div>
                  <h3 className="font-display text-lg">{users[1].username}</h3>
                  <p className="text-cosmic-gold-400 font-bold">{users[1].points} pts</p>
                  <span className={`badge ${getRankBadgeClass(users[1].rank)} text-xs mt-2`}>
                    {users[1].rank.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* First Place */}
              <div className="flex flex-col items-center">
                <div className="cosmos-card p-6 text-center bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-400/30">
                  <Crown className="h-10 w-10 text-yellow-400 mx-auto mb-2" />
                  <div className="w-20 h-20 rounded-full bg-cosmic-purple-800 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                    {users[0].avatar_url ? (
                      <img
                        src={users[0].avatar_url}
                        alt={users[0].username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-cosmic-gold-400" />
                    )}
                  </div>
                  <h3 className="font-display text-xl">{users[0].username}</h3>
                  <p className="text-cosmic-gold-400 font-bold text-lg">{users[0].points} pts</p>
                  <span className={`badge ${getRankBadgeClass(users[0].rank)} text-sm mt-2`}>
                    {users[0].rank.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Third Place */}
              <div className="flex flex-col items-center pt-8">
                <div className="cosmos-card p-4 text-center bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-600/30">
                  <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <div className="w-16 h-16 rounded-full bg-cosmic-purple-800 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                    {users[2].avatar_url ? (
                      <img
                        src={users[2].avatar_url}
                        alt={users[2].username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-cosmic-gold-400" />
                    )}
                  </div>
                  <h3 className="font-display text-lg">{users[2].username}</h3>
                  <p className="text-cosmic-gold-400 font-bold">{users[2].points} pts</p>
                  <span className={`badge ${getRankBadgeClass(users[2].rank)} text-xs mt-2`}>
                    {users[2].rank.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rankings List */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              variants={itemVariant}
              className={`cosmos-card p-4 ${getPositionBg(user.position)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getPositionIcon(user.position)}
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-cosmic-purple-800 flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-cosmic-gold-400" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-display text-lg">{user.username}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${getRankBadgeClass(user.rank)} text-xs`}>
                        {user.rank.replace('_', ' ')}
                      </span>
                      {user.skills.length > 0 && (
                        <span className="text-xs text-gray-400">
                          {user.skills.slice(0, 2).join(', ')}
                          {user.skills.length > 2 && '...'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-cosmic-gold-400">
                    {user.points}
                  </div>
                  <div className="text-sm text-gray-400">points</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-white/70">
            No users found for the selected filter.
          </div>
        )}

        {/* Ranking Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 cosmos-card p-6"
        >
          <h2 className="text-xl font-display mb-4 flex items-center">
            <Star className="h-5 w-5 text-cosmic-gold-400 mr-2" />
            How Rankings Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h3 className="font-medium text-white mb-2">Earning Points</h3>
              <ul className="space-y-1">
                <li>• Complete skill swaps: 50 points</li>
                <li>• Finish courses: 100 points</li>
                <li>• Mentor sessions: 75 points</li>
                <li>• Profile verification: 200 points</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Cosmic Ranks</h3>
              <ul className="space-y-1">
                <li>• Starspark: 0-250 points</li>
                <li>• Nebula Novice: 251-500 points</li>
                <li>• Astral Apprentice: 501-800 points</li>
                <li>• Comet Crafter: 801-1200 points</li>
                <li>• Galactic Guide: 1201-1600 points</li>
                <li>• Cosmic Sage: 1601+ points</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RankingPage;