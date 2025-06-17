import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  MessageCircle, Send, BookOpen, Code, CheckCircle, 
  RotateCcw, Lightbulb, Clock, User, AlertCircle, Shuffle
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { marked } from 'marked';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../hooks/useToast';
import type { Course, Lesson } from '../../data/courses/python-basics';

interface CoursePlayerProps {
  course: Course;
  initialLessonId?: string;
}

interface CourseProgress {
  lesson_id: string;
  code: string;
  completed: boolean;
  completion_time?: string;
}

interface QAMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

interface Exercise {
  description: string;
  defaultCode: string;
  solution: string;
  hints: string[];
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ 
  course, 
  initialLessonId 
}) => {
  const { user } = useUser();
  const supabase = useSupabase();
  const { toast } = useToast();
  
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [code, setCode] = useState('');
  const [showQA, setShowQA] = useState(false);
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([]);
  const [qaInput, setQaInput] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [showHints, setShowHints] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const qaContainerRef = useRef<HTMLDivElement>(null);

  const currentLesson = course.lessons[currentLessonIndex];

  useEffect(() => {
    if (initialLessonId) {
      const lessonIndex = course.lessons.findIndex(l => l.id === initialLessonId);
      if (lessonIndex !== -1) {
        setCurrentLessonIndex(lessonIndex);
      }
    }
  }, [initialLessonId, course.lessons]);

  useEffect(() => {
    setCode(currentLesson.exercise.defaultCode);
    setCurrentExercise(currentLesson.exercise);
    loadProgress();
  }, [currentLessonIndex]);

  useEffect(() => {
    if (qaContainerRef.current) {
      qaContainerRef.current.scrollTop = qaContainerRef.current.scrollHeight;
    }
  }, [qaMessages]);

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

      // Load saved code if exists
      const lessonProgress = progressMap[currentLesson.id];
      if (lessonProgress?.code) {
        setCode(lessonProgress.code);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async (lessonId: string, completed: boolean = false) => {
    if (!user) return;

    try {
      const progressData = {
        user_id: user.id,
        course_id: course.id,
        lesson_id: lessonId,
        code: code,
        completed: completed,
        completion_time: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('course_progress')
        .upsert(progressData);

      if (error) throw error;

      // Update local progress
      setProgress(prev => ({
        ...prev,
        [lessonId]: { ...progressData, completion_time: progressData.completion_time || undefined }
      }));

      if (completed) {
        toast({
          title: 'Lesson Completed!',
          description: `Great job completing "${currentLesson.title}"`,
        });

        // Award points for lesson completion
        await awardPoints(lessonId);
      } else {
        toast({
          title: 'Progress Saved',
          description: 'Your code has been saved',
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

  const awardPoints = async (lessonId: string) => {
    if (!user) return;

    try {
      // Mock points awarding since the edge function was removed
      const pointsAwarded = 50;
      toast({
        title: 'Points Earned!',
        description: `You earned ${pointsAwarded} points!`,
      });
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  const generateAudio = async (text: string): Promise<string | null> => {
    try {
      setAudioLoading(true);
      
      // Mock audio generation since the edge function was removed
      setAudioAvailable(false);
      toast({
        title: 'Audio Unavailable',
        description: 'Audio narration is currently unavailable. You can still read the lesson content.',
      });
      return null;
    } catch (error) {
      console.error('Error generating audio:', error);
      setAudioAvailable(false);
      toast({
        title: 'Audio Service Unavailable',
        description: 'Audio narration is temporarily unavailable. Please continue with reading the lesson.',
      });
      return null;
    } finally {
      setAudioLoading(false);
    }
  };

  const playAudio = async () => {
    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause();
      setIsPlaying(false);
      return;
    }

    if (!audioAvailable) {
      toast({
        title: 'Audio Unavailable',
        description: 'Audio narration service is currently unavailable.',
      });
      return;
    }

    const audioUrl = await generateAudio(currentLesson.narrationText);
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.muted = isMuted;
    
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => setIsPlaying(false);
    
    setCurrentAudio(audio);
    audioRef.current = audio;
    audio.play();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (currentAudio) {
      currentAudio.muted = !isMuted;
    }
  };

  const generateNewExercise = async () => {
    setExerciseLoading(true);
    try {
      // Mock exercise generation using Groq API
      const exercises = [
        {
          description: `Create a function that calculates the area of a rectangle given length and width.`,
          defaultCode: `def calculate_area(length, width):
    # Your code here
    pass

# Test your function
print(calculate_area(5, 3))`,
          solution: `def calculate_area(length, width):
    return length * width

# Test your function
print(calculate_area(5, 3))  # Output: 15`,
          hints: [
            'Multiply length by width to get the area',
            'Use the return statement to return the result',
            'Make sure to handle edge cases like negative numbers'
          ]
        },
        {
          description: `Write a function that checks if a number is even or odd.`,
          defaultCode: `def check_even_odd(number):
    # Your code here
    pass

# Test your function
print(check_even_odd(4))
print(check_even_odd(7))`,
          solution: `def check_even_odd(number):
    if number % 2 == 0:
        return "even"
    else:
        return "odd"

# Test your function
print(check_even_odd(4))  # Output: even
print(check_even_odd(7))  # Output: odd`,
          hints: [
            'Use the modulo operator (%) to check remainder',
            'If remainder is 0, the number is even',
            'Use if-else statement for the logic'
          ]
        },
        {
          description: `Create a function that finds the maximum number in a list.`,
          defaultCode: `def find_maximum(numbers):
    # Your code here
    pass

# Test your function
test_list = [3, 7, 2, 9, 1]
print(find_maximum(test_list))`,
          solution: `def find_maximum(numbers):
    if not numbers:
        return None
    
    max_num = numbers[0]
    for num in numbers:
        if num > max_num:
            max_num = num
    return max_num

# Test your function
test_list = [3, 7, 2, 9, 1]
print(find_maximum(test_list))  # Output: 9`,
          hints: [
            'Start with the first number as the maximum',
            'Loop through the list and compare each number',
            'Update the maximum when you find a larger number'
          ]
        }
      ];

      // Randomly select an exercise
      const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
      setCurrentExercise(randomExercise);
      setCode(randomExercise.defaultCode);
      
      toast({
        title: 'New Exercise Generated!',
        description: 'Try solving this new challenge',
      });
    } catch (error) {
      console.error('Error generating exercise:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate new exercise',
        variant: 'destructive',
      });
    } finally {
      setExerciseLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!qaInput.trim()) return;

    const userMessage: QAMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: qaInput,
      timestamp: new Date()
    };

    setQaMessages(prev => [...prev, userMessage]);
    setQaInput('');
    setQaLoading(true);

    try {
      // Mock Q&A response since the edge function was removed
      const mockResponses = [
        "That's a great question! Let me explain that concept in more detail...",
        "I understand your confusion. This is a common question when learning this topic.",
        "Good observation! Here's how you can think about this problem...",
        "That's exactly the right question to ask at this point in your learning journey."
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      const assistantMessage: QAMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      };

      setQaMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: 'Error',
        description: 'Failed to get answer to your question',
        variant: 'destructive',
      });
    } finally {
      setQaLoading(false);
    }
  };

  const playMessageAudio = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }
    
    const audio = new Audio(audioUrl);
    audio.play();
    setCurrentAudio(audio);
  };

  const nextLesson = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const prevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const resetCode = () => {
    if (currentExercise) {
      setCode(currentExercise.defaultCode);
    }
  };

  const markComplete = () => {
    saveProgress(currentLesson.id, true);
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress[lessonId]?.completed || false;
  };

  return (
    <div className="min-h-screen bg-cosmic-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display mb-2">{course.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              Lesson {currentLessonIndex + 1} of {course.lessons.length}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {currentLesson.estimatedTime} min
            </span>
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {course.level}
            </span>
          </div>
        </div>

        {/* Audio Service Warning */}
        {!audioAvailable && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-yellow-300">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Audio narration is currently unavailable</span>
            </div>
            <p className="text-sm text-yellow-200 mt-1">
              You can still access all lesson content and complete exercises. Audio features will be restored once the service is configured.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Content */}
          <div className="space-y-6">
            {/* Lesson Navigation */}
            <div className="cosmos-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display">{currentLesson.title}</h2>
                {isLessonCompleted(currentLesson.id) && (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                )}
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <button
                  onClick={prevLesson}
                  disabled={currentLessonIndex === 0}
                  className="p-2 bg-cosmic-purple-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                
                <button
                  onClick={playAudio}
                  disabled={audioLoading || !audioAvailable}
                  className={`flex-1 flex items-center justify-center space-x-2 rounded-md py-2 px-4 transition-colors ${
                    !audioAvailable 
                      ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                      : 'bg-cosmic-purple-600 hover:bg-cosmic-purple-700'
                  }`}
                >
                  {audioLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>
                    {!audioAvailable ? 'Audio Unavailable' : isPlaying ? 'Pause' : 'Play'} Narration
                  </span>
                </button>
                
                <button
                  onClick={toggleMute}
                  disabled={!audioAvailable}
                  className={`p-2 rounded-md ${
                    !audioAvailable 
                      ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                      : 'bg-cosmic-purple-800'
                  }`}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                
                <button
                  onClick={nextLesson}
                  disabled={currentLessonIndex === course.lessons.length - 1}
                  className="p-2 bg-cosmic-purple-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-cosmic-black/50 rounded-full h-2 mb-4">
                <div
                  className="bg-gradient-to-r from-cosmic-purple-500 to-cosmic-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentLessonIndex + 1) / course.lessons.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Lesson Content */}
            <div className="cosmos-card p-6">
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: marked(currentLesson.content) }}
              />
            </div>

            {/* Q&A Section */}
            <div className="cosmos-card p-6">
              <button
                onClick={() => setShowQA(!showQA)}
                className="flex items-center space-x-2 text-cosmic-gold-400 hover:text-cosmic-gold-300 mb-4"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Ask a Question</span>
              </button>

              {showQA && (
                <div className="space-y-4">
                  <div 
                    ref={qaContainerRef}
                    className="max-h-60 overflow-y-auto space-y-3 bg-cosmic-black/30 rounded-lg p-4"
                  >
                    {qaMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-cosmic-purple-600 text-white'
                              : 'bg-cosmic-blue-800 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {message.audioUrl && audioAvailable && (
                            <button
                              onClick={() => playMessageAudio(message.audioUrl!)}
                              className="mt-2 flex items-center space-x-1 text-xs opacity-70 hover:opacity-100"
                            >
                              <Play className="h-3 w-3" />
                              <span>Play Audio</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={qaInput}
                      onChange={(e) => setQaInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                      placeholder="Ask about this lesson..."
                      className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                    />
                    <button
                      onClick={askQuestion}
                      disabled={qaLoading || !qaInput.trim()}
                      className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 rounded-md px-4 py-2 disabled:opacity-50"
                    >
                      {qaLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="space-y-6">
            {/* Exercise Description */}
            <div className="cosmos-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display flex items-center">
                  <Code className="h-5 w-5 mr-2 text-cosmic-gold-400" />
                  Exercise
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={generateNewExercise}
                    disabled={exerciseLoading}
                    className="flex items-center space-x-1 text-sm bg-cosmic-gold-800 hover:bg-cosmic-gold-700 rounded-md px-3 py-1"
                  >
                    {exerciseLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Shuffle className="h-4 w-4" />
                    )}
                    <span>New Exercise</span>
                  </button>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center space-x-1 text-sm bg-cosmic-blue-800 hover:bg-cosmic-blue-700 rounded-md px-3 py-1"
                  >
                    <Lightbulb className="h-4 w-4" />
                    <span>Hints</span>
                  </button>
                  <button
                    onClick={resetCode}
                    className="flex items-center space-x-1 text-sm bg-cosmic-purple-800 hover:bg-cosmic-purple-700 rounded-md px-3 py-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">
                {currentExercise?.description || currentLesson.exercise.description}
              </p>
              
              {showHints && (
                <div className="bg-cosmic-blue-900/30 rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-2 text-cosmic-blue-300">Hints:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {(currentExercise?.hints || currentLesson.exercise.hints).map((hint, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-cosmic-blue-400 mr-2">•</span>
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Code Editor */}
            <div className="cosmos-card p-4">
              <div className="h-96 border border-cosmic-purple-700/30 rounded-lg overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => saveProgress(currentLesson.id)}
                  className="btn-secondary text-sm"
                >
                  Save Progress
                </button>
                
                <button
                  onClick={markComplete}
                  disabled={isLessonCompleted(currentLesson.id)}
                  className="btn-primary text-sm flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    {isLessonCompleted(currentLesson.id) ? 'Completed' : 'Mark Complete'}
                  </span>
                </button>
              </div>
            </div>

            {/* Lesson Progress */}
            <div className="cosmos-card p-4">
              <h4 className="font-medium mb-3">Course Progress</h4>
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      index === currentLessonIndex
                        ? 'bg-cosmic-purple-800/50'
                        : 'bg-cosmic-black/30 hover:bg-cosmic-black/50'
                    }`}
                    onClick={() => setCurrentLessonIndex(index)}
                  >
                    <span className="text-sm">{lesson.title}</span>
                    {isLessonCompleted(lesson.id) && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};