import React, { useState, type FC, type UIEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, FileText, Headphones, Download, Bookmark, Share2,
  MessageCircle, ThumbsUp, Eye, ChevronDown, ChevronUp,
  Lightbulb, Target, CheckSquare, Play, Pause, Volume2,
  Code, List, Hash, Quote
} from 'lucide-react';
import { audioService } from '../../services/audioService';
import { AIQuestionAnswer } from './AIQuestionAnswer';

// Updated props for new lesson structure
interface LessonSection {
  heading: string;
  body: string;
  codeExamples?: { code: string; explanation?: string }[];
  images?: string[];
}
interface LessonExample {
  code: string;
  explanation: string;
}
interface LessonExercise {
  description: string;
  defaultCode: string;
  solution: string;
  testCases: { input: string; expectedOutput: string; description?: string }[];
  hints: string[];
}
interface EnhancedLessonContentProps {
  lesson: {
    id: string;
    title: string;
    sections: LessonSection[];
    keyPoints: string[];
    examples: LessonExample[];
    exercise: LessonExercise;
    estimatedTime: number;
    content?: string; // Fallback for old lesson structure
  };
  onBookmark?: () => void;
  onShare?: () => void;
  isBookmarked?: boolean;
}

type ExpandedSections = {
  sections: boolean;
  keyPoints: boolean;
  examples: boolean;
  exercise: boolean;
  aiAssistant: boolean;
};

type AudioLoading = Record<string, boolean>;

export const EnhancedLessonContent: FC<EnhancedLessonContentProps> = ({
  lesson,
  onBookmark,
  onShare,
  isBookmarked = false
}) => {
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    sections: true,
    keyPoints: true,
    examples: true,
    exercise: true,
    aiAssistant: false
  });
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [playingSection, setPlayingSection] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState<AudioLoading>({});

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections((prev: ExpandedSections) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setReadingProgress(Math.min(progress, 100));
  };

  // Audio for section headings/bodies
  const playAudioForSection = async (id: string, text: string) => {
    if (playingSection === id) {
      audioService.stopAudio();
      setPlayingSection(null);
      return;
    }
    setAudioLoading((prev: AudioLoading) => ({ ...prev, [id]: true }));
    try {
      const audioUrl = await audioService.generateSectionAudio(text, 'content');
      if (audioUrl) {
        setPlayingSection(id);
        await audioService.playAudio(audioUrl);
        setPlayingSection(null);
      }
    } catch (error) {
      console.error('Error playing section audio:', error);
    } finally {
      setAudioLoading((prev: AudioLoading) => ({ ...prev, [id]: false }));
    }
  };

  // Generate lesson context for AI assistant
  const generateLessonContext = () => {
    let context = `Lesson Title: ${lesson.title}\n\n`;
    
    if (lesson.sections && lesson.sections.length > 0) {
      context += 'Lesson Content:\n';
      lesson.sections.forEach((section, index) => {
        context += `${index + 1}. ${section.heading}\n${section.body}\n\n`;
      });
    } else if (lesson.content) {
      context += `Content: ${lesson.content}\n\n`;
    }
    
    if (lesson.keyPoints && lesson.keyPoints.length > 0) {
      context += 'Key Points:\n';
      lesson.keyPoints.forEach((point, index) => {
        context += `- ${point}\n`;
      });
      context += '\n';
    }
    
    if (lesson.examples && lesson.examples.length > 0) {
      context += 'Examples:\n';
      lesson.examples.forEach((example, index) => {
        context += `Example ${index + 1}: ${example.explanation}\nCode: ${example.code}\n\n`;
      });
    }
    
    context += `Exercise: ${lesson.exercise.description}\n`;
    
    return context;
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

      {/* Sections */}
      <div className="p-6">
        {/* AI Assistant */}
        <div className="mb-8">
          <AIQuestionAnswer
            lessonContext={generateLessonContext()}
            lessonTitle={lesson.title}
          />
        </div>

        {/* Lesson Sections */}
        <div className="mb-8">
          <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('sections')}>
            <h3 className="font-display text-lg">Lesson Content</h3>
            {expandedSections.sections ? <ChevronUp /> : <ChevronDown />}
          </div>
          <AnimatePresence>
            {expandedSections.sections && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-8"
              >
                {lesson.sections && lesson.sections.length > 0 ? (
                  lesson.sections.map((section, idx) => (
                    <div key={idx} className="mb-4">
                      <div className="flex items-center mb-2">
                        <Hash className="h-4 w-4 text-cosmic-purple-400 mr-2" />
                        <h4 className="font-semibold text-lg">{section.heading}</h4>
                        <button
                          onClick={() => playAudioForSection(`section-${idx}`, section.heading + '. ' + section.body)}
                          className="ml-2 text-gray-400 hover:text-cosmic-purple-400"
                          disabled={audioLoading[`section-${idx}`]}
                        >
                          {audioLoading[`section-${idx}`] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cosmic-purple-400"></div>
                          ) : playingSection === `section-${idx}` ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="mb-2 text-gray-200">{section.body}</div>
                      {section.codeExamples && section.codeExamples.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {section.codeExamples.map((ex, i) => (
                            <div key={i} className="bg-cosmic-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                              <pre className="text-gray-300 mb-1">{ex.code}</pre>
                              {ex.explanation && <div className="text-xs text-cosmic-gold-400">{ex.explanation}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : lesson.content ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gray-200 whitespace-pre-wrap">{lesson.content}</div>
                  </div>
                ) : (
                  <p className="text-gray-400">No content available for this lesson.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Key Points */}
        <div className="mb-8">
          <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('keyPoints')}>
            <h3 className="font-display text-lg">Key Points</h3>
            {expandedSections.keyPoints ? <ChevronUp /> : <ChevronDown />}
          </div>
          <AnimatePresence>
            {expandedSections.keyPoints && (
              <motion.ul
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="list-disc pl-6 space-y-2 text-cosmic-gold-200"
              >
                {lesson.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2 text-cosmic-gold-400" />
                    {point}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Examples */}
        {lesson.examples && lesson.examples.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('examples')}>
              <h3 className="font-display text-lg">Examples</h3>
              {expandedSections.examples ? <ChevronUp /> : <ChevronDown />}
            </div>
            <AnimatePresence>
              {expandedSections.examples && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-4"
                >
                  {lesson.examples.map((ex, idx) => (
                    <div key={idx} className="bg-cosmic-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-gray-300 mb-1">{ex.code}</pre>
                      <div className="text-xs text-cosmic-gold-400">{ex.explanation}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Exercise */}
        <div className="mb-8">
          <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('exercise')}>
            <h3 className="font-display text-lg">Exercise</h3>
            {expandedSections.exercise ? <ChevronUp /> : <ChevronDown />}
          </div>
          <AnimatePresence>
            {expandedSections.exercise && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-4"
              >
                <div className="mb-2 text-gray-200">{lesson.exercise.description}</div>
                <div className="text-xs text-gray-400">(Interactive code editor is available in the exercise section)</div>
                <div className="mt-2">
                  <div className="font-semibold mb-1">Hints:</div>
                  <ul className="list-disc pl-6 text-cosmic-gold-200">
                    {lesson.exercise.hints.map((hint, idx) => (
                      <li key={idx}>{hint}</li>
                    ))}
                  </ul>
                </div>
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