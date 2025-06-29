import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Users, Award, Search, Filter, 
  TrendingUp, BookOpen, User, Calendar, MapPin,
  Star, ArrowRight, Bookmark, Share2, ThumbsUp
} from 'lucide-react';
import { DiscussionForum } from './DiscussionForum';
import { EnhancedSearch } from '../search/EnhancedSearch';

interface CommunityPageProps {
  className?: string;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'discussions' | 'members' | 'events'>('discussions');
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent'>('all');

  // Mock community members
  const members = [
    {
      id: '1',
      username: 'Alexandria',
      rank: 'cosmic_sage',
      points: 1850,
      skills: ['Python', 'Machine Learning', 'Data Science'],
      joinDate: '2023-09-15',
      location: 'San Francisco, CA',
      avatar: '/images/avatar1.jpg'
    },
    {
      id: '2',
      username: 'Marcus',
      rank: 'galactic_guide',
      points: 1420,
      skills: ['JavaScript', 'React', 'Node.js'],
      joinDate: '2023-10-02',
      location: 'New York, NY',
      avatar: '/images/avatar2.jpg'
    },
    {
      id: '3',
      username: 'Sophia',
      rank: 'comet_crafter',
      points: 950,
      skills: ['UX Design', 'Figma', 'User Research'],
      joinDate: '2023-11-18',
      location: 'London, UK',
      avatar: '/images/avatar3.jpg'
    },
    {
      id: '4',
      username: 'Julian',
      rank: 'astral_apprentice',
      points: 650,
      skills: ['Python', 'Django', 'PostgreSQL'],
      joinDate: '2024-01-05',
      location: 'Berlin, Germany',
      avatar: '/images/avatar4.jpg'
    },
    {
      id: '5',
      username: 'Elena',
      rank: 'nebula_novice',
      points: 320,
      skills: ['JavaScript', 'HTML/CSS', 'UI Design'],
      joinDate: '2024-02-20',
      location: 'Toronto, Canada',
      avatar: '/images/avatar5.jpg'
    }
  ];

  // Mock community events
  const events = [
    {
      id: '1',
      title: 'Python Coding Challenge',
      description: 'Join our monthly Python coding challenge and compete with other community members to solve algorithmic problems.',
      date: '2024-07-15T18:00:00Z',
      duration: 120,
      host: 'Alexandria',
      category: 'Coding Challenge',
      attendees: 28,
      isVirtual: true,
      link: 'https://meet.aeonwise.com/python-challenge'
    },
    {
      id: '2',
      title: 'Web Development Workshop',
      description: 'Learn modern web development techniques with React and Node.js in this hands-on workshop.',
      date: '2024-07-20T15:00:00Z',
      duration: 180,
      host: 'Marcus',
      category: 'Workshop',
      attendees: 42,
      isVirtual: true,
      link: 'https://meet.aeonwise.com/webdev-workshop'
    },
    {
      id: '3',
      title: 'UX Design Principles Webinar',
      description: 'Discover the fundamental principles of UX design and how to apply them to your projects.',
      date: '2024-07-25T17:00:00Z',
      duration: 90,
      host: 'Sophia',
      category: 'Webinar',
      attendees: 35,
      isVirtual: true,
      link: 'https://meet.aeonwise.com/ux-webinar'
    }
  ];

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'cosmic_sage': return 'text-cosmic-gold-400';
      case 'galactic_guide': return 'text-cosmic-purple-400';
      case 'comet_crafter': return 'text-cosmic-blue-400';
      case 'astral_apprentice': return 'text-cosmic-purple-300';
      case 'nebula_novice': return 'text-cosmic-blue-300';
      default: return 'text-gray-400';
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;
  };

  return (
    <div className={`pt-24 pb-20 px-4 ${className}`}>
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-display mb-4">Community Hub</h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Connect with fellow learners, share knowledge, and participate in community events
            </p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex bg-cosmic-black/50 backdrop-blur-sm rounded-lg p-1 border border-cosmic-purple-700/30">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'discussions'
                  ? 'bg-cosmic-purple-600 text-white'
                  : 'bg-transparent text-white/70 hover:text-white'
              }`}
              onClick={() => setActiveTab('discussions')}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Discussions</span>
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'members'
                  ? 'bg-cosmic-purple-600 text-white'
                  : 'bg-transparent text-white/70 hover:text-white'
              }`}
              onClick={() => setActiveTab('members')}
            >
              <Users className="h-4 w-4" />
              <span>Members</span>
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'events'
                  ? 'bg-cosmic-purple-600 text-white'
                  : 'bg-transparent text-white/70 hover:text-white'
              }`}
              onClick={() => setActiveTab('events')}
            >
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <EnhancedSearch
            placeholder={
              activeTab === 'discussions' ? "Search discussions..." :
              activeTab === 'members' ? "Search community members..." :
              "Search community events..."
            }
          />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {activeTab === 'discussions' && (
            <DiscussionForum />
          )}

          {activeTab === 'members' && (
            <div className="cosmos-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display">Community Members</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filter === 'all'
                        ? 'bg-cosmic-purple-600 text-white'
                        : 'bg-cosmic-black/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('trending')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filter === 'trending'
                        ? 'bg-cosmic-purple-600 text-white'
                        : 'bg-cosmic-black/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    Top Contributors
                  </button>
                  <button
                    onClick={() => setFilter('recent')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filter === 'recent'
                        ? 'bg-cosmic-purple-600 text-white'
                        : 'bg-cosmic-black/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    New Members
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-cosmic-black/30 rounded-lg p-4 hover:bg-cosmic-black/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-medium">{member.username}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs ${getRankColor(member.rank)}`}>
                            {member.rank.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-400">{member.points} points</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-400 mb-3">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Joined {new Date(member.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                    
                    {member.location && (
                      <div className="flex items-center text-xs text-gray-400 mb-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{member.location}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {member.skills.map((skill, index) => (
                        <span key={index} className="text-xs bg-cosmic-purple-900/30 text-cosmic-purple-100 px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <button className="w-full btn-secondary text-xs py-1">
                      View Profile
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="cosmos-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display">Upcoming Events</h2>
                <button className="btn-primary text-sm flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>View Calendar</span>
                </button>
              </div>

              <div className="space-y-6">
                {events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-cosmic-black/30 rounded-lg p-6 hover:bg-cosmic-black/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-2">{event.title}</h3>
                        <p className="text-gray-400 text-sm mb-4">{event.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-gray-300">
                            <Calendar className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                            {formatEventDate(event.date)}
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Clock className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                            {formatDuration(event.duration)}
                          </div>
                          <div className="flex items-center text-gray-300">
                            <User className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                            Hosted by {event.host}
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Users className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                            {event.attendees} attending
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-cosmic-purple-900/30 px-3 py-1 rounded-full text-xs text-cosmic-purple-100">
                        {event.category}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button className="btn-primary flex-1 text-sm flex items-center justify-center space-x-2">
                        <span>Join Event</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-cosmic-gold-400 transition-colors">
                        <Bookmark className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-cosmic-blue-400 transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};