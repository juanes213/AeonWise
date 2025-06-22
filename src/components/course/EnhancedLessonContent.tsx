import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, FileText, Headphones, Download, Bookmark, Share2, 
  MessageCircle, ThumbsUp, Eye, ChevronDown, ChevronUp, 
  Lightbulb, Target, CheckSquare, Play, Pause, Volume2,
  Code, List, Hash, Quote
} from 'lucide-react';
import { marked } from 'marked';
import { audioService } from '../../services/audioService';

interface EnhancedLessonContentProps {
  lesson: {
    id: string;
    title: string;
    content: string;
    objectives: string[];
    keyPoints: string[];
    estimatedTime: number;
    difficulty: string;
    exercise?: {
      description: string;
      hints: string[];
    };
  };
  onBookmark?: () => void;
  onShare?: () => void;
  isBookmarked?: boolean;
}

interface ContentSection {
  id: string;
  type: 'heading' | 'paragraph' | 'code' | 'list' | 'quote';
  content: string;
  level?: number;
  audioUrl?: string;
  isPlaying?: boolean;
}

export const EnhancedLessonContent: React.FC<EnhancedLessonContentProps> = ({
  lesson,
  onBookmark,
  onShare,
  isBookmarked = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    objectives: true,
    keyPoints: true,
    content: true,
    exercise: true
  });
  const [readingProgress, setReadingProgress] = useState(0);
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [playingSection, setPlayingSection] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    parseContentIntoSections();
  }, [lesson.content]);

  const parseContentIntoSections = () => {
    const lines = lesson.content.split('\n');
    const sections: ContentSection[] = [];
    let currentSection = '';
    let sectionId = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('#')) {
        // Save previous section if exists
        if (currentSection.trim()) {
          sections.push({
            id: `section-${sectionId++}`,
            type: 'paragraph',
            content: currentSection.trim()
          });
          currentSection = '';
        }
        
        // Add heading
        const level = (trimmedLine.match(/^#+/) || [''])[0].length;
        sections.push({
          id: `section-${sectionId++}`,
          type: 'heading',
          content: trimmedLine.replace(/^#+\s*/, ''),
          level
        });
      } else if (trimmedLine.startsWith('```')) {
        // Save previous section if exists
        if (currentSection.trim()) {
          sections.push({
            id: `section-${sectionId++}`,
            type: 'paragraph',
            content: currentSection.trim()
          });
          currentSection = '';
        }
        
        // Find end of code block
        let codeContent = '';
        let i = index + 1;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeContent += lines[i] + '\n';
          i++;
        }
        
        sections.push({
          id: `section-${sectionId++}`,
          type: 'code',
          content: codeContent.trim()
        });
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*') || /^\d+\./.test(trimmedLine)) {
        // Save previous section if exists
        if (currentSection.trim()) {
          sections.push({
            id: `section-${sectionId++}`,
            type: 'paragraph',
            content: currentSection.trim()
          });
          currentSection = '';
        }
        
        // Collect list items
        let listContent = trimmedLine + '\n';
        let j = index + 1;
        while (j < lines.length && (lines[j].trim().startsWith('-') || lines[j].trim().startsWith('*') || /^\d+\./.test(lines[j].trim()))) {
          listContent += lines[j].trim() + '\n';
          j++;
        }
        
        sections.push({
          id: `section-${sectionId++}`,
          type: 'list',
          content: listContent.trim()
        });
      } else if (trimmedLine.startsWith('>')) {
        // Save previous section if exists
        if (currentSection.trim()) {
          sections.push({
            id: `section-${sectionId++}`,
            type: 'paragraph',
            content: currentSection.trim()
          });
          currentSection = '';
        }
        
        sections.push({
          id: `section-${sectionId++}`,
          type: 'quote',
          content: trimmedLine.replace(/^>\s*/, '')
        });
      } else if (trimmedLine) {
        currentSection += line + '\n';
      }
    });

    // Add final section if exists
    if (currentSection.trim()) {
      sections.push({
        id: `section-${sectionId++}`,
        type: 'paragraph',
        content: currentSection.trim()
      });
    }

    setContentSections(sections);
  };

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

  const playAudioForSection = async (section: ContentSection) => {
    if (playingSection === section.id) {
      audioService.stopAudio();
      setPlayingSection(null);
      return;
    }

    setAudioLoading(prev => ({ ...prev, [section.id]: true }));
    
    try {
      let audioUrl = section.audioUrl;
      
      if (!audioUrl) {
        const sectionType = section.type === 'heading' ? 'content' : 
                           section.type === 'list' ? 'keypoint' : 'content';
        audioUrl = await audioService.generateSectionAudio(section.content, sectionType);
        
        if (audioUrl) {
          // Update section with audio URL
          setContentSections(prev => 
            prev.map(s => s.id === section.id ? { ...s, audioUrl } : s)
          );
        }
      }

      if (audioUrl) {
        setPlayingSection(section.id);
        await audioService.playAudio(audioUrl);
        setPlayingSection(null);
      }
    } catch (error) {
      console.error('Error playing section audio:', error);
    } finally {
      setAudioLoading(prev => ({ ...prev, [section.id]: false }));
    }
  };

  const playAudioForList = async (items: string[], type: 'objective' | 'keypoint') => {
    for (const item of items) {
      try {
        const audioUrl = await audioService.generateSectionAudio(item, type);
        if (audioUrl) {
          await audioService.playAudio(audioUrl);
        }
      } catch (error) {
        console.error('Error playing list item audio:', error);
      }
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'heading': return <Hash className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      case 'list': return <List className="h-4 w-4" />;
      case 'quote': return <Quote className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderContentSection = (section: ContentSection) => {
    const isPlaying = playingSection === section.id;
    const isLoading = audioLoading[section.id];

    return (
      <motion.div
        key={section.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getSectionIcon(section.type)}
          </div>
          
          <div className="flex-1">
            {section.type === 'heading' ? (
              <h3 className={`font-display mb-3 ${
                section.level === 1 ? 'text-2xl' :
                section.level === 2 ? 'text-xl' :
                section.level === 3 ? 'text-lg' : 'text-base'
              }`}>
                {section.content}
              </h3>
            ) : section.type === 'code' ? (
              <div className="bg-cosmic-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-gray-300">{section.content}</pre>
              </div>
            ) : section.type === 'list' ? (
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: marked(section.content) }}
              />
            ) : section.type === 'quote' ? (
              <blockquote className="border-l-4 border-cosmic-gold-400 pl-4 italic text-gray-300">
                {section.content}
              </blockquote>
            ) : (
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: marked(section.content) }}
              />
            )}
          </div>
          
          <button
            onClick={() => playAudioForSection(section)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-cosmic-purple-400"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cosmic-purple-400"></div>
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </motion.div>
    );
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
              <div className="flex items-center space-x-1">
                <Headphones className="h-4 w-4" />
                <span>Audio Available</span>
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudioForList(lesson.objectives, 'objective');
                  }}
                  className="p-1 text-gray-400 hover:text-cosmic-purple-400 transition-colors"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
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
                <div className="space-y-3">
                  {lesson.objectives.map((objective, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 group"
                    >
                      <CheckSquare className="h-4 w-4 text-cosmic-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 flex-1">{objective}</span>
                      <button
                        onClick={() => audioService.generateSectionAudio(objective, 'objective')}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-cosmic-purple-400"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudioForList(lesson.keyPoints, 'keypoint');
                  }}
                  className="p-1 text-gray-400 hover:text-cosmic-purple-400 transition-colors"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
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
                      className="bg-cosmic-purple-900/20 rounded-lg p-3 border border-cosmic-purple-700/30 group"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-sm text-gray-300 flex-1">{point}</span>
                        <button
                          onClick={() => audioService.generateSectionAudio(point, 'keypoint')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-cosmic-purple-400"
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      </div>
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
                <div className="space-y-6">
                  {contentSections.map(renderContentSection)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Exercise Section */}
        {lesson.exercise && (
          <div>
            <button
              onClick={() => toggleSection('exercise')}
              className="w-full p-6 text-left hover:bg-cosmic-black/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Code className="h-5 w-5 text-cosmic-gold-400" />
                  <h3 className="text-lg font-display">Practice Exercise</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      audioService.generateSectionAudio(lesson.exercise!.description, 'exercise');
                    }}
                    className="p-1 text-gray-400 hover:text-cosmic-purple-400 transition-colors"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
                {expandedSections.exercise ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>
            
            <AnimatePresence>
              {expandedSections.exercise && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6"
                >
                  <div className="space-y-4">
                    <div className="bg-cosmic-blue-900/20 rounded-lg p-4">
                      <p className="text-gray-300">{lesson.exercise.description}</p>
                    </div>
                    
                    {lesson.exercise.hints && lesson.exercise.hints.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-cosmic-blue-300 flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Hints:
                        </h4>
                        <div className="space-y-2">
                          {lesson.exercise.hints.map((hint, index) => (
                            <div key={index} className="flex items-start space-x-3 group">
                              <span className="text-cosmic-blue-400 mr-2">•</span>
                              <span className="text-sm text-gray-300 flex-1">{hint}</span>
                              <button
                                onClick={() => audioService.generateSectionAudio(hint, 'hint')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-cosmic-purple-400"
                              >
                                <Volume2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
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