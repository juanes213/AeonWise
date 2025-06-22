import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, BookOpen, CheckCircle, 
  Clock, Play, Lock, Star, Trophy
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  estimatedTime: number;
  completed?: boolean;
  locked?: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CourseNavigationProps {
  lessons: Lesson[];
  currentLessonIndex: number;
  onLessonSelect: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  courseProgress: number;
}

export const CourseNavigation: React.FC<CourseNavigationProps> = ({
  lessons,
  currentLessonIndex,
  onLessonSelect,
  onPrevious,
  onNext,
  canGoNext,
  canGoPrevious,
  courseProgress
}) => {
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Star className="h-3 w-3 text-green-400" />;
      case 'medium': return <Star className="h-3 w-3 text-yellow-400" />;
      case 'hard': return <Trophy className="h-3 w-3 text-red-400" />;
      default: return <Star className="h-3 w-3 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'border-green-400/30 bg-green-900/10';
      case 'medium': return 'border-yellow-400/30 bg-yellow-900/10';
      case 'hard': return 'border-red-400/30 bg-red-900/10';
      default: return 'border-gray-400/30 bg-gray-900/10';
    }
  };

  return (
    <div className="cosmos-card p-6">
      {/* Course Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-display flex items-center">
            <BookOpen className="h-5 w-5 text-cosmic-gold-400 mr-2" />
            Course Progress
          </h3>
          <span className="text-sm text-cosmic-gold-400 font-medium">
            {Math.round(courseProgress)}% Complete
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-cosmic-black/50 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-cosmic-purple-500 to-cosmic-gold-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${courseProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>
        
        <div className="text-center">
          <span className="text-sm text-gray-400">
            Lesson {currentLessonIndex + 1} of {lessons.length}
          </span>
        </div>
        
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Lesson List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {lessons.map((lesson, index) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
              index === currentLessonIndex
                ? 'border-cosmic-purple-500 bg-cosmic-purple-900/20 shadow-lg'
                : lesson.completed
                ? 'border-green-500/30 bg-green-900/10 hover:bg-green-900/20'
                : lesson.locked
                ? 'border-gray-600/30 bg-gray-900/10 opacity-50 cursor-not-allowed'
                : `${getDifficultyColor(lesson.difficulty)} hover:border-cosmic-purple-400/50`
            }`}
            onClick={() => !lesson.locked && onLessonSelect(index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cosmic-black/30">
                  {lesson.locked ? (
                    <Lock className="h-4 w-4 text-gray-400" />
                  ) : lesson.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : index === currentLessonIndex ? (
                    <Play className="h-4 w-4 text-cosmic-purple-400" />
                  ) : (
                    <span className="text-sm font-medium text-gray-400">
                      {index + 1}
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-medium text-sm ${
                    index === currentLessonIndex ? 'text-cosmic-purple-300' :
                    lesson.completed ? 'text-green-300' :
                    lesson.locked ? 'text-gray-500' : 'text-white'
                  }`}>
                    {lesson.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{lesson.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getDifficultyIcon(lesson.difficulty)}
                      <span className="text-xs text-gray-400 capitalize">
                        {lesson.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {index === currentLessonIndex && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-cosmic-purple-400 rounded-full"
                />
              )}
            </div>
            
            {/* Progress indicator for current lesson */}
            {index === currentLessonIndex && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cosmic-purple-500 to-cosmic-gold-500 rounded-b-lg"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Course Stats */}
      <div className="mt-6 pt-4 border-t border-cosmic-purple-700/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-cosmic-gold-400">
              {lessons.filter(l => l.completed).length}
            </div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-cosmic-purple-400">
              {lessons.length - lessons.filter(l => l.completed).length}
            </div>
            <div className="text-xs text-gray-400">Remaining</div>
          </div>
          <div>
            <div className="text-lg font-bold text-cosmic-blue-400">
              {lessons.reduce((total, lesson) => total + lesson.estimatedTime, 0)}
            </div>
            <div className="text-xs text-gray-400">Total Minutes</div>
          </div>
        </div>
      </div>
    </div>
  );
};