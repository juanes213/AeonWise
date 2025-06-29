import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, Check, CheckCheck, Trash2, Settings, 
  Trophy, BookOpen, Users, MessageCircle, Star,
  Calendar, Gift, AlertCircle
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface Notification {
  id: string;
  type: 'achievement' | 'course' | 'match' | 'message' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'achievement' | 'course' | 'match'>('all');

  // Mock notifications for demo
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'achievement',
        title: 'Rank Up! 🎉',
        message: 'Congratulations! You\'ve reached Astral Apprentice rank with 520 points!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        metadata: { points: 520, newRank: 'astral_apprentice' }
      },
      {
        id: '2',
        type: 'course',
        title: 'Lesson Completed',
        message: 'You completed "Variables and Data Types" in Python Programming Fundamentals',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        actionUrl: '/courses/python-basics/variables',
        metadata: { courseId: 'python-basics', lessonId: 'variables' }
      },
      {
        id: '3',
        type: 'match',
        title: 'New Skill Match',
        message: 'Sarah Chen wants to learn Python and can teach you UI/UX Design',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true,
        actionUrl: '/skill-swap',
        metadata: { matchId: 'match-123', matchScore: 9 }
      },
      {
        id: '4',
        type: 'message',
        title: 'Mentor Session Reminder',
        message: 'Your session with Alex Johnson starts in 1 hour',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        read: true,
        actionUrl: '/mentorship',
        metadata: { mentorId: 'alex-johnson', sessionTime: '2024-01-15T15:00:00Z' }
      },
      {
        id: '5',
        type: 'system',
        title: 'Welcome to AeonWise!',
        message: 'Complete your profile to unlock all features and start your learning journey',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        actionUrl: '/profile'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-5 w-5 text-cosmic-gold-400" />;
      case 'course':
        return <BookOpen className="h-5 w-5 text-cosmic-blue-400" />;
      case 'match':
        return <Users className="h-5 w-5 text-cosmic-purple-400" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-cosmic-green-400" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-cosmic-gold-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'achievement':
        return 'border-cosmic-gold-400/30 bg-cosmic-gold-900/10';
      case 'course':
        return 'border-cosmic-blue-400/30 bg-cosmic-blue-900/10';
      case 'match':
        return 'border-cosmic-purple-400/30 bg-cosmic-purple-900/10';
      case 'message':
        return 'border-cosmic-green-400/30 bg-cosmic-green-900/10';
      case 'system':
        return 'border-cosmic-gold-400/30 bg-cosmic-gold-900/10';
      default:
        return 'border-gray-400/30 bg-gray-900/10';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: 'All notifications marked as read',
      description: 'Your notification center has been cleared',
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: 'Notification deleted',
      description: 'The notification has been removed',
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // In a real app, you'd use router navigation here
      console.log('Navigate to:', notification.actionUrl);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-cosmic-gold-500 text-cosmic-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 max-h-[600px] bg-cosmic-black/95 backdrop-blur-sm border border-cosmic-purple-700/30 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-cosmic-purple-700/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-lg">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-cosmic-blue-400 hover:text-cosmic-blue-300"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-1 bg-cosmic-black/50 rounded-lg p-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'unread', label: 'Unread' },
                    { id: 'achievement', label: 'Achievements' },
                    { id: 'course', label: 'Courses' },
                    { id: 'match', label: 'Matches' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilter(tab.id as any)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        filter === tab.id
                          ? 'bg-cosmic-purple-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications</p>
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`relative p-3 rounded-lg border cursor-pointer transition-all hover:bg-cosmic-black/30 ${
                          !notification.read 
                            ? `${getNotificationColor(notification.type)} border-l-4` 
                            : 'border-gray-700/30 bg-gray-900/10'
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className={`text-sm font-medium ${
                                !notification.read ? 'text-white' : 'text-gray-300'
                              }`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-1 ml-2">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="text-gray-500 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            
                            <p className={`text-sm mt-1 ${
                              !notification.read ? 'text-gray-300' : 'text-gray-400'
                            }`}>
                              {notification.message}
                            </p>

                            {/* Metadata Display */}
                            {notification.metadata && (
                              <div className="mt-2 text-xs text-gray-500">
                                {notification.type === 'achievement' && notification.metadata.points && (
                                  <span className="bg-cosmic-gold-900/30 text-cosmic-gold-300 px-2 py-1 rounded">
                                    +{notification.metadata.points} points
                                  </span>
                                )}
                                {notification.type === 'match' && notification.metadata.matchScore && (
                                  <span className="bg-cosmic-purple-900/30 text-cosmic-purple-300 px-2 py-1 rounded">
                                    {notification.metadata.matchScore}/10 match
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-cosmic-blue-400 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {filteredNotifications.length > 0 && (
                <div className="p-3 border-t border-cosmic-purple-700/30 bg-cosmic-black/50">
                  <button
                    onClick={() => {
                      // In a real app, navigate to full notifications page
                      console.log('View all notifications');
                      setIsOpen(false);
                    }}
                    className="w-full text-center text-sm text-cosmic-blue-400 hover:text-cosmic-blue-300 transition-colors"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};