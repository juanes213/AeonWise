import React from 'react';
import { Star, Sparkles, Rocket, Home as Comet, Salad as Galaxy, Infinity } from 'lucide-react';

interface RankBadgeProps {
  rank: string;
  points: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

const rankConfig = {
  starspark: {
    icon: Star,
    title: 'Starspark',
    color: 'from-blue-400 to-purple-400',
    next: { rank: 'Nebula Novice', points: 251 },
  },
  nebula_novice: {
    icon: Sparkles,
    title: 'Nebula Novice',
    color: 'from-purple-400 to-pink-400',
    next: { rank: 'Astral Apprentice', points: 501 },
  },
  astral_apprentice: {
    icon: Rocket,
    title: 'Astral Apprentice',
    color: 'from-pink-400 to-red-400',
    next: { rank: 'Comet Crafter', points: 801 },
  },
  comet_crafter: {
    icon: Comet,
    title: 'Comet Crafter',
    color: 'from-red-400 to-amber-400',
    next: { rank: 'Galactic Guide', points: 1201 },
  },
  galactic_guide: {
    icon: Galaxy,
    title: 'Galactic Guide',
    color: 'from-amber-400 to-yellow-400',
    next: { rank: 'Cosmic Sage', points: 1601 },
  },
  cosmic_sage: {
    icon: Infinity,
    title: 'Cosmic Sage',
    color: 'from-yellow-400 to-white',
    next: null,
  },
};

export const RankBadge: React.FC<RankBadgeProps> = ({ 
  rank, 
  points, 
  size = 'md',
  showProgress = false,
}) => {
  const config = rankConfig[rank as keyof typeof rankConfig];
  if (!config) return null;

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="space-y-2">
      <div 
        className={`
          inline-flex items-center rounded-full 
          bg-gradient-to-r ${config.color}
          ${sizeClasses[size]} gap-2
          animate-glow
        `}
      >
        <Icon className={iconSizes[size]} />
        <span className="font-medium">{config.title}</span>
      </div>

      {showProgress && config.next && (
        <div className="text-sm text-gray-400">
          <div className="flex justify-between mb-1">
            <span>{points} points</span>
            <span>{config.next.points - points} until {config.next.rank}</span>
          </div>
          <div className="w-full bg-cosmic-black/50 rounded-full h-2">
            <div
              className={`bg-gradient-to-r ${config.color} h-2 rounded-full transition-all duration-500`}
              style={{ 
                width: `${(points / config.next.points) * 100}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};