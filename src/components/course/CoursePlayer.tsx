import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  MessageCircle, Send, BookOpen, Code, CheckCircle, 
  RotateCcw, Lightbulb, Clock, User
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
  const [code, setCode] = useState('');
  const [showQA, setShowQA] = useState(false);
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([]);
  const [qaInput, setQaInput] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [showHints, setShowHints] = useState(false);
  
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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/award-lesson-points`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: course.id,
          lessonId: lessonId,
          skill: 'Python'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Points Earned!',
          description: `You earned ${data.pointsAwarded} points!`,
        });
      }
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  const generateAudio = async (text: string): Promise<string | null> => {
    try {
      setAudioLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-audio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to generate audio');

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: 'Audio Error',
        description: 'Failed to generate audio narration',
        variant: 'destructive',
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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/course-qa`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: qaInput,
          lessonContent: currentLesson.content,
          lessonTitle: currentLesson.title
        }),
      });

      if (!response.ok) throw new Error('Failed to get answer');

      const data = await response.json();
      
      // Generate audio for the answer
      const audioUrl = await generateAudio(data.answer);
      
      const assistantMessage: QAMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        audioUrl: audioUrl || undefined
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
    setCode(currentLesson.exercise.defaultCode);
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
                  disabled={audioLoading}
                  className="flex-1 flex items-center justify-center space-x-2 bg-cosmic-purple-600 hover:bg-cosmic-purple-700 rounded-md py-2 px-4 transition-colors"
                >
                  {audioLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>{isPlaying ? 'Pause' : 'Play'} Narration</span>
                </button>
                
                <button
                  onClick={toggleMute}
                  className="p-2 bg-cosmic-purple-800 rounded-md"
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
                          {message.audioUrl && (
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
              
              <p className="text-gray-300 mb-4">{currentLesson.exercise.description}</p>
              
              {showHints && (
                <div className="bg-cosmic-blue-900/30 rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-2 text-cosmic-blue-300">Hints:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {currentLesson.exercise.hints.map((hint, index) => (
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