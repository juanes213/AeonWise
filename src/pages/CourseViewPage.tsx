import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, BookOpen, Clock, BarChart4, Users } from 'lucide-react';
import { CoursePlayer } from '../components/course/CoursePlayer';
import { pythonBasicsCourse } from '../data/courses/python-basics';
import type { Course } from '../data/courses/python-basics';

const CourseViewPage: React.FC = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    // In a real app, you'd fetch the course from an API
    // For now, we'll use the static course data
    if (courseId === 'python-basics') {
      setCourse(pythonBasicsCourse);
      if (lessonId) {
        setShowPlayer(true);
      }
    } else {
      // Course not found
      navigate('/courses');
    }
  }, [courseId, lessonId, navigate]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-purple-500"></div>
      </div>
    );
  }

  if (showPlayer) {
    return <CoursePlayer course={course} initialLessonId={lessonId} />;
  }

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center space-x-2 text-cosmic-purple-400 hover:text-cosmic-purple-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Courses</span>
          </button>

          {/* Course Header */}
          <div className="cosmos-card p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-display mb-4">{course.title}</h1>
                <p className="text-gray-300 text-lg mb-6">{course.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex flex-col items-center text-center bg-cosmic-black/30 p-4 rounded-lg">
                    <BarChart4 className="h-6 w-6 text-cosmic-gold-400 mb-2" />
                    <span className="text-sm text-gray-400">Level</span>
                    <span className="font-medium capitalize">{course.level}</span>
                  </div>
                  <div className="flex flex-col items-center text-center bg-cosmic-black/30 p-4 rounded-lg">
                    <Clock className="h-6 w-6 text-cosmic-gold-400 mb-2" />
                    <span className="text-sm text-gray-400">Duration</span>
                    <span className="font-medium">{course.duration}h</span>
                  </div>
                  <div className="flex flex-col items-center text-center bg-cosmic-black/30 p-4 rounded-lg">
                    <BookOpen className="h-6 w-6 text-cosmic-gold-400 mb-2" />
                    <span className="text-sm text-gray-400">Lessons</span>
                    <span className="font-medium">{course.lessons.length}</span>
                  </div>
                  <div className="flex flex-col items-center text-center bg-cosmic-black/30 p-4 rounded-lg">
                    <Users className="h-6 w-6 text-cosmic-gold-400 mb-2" />
                    <span className="text-sm text-gray-400">Students</span>
                    <span className="font-medium">1.2k</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPlayer(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Play className="h-5 w-5" />
                  <span>Start Learning</span>
                </button>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-cosmic-black/30 rounded-lg p-6">
                  <h3 className="text-lg font-display mb-4">What You'll Learn</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="text-cosmic-gold-400 mr-2">•</span>
                      Python variables and data types
                    </li>
                    <li className="flex items-start">
                      <span className="text-cosmic-gold-400 mr-2">•</span>
                      Conditional statements and logic
                    </li>
                    <li className="flex items-start">
                      <span className="text-cosmic-gold-400 mr-2">•</span>
                      Loops and iteration patterns
                    </li>
                    <li className="flex items-start">
                      <span className="text-cosmic-gold-400 mr-2">•</span>
                      Functions and code organization
                    </li>
                    <li className="flex items-start">
                      <span className="text-cosmic-gold-400 mr-2">•</span>
                      Lists and data manipulation
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Course Curriculum */}
          <div className="cosmos-card p-8">
            <h2 className="text-2xl font-display mb-6">Course Curriculum</h2>
            <div className="space-y-4">
              {course.lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-cosmic-black/30 rounded-lg p-6 hover:bg-cosmic-black/50 transition-colors cursor-pointer"
                  onClick={() => {
                    navigate(`/courses/${courseId}/${lesson.id}`);
                    setShowPlayer(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-cosmic-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{lesson.title}</h3>
                        <p className="text-gray-400 text-sm">{lesson.exercise.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {lesson.estimatedTime} min
                      </span>
                      <Play className="h-5 w-5 text-cosmic-purple-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseViewPage;