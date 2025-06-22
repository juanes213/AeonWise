import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, BookOpen, Clock, BarChart4, Users, Star, Award } from 'lucide-react';
import { EnhancedCoursePlayer } from '../components/course/EnhancedCoursePlayer';
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
    return <EnhancedCoursePlayer course={course} initialLessonId={lessonId} />;
  }

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center space-x-2 text-cosmic-purple-400 hover:text-cosmic-purple-300 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Courses</span>
          </button>

          {/* Course Hero Section */}
          <div className="cosmos-card p-0 mb-8 overflow-hidden">
            <div className="relative h-64 bg-gradient-to-br from-cosmic-purple-800/50 to-cosmic-blue-800/50">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-20 h-20 bg-cosmic-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <BookOpen className="h-10 w-10 text-white" />
                  </motion.div>
                  <h1 className="text-4xl font-display mb-2">{course.title}</h1>
                  <p className="text-xl text-gray-300 max-w-2xl mx-auto">{course.description}</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="bg-cosmic-purple-900/30 rounded-lg p-4 mb-2">
                        <BarChart4 className="h-8 w-8 text-cosmic-gold-400 mx-auto" />
                      </div>
                      <div className="text-sm text-gray-400">Level</div>
                      <div className="font-medium capitalize">{course.level}</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-cosmic-blue-900/30 rounded-lg p-4 mb-2">
                        <Clock className="h-8 w-8 text-cosmic-gold-400 mx-auto" />
                      </div>
                      <div className="text-sm text-gray-400">Duration</div>
                      <div className="font-medium">{course.duration}h</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-cosmic-gold-900/30 rounded-lg p-4 mb-2">
                        <BookOpen className="h-8 w-8 text-cosmic-gold-400 mx-auto" />
                      </div>
                      <div className="text-sm text-gray-400">Lessons</div>
                      <div className="font-medium">{course.lessons.length}</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-cosmic-purple-900/30 rounded-lg p-4 mb-2">
                        <Users className="h-8 w-8 text-cosmic-gold-400 mx-auto" />
                      </div>
                      <div className="text-sm text-gray-400">Students</div>
                      <div className="font-medium">1.2k</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-display mb-4">What You'll Learn</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          'Python variables and data types',
                          'Conditional statements and logic',
                          'Loops and iteration patterns',
                          'Functions and code organization',
                          'Lists and data manipulation',
                          'Object-oriented programming basics'
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-3"
                          >
                            <div className="w-2 h-2 bg-cosmic-gold-400 rounded-full" />
                            <span className="text-gray-300">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-display mb-4">Course Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-cosmic-black/30 rounded-lg p-4">
                          <Play className="h-6 w-6 text-cosmic-purple-400 mb-2" />
                          <h4 className="font-medium mb-1">Interactive Exercises</h4>
                          <p className="text-sm text-gray-400">Hands-on coding practice</p>
                        </div>
                        <div className="bg-cosmic-black/30 rounded-lg p-4">
                          <Award className="h-6 w-6 text-cosmic-gold-400 mb-2" />
                          <h4 className="font-medium mb-1">Certificate</h4>
                          <p className="text-sm text-gray-400">Completion certificate</p>
                        </div>
                        <div className="bg-cosmic-black/30 rounded-lg p-4">
                          <Users className="h-6 w-6 text-cosmic-blue-400 mb-2" />
                          <h4 className="font-medium mb-1">Community</h4>
                          <p className="text-sm text-gray-400">Student discussions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="cosmos-card p-6 sticky top-24">
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="text-lg font-bold">4.8</span>
                        <span className="text-gray-400">(324 reviews)</span>
                      </div>
                      <div className="text-2xl font-bold text-cosmic-gold-400 mb-1">Free</div>
                      <div className="text-sm text-gray-400">Full access included</div>
                    </div>

                    <button
                      onClick={() => setShowPlayer(true)}
                      className="btn-primary w-full mb-4 flex items-center justify-center space-x-2"
                    >
                      <Play className="h-5 w-5" />
                      <span>Start Learning</span>
                    </button>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Skill Level:</span>
                        <span className="capitalize">{course.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Languages:</span>
                        <span>English</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Captions:</span>
                        <span>Yes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Certificate:</span>
                        <span>Included</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Curriculum */}
          <div className="cosmos-card p-8">
            <h2 className="text-2xl font-display mb-6">Course Curriculum</h2>
            <div className="space-y-3">
              {course.lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-cosmic-black/30 rounded-lg p-6 hover:bg-cosmic-black/50 transition-all cursor-pointer group"
                  onClick={() => {
                    navigate(`/courses/${courseId}/${lesson.id}`);
                    setShowPlayer(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-cosmic-purple-600 rounded-full flex items-center justify-center text-sm font-bold group-hover:bg-cosmic-purple-500 transition-colors">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg group-hover:text-cosmic-purple-300 transition-colors">
                          {lesson.title}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">{lesson.exercise.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {lesson.estimatedTime} min
                          </span>
                          <span className="flex items-center">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Interactive
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Play className="h-5 w-5 text-cosmic-purple-400 group-hover:text-cosmic-purple-300 transition-colors" />
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