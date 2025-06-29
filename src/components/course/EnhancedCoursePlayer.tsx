import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Settings, MoreVertical, Award, Clock, 
  Users, Star, BookmarkPlus, Share2, Download, Headphones,
  CheckCircle, Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InteractiveCodeEditor } from './InteractiveCodeEditor';
import { CourseNavigation } from './CourseNavigation';
import { EnhancedLessonContent } from './EnhancedLessonContent';
import { AudioPlayer } from './AudioPlayer';
import { useUser } from '../../contexts/UserContext';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { useToast } from '../../hooks/useToast';
import { usePointsService } from '../../services/pointsService';
import type { Course } from '../../data/courses/python-basics';

interface EnhancedCoursePlayerProps {
  course: Course;
  initialLessonId?: string;
}

interface CourseProgress {
  lesson_id: string;
  code: string;
  completed: boolean;
  completion_time?: string;
}

export const EnhancedCoursePlayer: React.FC<EnhancedCoursePlayerProps> = ({
  course,
  initialLessonId
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const supabase = useSupabase();
  const { toast } = useToast();
  const pointsService = usePointsService();

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [courseStats, setCourseStats] = useState({
    totalStudents: 1247,
    averageRating: 4.8,
    totalReviews: 324
  });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);

  const currentLesson = course.lessons[currentLessonIndex];

  // Enhanced lesson data with additional fields for audio
  const enhancedLessons = course.lessons.map((lesson, index) => ({
    ...lesson,
    objectives: [
      `Master ${lesson.title.toLowerCase()} fundamentals`,
      'Apply concepts through hands-on coding exercises',
      'Understand best practices and common patterns',
      'Build confidence in Python programming skills'
    ],
    keyPoints: lesson.keyPoints || [
      'Essential syntax and structure',
      'Industry best practices',
      'Common pitfalls and how to avoid them',
      'Real-world application examples',
      'Performance considerations',
      'Debugging techniques'
    ],
    difficulty: index < 2 ? 'easy' : index < 4 ? 'medium' : 'hard',
    completed: progress[lesson.id]?.completed || false,
    locked: index > 0 && !progress[course.lessons[index - 1].id]?.completed
  }));

  // Enhanced exercise data
  const enhancedExercise = {
    ...currentLesson.exercise,
    id: currentLesson.id,
    difficulty: enhancedLessons[currentLessonIndex].difficulty,
    testCases: [
      {
        input: 'test_input_1',
        expectedOutput: 'expected_output_1',
        description: 'Basic functionality test'
      },
      {
        input: 'test_input_2',
        expectedOutput: 'expected_output_2',
        description: 'Edge case handling'
      },
      {
        input: 'test_input_3',
        expectedOutput: 'expected_output_3',
        description: 'Performance validation'
      }
    ]
  };

  useEffect(() => {
    if (initialLessonId) {
      const lessonIndex = course.lessons.findIndex(l => l.id === initialLessonId);
      if (lessonIndex !== -1) {
        setCurrentLessonIndex(lessonIndex);
      }
    }
  }, [initialLessonId, course.lessons]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', course.id);

      if (error) throw error;

      const progressMap: Record<string, CourseProgress> = {};
      data?.forEach(p => {
        progressMap[p.lesson_id] = p;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async (lessonId: string, completed: boolean = false, code?: string) => {
    if (!user) return;

    try {
      const progressData = {
        user_id: user.id,
        course_id: course.id,
        lesson_id: lessonId,
        code: code || progress[lessonId]?.code || '',
        completed: completed,
        completion_time: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      // Fixed: Add onConflict to handle unique constraint properly
      const { error } = await supabase
        .from('course_progress')
        .upsert(progressData, {
          onConflict: 'user_id,course_id,lesson_id'
        });

      if (error) throw error;

      setProgress(prev => ({
        ...prev,
        [lessonId]: { ...progressData, completion_time: progressData.completion_time || undefined }
      }));

      if (completed) {
        await awardLessonCompletionPoints(lessonId);
        
        toast({
          title: 'Lesson Completed! 🎉',
          description: `Great job completing "${currentLesson.title}"`,
        });
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to save progress',
        variant: 'destructive',
      });
    }
  };

  const awardLessonCompletionPoints = async (lessonId: string) => {
    if (!user) return;

    try {
      setCompletingLesson(true);
      
      // Calculate points based on lesson difficulty
      const lesson = enhancedLessons.find(l => l.id === lessonId);
      let points = 50; // Base points
      
      if (lesson?.difficulty === 'medium') points = 75;
      if (lesson?.difficulty === 'hard') points = 100;

      const success = await pointsService.awardPoints(user.id, {
        source: 'lesson_completion',
        points: points,
        details: {
          course_id: course.id,
          lesson_id: lessonId,
          lesson_title: lesson?.title,
          difficulty: lesson?.difficulty
        }
      });

      if (success) {
        toast({
          title: 'Points Earned! 🌟',
          description: `You earned ${points} points for completing this lesson!`,
        });

        // Refresh user context to update points
        window.location.reload();
      }
    } catch (error) {
      console.error('Error awarding points:', error);
    } finally {
      setCompletingLesson(false);
    }
  };

  const calculateCourseProgress = () => {
    const completedLessons = Object.values(progress).filter(p => p.completed).length;
    return (completedLessons / course.lessons.length) * 100;
  };

  const handleLessonSelect = (index: number) => {
    if (!enhancedLessons[index].locked) {
      setCurrentLessonIndex(index);
    }
  };

  const handleNext = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? 'Bookmark Removed' : 'Lesson Bookmarked',
      description: isBookmarked ? 'Removed from your bookmarks' : 'Added to your bookmarks',
    });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/courses/${course.id}/${currentLesson.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied',
      description: 'Lesson link copied to clipboard',
    });
  };

  const handleExerciseComplete = async (completed: boolean) => {
    if (completed && !progress[currentLesson.id]?.completed) {
      await saveProgress(currentLesson.id, true);
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-black text-white">
      {/* Header */}
      <div className="border-b border-cosmic-purple-700/30 bg-cosmic-black/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/courses')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-display">{course.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{courseStats.totalStudents.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>{courseStats.averageRating} ({courseStats.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration} hours</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Headphones className="h-4 w-4 text-cosmic-gold-400" />
                    <span>AI Audio</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                className={`p-2 rounded-md transition-colors ${
                  showAudioPlayer || audioPlaying
                    ? 'text-cosmic-gold-400 bg-cosmic-gold-900/20' 
                    : 'text-gray-400 hover:text-cosmic-gold-400'
                }`}
                title="Toggle Audio Player"
              >
                <Headphones className="h-5 w-5" />
              </button>
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-md transition-colors ${
                  isBookmarked 
                    ? 'text-cosmic-gold-400 bg-cosmic-gold-900/20' 
                    : 'text-gray-400 hover:text-cosmic-gold-400'
                }`}
              >
                <BookmarkPlus className="h-5 w-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-cosmic-blue-400 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Audio Player */}
            <AnimatePresence>
              {showAudioPlayer && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AudioPlayer
                    lesson={enhancedLessons[currentLessonIndex]}
                    onAudioStateChange={setAudioPlaying}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Lesson Content */}
            <EnhancedLessonContent
              lesson={enhancedLessons[currentLessonIndex]}
              onBookmark={handleBookmark}
              onShare={handleShare}
              isBookmarked={isBookmarked}
            />

            {/* Interactive Code Editor */}
            <InteractiveCodeEditor
              exercise={enhancedExercise}
              onComplete={handleExerciseComplete}
              onCodeChange={(code) => saveProgress(currentLesson.id, false, code)}
              initialCode={progress[currentLesson.id]?.code}
            />
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 space-y-6">
              <CourseNavigation
                lessons={enhancedLessons}
                currentLessonIndex={currentLessonIndex}
                onLessonSelect={handleLessonSelect}
                onNext={handleNext}
                onPrevious={handlePrevious}
                canGoNext={currentLessonIndex < course.lessons.length - 1}
                canGoPrevious={currentLessonIndex > 0}
                courseProgress={calculateCourseProgress()}
              />

              {/* Course Certificate */}
              {calculateCourseProgress() === 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="cosmos-card p-6 text-center"
                >
                  <Award className="h-12 w-12 text-cosmic-gold-400 mx-auto mb-4" />
                  <h3 className="text-lg font-display mb-2">Congratulations!</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    You've completed the course. Download your certificate!
                  </p>
                  <button className="btn-primary w-full flex items-center justify-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download Certificate</span>
                  </button>
                </motion.div>
              )}

              {/* Progress Indicator */}
              {completingLesson && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="cosmos-card p-4 text-center"
                >
                  <Trophy className="h-8 w-8 text-cosmic-gold-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-cosmic-gold-400">Awarding points...</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cosmic-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="cosmos-card max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-display mb-4">Course Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Auto-advance Lessons
                  </label>
                  <input type="checkbox" className="rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Show Audio Player by Default
                  </label>
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={showAudioPlayer}
                    onChange={(e) => setShowAudioPlayer(e.target.checked)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Auto-play Audio on Lesson Start
                  </label>
                  <input type="checkbox" className="rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Show Hints Automatically
                  </label>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="btn-primary"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};