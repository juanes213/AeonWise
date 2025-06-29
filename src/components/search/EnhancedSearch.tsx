import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, X, BookOpen, Users, Award, 
  Clock, Star, MapPin, DollarSign, Sparkles,
  TrendingUp, History
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface SearchResult {
  id: string;
  type: 'course' | 'mentor' | 'user' | 'skill';
  title: string;
  description: string;
  metadata: Record<string, any>;
  relevanceScore: number;
}

interface SearchFilters {
  type: 'all' | 'courses' | 'mentors' | 'users' | 'skills';
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  priceRange?: [number, number];
  rating?: number;
  availability?: string;
}

interface EnhancedSearchProps {
  placeholder?: string;
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  placeholder = "Search courses, mentors, skills...",
  onResultSelect,
  className = ''
}) => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({ type: 'all' });
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches] = useState([
    'Python Programming',
    'Web Development',
    'Machine Learning',
    'UI/UX Design',
    'Data Science',
    'React',
    'JavaScript',
    'Digital Marketing'
  ]);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock search function
  const performSearch = async (searchQuery: string, searchFilters: SearchFilters) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'course',
        title: 'Python Programming Fundamentals',
        description: 'Learn the core concepts of Python programming from variables to functions',
        metadata: {
          level: 'beginner',
          duration: 5,
          modules: 8,
          category: 'Programming',
          rating: 4.8,
          students: 1247
        },
        relevanceScore: 0.95
      },
      {
        id: '2',
        type: 'mentor',
        title: 'Dr. Sarah Chen',
        description: 'Senior Software Engineer with 8+ years experience in React, Node.js, and cloud architecture',
        metadata: {
          specialty: 'Full-Stack Development',
          price: 75,
          rating: 4.9,
          availability: 'Mon-Fri, 9AM-6PM EST',
          sessionLength: 60
        },
        relevanceScore: 0.87
      },
      {
        id: '3',
        type: 'user',
        title: 'Alex Rodriguez',
        description: 'UI/UX Designer passionate about creating intuitive user experiences',
        metadata: {
          skills: ['UI/UX Design', 'Figma', 'User Research'],
          learningGoals: ['React', 'Frontend Development'],
          rank: 'comet_crafter',
          points: 850
        },
        relevanceScore: 0.82
      },
      {
        id: '4',
        type: 'skill',
        title: 'Machine Learning',
        description: 'AI and machine learning concepts, algorithms, and applications',
        metadata: {
          category: 'Technology',
          popularity: 'High',
          relatedSkills: ['Python', 'Data Science', 'Statistics'],
          courses: 12,
          mentors: 8
        },
        relevanceScore: 0.78
      }
    ];

    // Filter results based on search filters
    let filteredResults = mockResults;
    
    if (searchFilters.type !== 'all') {
      filteredResults = filteredResults.filter(result => {
        if (searchFilters.type === 'courses') return result.type === 'course';
        if (searchFilters.type === 'mentors') return result.type === 'mentor';
        if (searchFilters.type === 'users') return result.type === 'user';
        if (searchFilters.type === 'skills') return result.type === 'skill';
        return true;
      });
    }

    if (searchFilters.level) {
      filteredResults = filteredResults.filter(result => 
        result.metadata.level === searchFilters.level
      );
    }

    if (searchFilters.rating) {
      filteredResults = filteredResults.filter(result => 
        result.metadata.rating >= searchFilters.rating!
      );
    }

    // Sort by relevance score
    filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    setResults(filteredResults);
    setIsLoading(false);
  };

  useEffect(() => {
    if (query.length > 2) {
      performSearch(query, filters);
    } else {
      setResults([]);
    }
  }, [query, filters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsOpen(true);
    
    // Add to recent searches
    if (searchQuery.length > 2 && !recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result);
    setIsOpen(false);
    
    toast({
      title: 'Result Selected',
      description: `Selected ${result.title}`,
    });
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-5 w-5 text-cosmic-blue-400" />;
      case 'mentor':
        return <Users className="h-5 w-5 text-cosmic-purple-400" />;
      case 'user':
        return <Users className="h-5 w-5 text-cosmic-gold-400" />;
      case 'skill':
        return <Award className="h-5 w-5 text-cosmic-green-400" />;
      default:
        return <Search className="h-5 w-5 text-gray-400" />;
    }
  };

  const getResultMetadata = (result: SearchResult) => {
    switch (result.type) {
      case 'course':
        return (
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {result.metadata.duration}h
            </span>
            <span className="flex items-center">
              <Star className="h-3 w-3 mr-1" />
              {result.metadata.rating}
            </span>
            <span>{result.metadata.students} students</span>
          </div>
        );
      case 'mentor':
        return (
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <span className="flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              ${result.metadata.price}/session
            </span>
            <span className="flex items-center">
              <Star className="h-3 w-3 mr-1" />
              {result.metadata.rating}
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {result.metadata.sessionLength}min
            </span>
          </div>
        );
      case 'user':
        return (
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <span className="capitalize">{result.metadata.rank?.replace('_', ' ')}</span>
            <span>{result.metadata.points} points</span>
            <span>{result.metadata.skills?.length} skills</span>
          </div>
        );
      case 'skill':
        return (
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <span>{result.metadata.courses} courses</span>
            <span>{result.metadata.mentors} mentors</span>
            <span className="capitalize">{result.metadata.popularity} popularity</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {query && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`text-gray-400 hover:text-white transition-colors ${
              showFilters ? 'text-cosmic-purple-400' : ''
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-cosmic-black/95 backdrop-blur-sm border border-cosmic-purple-700/30 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
          >
            {/* Filters */}
            {showFilters && (
              <div className="p-4 border-b border-cosmic-purple-700/30 bg-cosmic-black/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-3 py-1 text-sm text-white"
                    >
                      <option value="all">All</option>
                      <option value="courses">Courses</option>
                      <option value="mentors">Mentors</option>
                      <option value="users">Users</option>
                      <option value="skills">Skills</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Level</label>
                    <select
                      value={filters.level || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value as any || undefined }))}
                      className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-3 py-1 text-sm text-white"
                    >
                      <option value="">Any Level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto">
              {query.length <= 2 ? (
                <div className="p-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <History className="h-4 w-4 mr-2" />
                        Recent Searches
                      </h4>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(search)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-cosmic-purple-900/20 rounded-md transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Searches */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Trending
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((trend, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(trend)}
                          className="px-3 py-1 bg-cosmic-purple-900/30 text-cosmic-purple-100 rounded-full text-xs hover:bg-cosmic-purple-900/50 transition-colors"
                        >
                          {trend}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Searching...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No results found for "{query}"</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="p-2">
                  {results.map((result) => (
                    <motion.button
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleResultClick(result)}
                      className="w-full p-3 text-left hover:bg-cosmic-purple-900/20 rounded-lg transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white truncate">
                              {result.title}
                            </h4>
                            <span className="text-xs text-gray-500 capitalize ml-2">
                              {result.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {result.description}
                          </p>
                          <div className="mt-2">
                            {getResultMetadata(result)}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="p-3 border-t border-cosmic-purple-700/30 bg-cosmic-black/50">
                <button
                  onClick={() => {
                    console.log('View all results for:', query);
                    setIsOpen(false);
                  }}
                  className="w-full text-center text-sm text-cosmic-blue-400 hover:text-cosmic-blue-300 transition-colors"
                >
                  View all {results.length} results
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};