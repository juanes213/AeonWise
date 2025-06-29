import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, CheckCircle, Target, ArrowRight } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { usePointsService } from '../../services/pointsService';

interface RankProgressWidgetProps {
  className?: string;
}

export const RankProgressWidget: React.FC<RankProgressWidgetProps> = ({
  className = ''
}) => {
  const { user } = useUser();
  const pointsService = usePointsService();

  if (!user) return null;

  const nextRankInfo = pointsService.getPointsForNextRank(user.points || 0);
  const currentRank = user.rank || 'starspark';

  const ranks = [
    { name: 'starspark', label: 'Starspark', threshold: 0 },
    { name: 'nebula_novice', label: 'Nebula Novice', threshold: 251 },
    { name: 'astral_apprentice', label: 'Astral Apprentice', threshold: 501 },
    { name: 'comet_crafter', label: 'Comet Crafter', threshold: 801 },
    { name: 'galactic_guide', label: 'Galactic Guide', threshold: 1201 },
    { name: 'cosmic_sage', label: 'Cosmic Sage', threshold: 1601 }
  ];

  const currentRankIndex = ranks.findIndex(r => r.name === currentRank);
  const isMaxRank = currentRank === 'cosmic_sage';

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'starspark': return 'text-gray-400';
      case 'nebula_novice': return 'text-cosmic-blue-300';
      case 'astral_apprentice': return 'text-cosmic-purple-300';
      case 'comet_crafter': return 'text-cosmic-blue-400';
      case 'galactic_guide': return 'text-cosmic-purple-400';
      case 'cosmic_sage': return 'text-cosmic-gold-400';
      default: return 'text-gray-400';
    }
  };

  const getRankBgColor = (rank: string) => {
    switch (rank) {
      case 'starspark': return 'bg-gray-900/30';
      case 'nebula_novice': return 'bg-cosmic-blue-900/30';
      case 'astral_apprentice': return 'bg-cosmic-purple-900/30';
      case 'comet_crafter': return 'bg-cosmic-blue-800/30';
      case 'galactic_guide': return 'bg-cosmic-purple-800/30';
      case 'cosmic_sage': return 'bg-cosmic-gold-900/30';
      default: return 'bg-gray-900/30';
    }
  };

  return (
    <div className={`cosmos-card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg flex items-center">
          <Trophy className="h-5 w-5 text-cosmic-gold-400 mr-2" />
          Rank Progress
        </h3>
        <div className={`px-2 py-1 rounded-full text-xs ${getRankBgColor(currentRank)} ${getRankColor(currentRank)}`}>
          {currentRank.replace('_', ' ')}
        </div>
      </div>

      {/* Current Points */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-400">Current Points</span>
          <span className="text-lg font-bold text-cosmic-gold-400">{user.points || 0}</span>
        </div>
        
        {!isMaxRank && (
          <>
            <div className="w-full bg-cosmic-black/50 rounded-full h-2 mb-1">
              <motion.div
                className="bg-gradient-to-r from-cosmic-purple-500 to-cosmic-gold-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min(100, ((user.points || 0) / ((user.points || 0) + nextRankInfo.pointsNeeded)) * 100)}%` 
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Current: {currentRank.replace('_', ' ')}</span>
              <span>Next: {nextRankInfo.nextRank.replace('_', ' ')} ({nextRankInfo.pointsNeeded} more)</span>
            </div>
          </>
        )}
      </div>

      {/* Rank Progression */}
      <div className="relative mb-6 pt-6">
        <div className="absolute top-10 left-0 right-0 h-1 bg-cosmic-black/50"></div>
        <div className="relative flex justify-between">
          {ranks.map((rank, index) => {
            const isCurrentOrPassed = (user.points || 0) >= rank.threshold;
            const isCurrent = index < 5 
              ? (user.points || 0) >= rank.threshold && (user.points || 0) < ranks[index + 1].threshold
              : (user.points || 0) >= rank.threshold;
            
            return (
              <div key={rank.name} className="flex flex-col items-center">
                <div 
                  className={`w-5 h-5 rounded-full z-10 flex items-center justify-center ${
                    isCurrentOrPassed 
                      ? isCurrent 
                        ? 'bg-cosmic-gold-500 text-cosmic-black' 
                        : 'bg-cosmic-purple-600 text-white'
                      : 'bg-cosmic-black/70 text-gray-500'
                  }`}
                >
                  {isCurrent ? (
                    <Star className="h-3 w-3" />
                  ) : isCurrentOrPassed ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-xs font-medium ${
                    isCurrent ? 'text-cosmic-gold-400' : 
                    isCurrentOrPassed ? 'text-cosmic-purple-400' : 'text-gray-500'
                  }`}>
                    {rank.label}
                  </div>
                  <div className={`text-xs ${isCurrentOrPassed ? 'text-gray-400' : 'text-gray-600'}`}>
                    {rank.threshold}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rank Benefits */}
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center">
          <Target className="h-4 w-4 text-cosmic-purple-400 mr-2" />
          {isMaxRank ? 'Your Cosmic Sage Benefits' : 'Next Rank Benefits'}
        </h4>
        
        <ul className="space-y-2 text-sm">
          {isMaxRank ? (
            <>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-cosmic-gold-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Access to exclusive Cosmic Sage forums</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-cosmic-gold-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Priority access to new courses and features</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-cosmic-gold-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Ability to create and publish your own courses</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-cosmic-gold-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Special Cosmic Sage profile badge</span>
              </li>
            </>
          ) : nextRankInfo.nextRank === 'nebula_novice' ? (
            <>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-cosmic-blue-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Access to community discussion forums</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-cosmic-blue-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Ability to participate in skill swaps</span>
              </li>
            </>
          ) : nextRankInfo.nextRank === 'astral_apprentice' ? (
            <>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-cosmic-purple-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Access to intermediate courses</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-cosmic-purple-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Ability to create discussion threads</span>
              </li>
            </>
          ) : nextRankInfo.nextRank === 'comet_crafter' ? (
            <>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-cosmic-blue-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Access to advanced courses</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-cosmic-blue-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Ability to become a mentor</span>
              </li>
            </>
          ) : nextRankInfo.nextRank === 'galactic_guide' ? (
            <>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-cosmic-purple-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Access to exclusive Galactic Guide forums</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-cosmic-purple-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Ability to host community events</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-cosmic-gold-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Access to exclusive Cosmic Sage forums</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 text-cosmic-gold-400 mr-2 mt-0.5" />
                <span className="text-gray-300">Ability to create and publish your own courses</span>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};