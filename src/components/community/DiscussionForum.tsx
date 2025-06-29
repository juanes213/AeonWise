import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Plus, ThumbsUp, ThumbsDown, Reply, 
  Pin, Flag, Search, Filter, Clock, User, Tag,
  TrendingUp, BookOpen, Users, Award, Eye
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useUser } from '../../contexts/UserContext';

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    rank: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  replies: number;
  views: number;
  likes: number;
  dislikes: number;
  isPinned: boolean;
  isLocked: boolean;
}

interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    rank: string;
    avatar?: string;
  };
  createdAt: Date;
  likes: number;
  dislikes: number;
  parentId?: string;
}

interface DiscussionForumProps {
  courseId?: string;
  lessonId?: string;
  className?: string;
}

export const DiscussionForum: React.FC<DiscussionForumProps> = ({
  courseId,
  lessonId,
  className = ''
}) => {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent' | 'unanswered'>('all');
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [] as string[]
  });
  const [newReply, setNewReply] = useState('');
  const [newTag, setNewTag] = useState('');

  const categories = [
    { id: 'all', label: 'All Categories', icon: MessageCircle },
    { id: 'general', label: 'General Discussion', icon: MessageCircle },
    { id: 'course', label: 'Course Help', icon: BookOpen },
    { id: 'projects', label: 'Project Showcase', icon: Award },
    { id: 'career', label: 'Career Advice', icon: TrendingUp },
    { id: 'technical', label: 'Technical Questions', icon: Users }
  ];

  // Mock discussions data
  useEffect(() => {
    const mockDiscussions: Discussion[] = [
      {
        id: '1',
        title: 'Best practices for Python variable naming?',
        content: 'I\'m new to Python and wondering about the best practices for naming variables. Should I use camelCase or snake_case?',
        author: {
          id: 'user1',
          username: 'PythonNewbie',
          rank: 'starspark'
        },
        category: 'course',
        tags: ['python', 'best-practices', 'variables'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30),
        replies: 8,
        views: 45,
        likes: 12,
        dislikes: 1,
        isPinned: false,
        isLocked: false
      },
      {
        id: '2',
        title: 'Showcase: My first web app built with React!',
        content: 'Just finished my first React project - a todo app with local storage. Would love to get feedback from the community!',
        author: {
          id: 'user2',
          username: 'ReactEnthusiast',
          rank: 'nebula_novice'
        },
        category: 'projects',
        tags: ['react', 'javascript', 'showcase', 'beginner'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
        replies: 15,
        views: 89,
        likes: 23,
        dislikes: 0,
        isPinned: true,
        isLocked: false
      },
      {
        id: '3',
        title: 'How to transition from frontend to full-stack development?',
        content: 'I\'ve been doing frontend development for 2 years and want to learn backend. What technologies should I focus on?',
        author: {
          id: 'user3',
          username: 'FrontendDev',
          rank: 'astral_apprentice'
        },
        category: 'career',
        tags: ['career', 'fullstack', 'backend', 'advice'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        replies: 22,
        views: 156,
        likes: 34,
        dislikes: 2,
        isPinned: false,
        isLocked: false
      }
    ];

    setDiscussions(mockDiscussions);
  }, []);

  const createDiscussion = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to create a discussion',
        variant: 'destructive',
      });
      return;
    }

    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both title and content',
        variant: 'destructive',
      });
      return;
    }

    const discussion: Discussion = {
      id: Date.now().toString(),
      title: newDiscussion.title,
      content: newDiscussion.content,
      author: {
        id: user.id,
        username: user.username,
        rank: user.rank || 'starspark'
      },
      category: newDiscussion.category,
      tags: newDiscussion.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: 0,
      views: 0,
      likes: 0,
      dislikes: 0,
      isPinned: false,
      isLocked: false
    };

    setDiscussions(prev => [discussion, ...prev]);
    setNewDiscussion({ title: '', content: '', category: 'general', tags: [] });
    setShowNewDiscussion(false);

    toast({
      title: 'Discussion created!',
      description: 'Your discussion has been posted to the community',
    });
  };

  const addReply = () => {
    if (!user || !selectedDiscussion) return;

    if (!newReply.trim()) {
      toast({
        title: 'Empty reply',
        description: 'Please write a reply before posting',
        variant: 'destructive',
      });
      return;
    }

    const reply: Reply = {
      id: Date.now().toString(),
      content: newReply,
      author: {
        id: user.id,
        username: user.username,
        rank: user.rank || 'starspark'
      },
      createdAt: new Date(),
      likes: 0,
      dislikes: 0
    };

    setReplies(prev => [...prev, reply]);
    setNewReply('');

    // Update discussion reply count
    setDiscussions(prev => prev.map(d => 
      d.id === selectedDiscussion.id 
        ? { ...d, replies: d.replies + 1, updatedAt: new Date() }
        : d
    ));

    toast({
      title: 'Reply posted!',
      description: 'Your reply has been added to the discussion',
    });
  };

  const addTag = () => {
    if (newTag.trim() && !newDiscussion.tags.includes(newTag.trim())) {
      setNewDiscussion(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setNewDiscussion(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

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

  const filteredDiscussions = discussions.filter(discussion => {
    if (category !== 'all' && discussion.category !== category) return false;
    if (searchQuery && !discussion.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (selectedDiscussion) {
    return (
      <div className={`cosmos-card p-0 ${className}`}>
        {/* Discussion Header */}
        <div className="p-6 border-b border-cosmic-purple-700/30">
          <button
            onClick={() => setSelectedDiscussion(null)}
            className="text-cosmic-blue-400 hover:text-cosmic-blue-300 mb-4 text-sm"
          >
            ← Back to discussions
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-display mb-2">{selectedDiscussion.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className={getRankColor(selectedDiscussion.author.rank)}>
                    {selectedDiscussion.author.username}
                  </span>
                </div>
                <span>{formatTimeAgo(selectedDiscussion.createdAt)}</span>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{selectedDiscussion.views} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{selectedDiscussion.replies} replies</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discussion Content */}
        <div className="p-6 border-b border-cosmic-purple-700/30">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">{selectedDiscussion.content}</p>
          </div>
          
          {selectedDiscussion.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedDiscussion.tags.map((tag, index) => (
                <span key={index} className="bg-cosmic-purple-900/30 text-cosmic-purple-100 px-2 py-1 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Replies */}
        <div className="p-6">
          <h3 className="font-display text-lg mb-4">Replies ({replies.length})</h3>
          
          {/* Reply Form */}
          {user && (
            <div className="mb-6 bg-cosmic-black/30 rounded-lg p-4">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Write your reply..."
                className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 min-h-[100px]"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={addReply}
                  className="btn-primary text-sm"
                >
                  Post Reply
                </button>
              </div>
            </div>
          )}

          {/* Replies List */}
          <div className="space-y-4">
            {replies.map((reply) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-cosmic-black/20 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${getRankColor(reply.author.rank)}`}>
                      {reply.author.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(reply.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-green-400 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-gray-500">{reply.likes}</span>
                  </div>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{reply.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`cosmos-card p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display">Community Discussions</h2>
        <button
          onClick={() => setShowNewDiscussion(true)}
          className="btn-primary text-sm flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions..."
              className="w-full pl-10 pr-4 py-2 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          {['all', 'trending', 'recent', 'unanswered'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as any)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === filterOption
                  ? 'bg-cosmic-purple-600 text-white'
                  : 'bg-cosmic-black/30 text-gray-400 hover:text-white'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* New Discussion Form */}
      <AnimatePresence>
        {showNewDiscussion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-cosmic-black/30 rounded-lg p-4"
          >
            <h3 className="font-display text-lg mb-4">Create New Discussion</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                value={newDiscussion.title}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Discussion title..."
                className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
              />
              
              <select
                value={newDiscussion.category}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              
              <textarea
                value={newDiscussion.content}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your discussion content..."
                className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 min-h-[120px]"
              />
              
              {/* Tags */}
              <div>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tags..."
                    className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                  />
                  <button
                    onClick={addTag}
                    className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-md px-4 py-2"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newDiscussion.tags.map((tag, index) => (
                    <span key={index} className="bg-cosmic-purple-900/30 text-cosmic-purple-100 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                      <span>#{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-cosmic-purple-300 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={createDiscussion}
                  className="btn-primary"
                >
                  Create Discussion
                </button>
                <button
                  onClick={() => setShowNewDiscussion(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discussions List */}
      <div className="space-y-3">
        {filteredDiscussions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No discussions found</p>
            <p className="text-sm">Be the first to start a conversation!</p>
          </div>
        ) : (
          filteredDiscussions.map((discussion) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cosmic-black/30 rounded-lg p-4 hover:bg-cosmic-black/50 transition-colors cursor-pointer"
              onClick={() => setSelectedDiscussion(discussion)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {discussion.isPinned && (
                      <Pin className="h-4 w-4 text-cosmic-gold-400" />
                    )}
                    <h3 className="font-medium text-white hover:text-cosmic-purple-300 transition-colors">
                      {discussion.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {discussion.content}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span className={getRankColor(discussion.author.rank)}>
                        {discussion.author.username}
                      </span>
                    </div>
                    <span>{formatTimeAgo(discussion.createdAt)}</span>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{discussion.replies}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{discussion.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{discussion.likes}</span>
                    </div>
                  </div>
                  
                  {discussion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {discussion.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-cosmic-purple-900/30 text-cosmic-purple-100 px-2 py-0.5 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                      {discussion.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{discussion.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 text-right">
                  <div className="capitalize">{discussion.category}</div>
                  <div>Updated {formatTimeAgo(discussion.updatedAt)}</div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};