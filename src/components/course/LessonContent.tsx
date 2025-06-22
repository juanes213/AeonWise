import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, FileText, Video, Headphones, Download, 
  Bookmark, Share2, MessageCircle, ThumbsUp, Eye,
  ChevronDown, ChevronUp, Lightbulb, Target, CheckSquare
} from 'lucide-react';
import { marked } from 'marked';

interface LessonContentProps {
  lesson: {
    id: string;
    title: string;
    content: string;
    objectives: string[];
    keyPoints: string[];
    estimatedTime: number;
    difficulty: string;
  };
  onBookmark?: () => void;
  onShare?: () => void;
  isBookmarked?: boolean;
}

export const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  onBookmark,
  onShare,
  isBookmarked = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    objectives: true,
    keyPoints: true,
    content: true
  });
  const [readingProgress, setReadingProgress] = useState(0);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setReadingProgress(Math.min(progress, 100));
  };

  return (
    <div className="cosmos-card overflow-hidden">
      {/* Header */}
      <div className="bg-cosmic-black/50 border-b border-cosmic-purple-700/30 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-display mb-2">{lesson.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <BookOpen className="h-4 w-4" />
                <span>{lesson.estimatedTime} min read</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span className="capitalize">{lesson.difficulty}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>1.2k views</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onBookmark}
              className={`p-2 rounded-md transition-colors ${
                isBookmarked 
                  ? 'text-cosmic-gold-400 bg-cosmic-gold-900/20' 
                  : 'text-gray-400 hover:text-cosmic-gold-400'
              }`}
              title={isBookmarked ? "Remove bookmark" : "Bookmark lesson"}
            >
              <Bookmark className="h-4 w-4" />
            </button>
            <button
              onClick={onShare}
              className="p-2 text-gray-400 hover:text-cosmic-blue-400 transition-colors"
              title="Share lesson"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-cosmic-purple-400 transition-colors">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Reading Progress */}
        <div className="w-full bg-cosmic-black/50 rounded-full h-1">
          <motion.div
            className="bg-gradient-to-r from-cosmic-purple-500 to-cosmic-gold-500 h-1 rounded-full"
            style={{ width: `${readingProgress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto" onScroll={handleScroll}>
        {/* Learning Objectives */}
        <div className="border-b border-cosmic-purple-700/30">
          <button
            onClick={() => toggleSection('objectives')}
            className="w-full p-6 text-left hover:bg-cosmic-black/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-cosmic-gold-400" />
                <h3 className="text-lg font-display">Learning Objectives</h3>
              </div>
              {expandedSections.objectives ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </button>
          
          <AnimatePresence>
            {expandedSections.objectives && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
              >
                <div className="space-y-2">
                  {lesson.objectives.map((objective, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <CheckSquare className="h-4 w-4 text-cosmic-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{objective}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Key Points */}
        <div className="border-b border-cosmic-purple-700/30">
          <button
            onClick={() => toggleSection('keyPoints')}
            className="w-full p-6 text-left hover:bg-cosmic-black/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lightbulb className="h-5 w-5 text-cosmic-gold-400" />
                <h3 className="text-lg font-display">Key Points</h3>
              </div>
              {expandedSections.keyPoints ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </button>
          
          <AnimatePresence>
            {expandedSections.keyPoints && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lesson.keyPoints.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-cosmic-purple-900/20 rounded-lg p-3 border border-cosmic-purple-700/30"
                    >
                      <span className="text-sm text-gray-300">{point}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content */}
        <div>
          <button
            onClick={() => toggleSection('content')}
            className="w-full p-6 text-left hover:bg-cosmic-black/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-cosmic-gold-400" />
                <h3 className="text-lg font-display">Lesson Content</h3>
              </div>
              {expandedSections.content ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </button>
          
          <AnimatePresence>
            {expandedSections.content && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
              >
                <div 
                  className="prose prose-invert max-w-none prose-purple"
                  dangerouslySetInnerHTML={{ __html: marked(lesson.content) }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-cosmic-purple-700/30 p-4 bg-cosmic-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-gray-400 hover:text-cosmic-purple-400 transition-colors">
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm">Helpful (24)</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-cosmic-blue-400 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">Discuss (8)</span>
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            Reading progress: {Math.round(readingProgress)}%
          </div>
        </div>
      </div>
    </div>
  );
};