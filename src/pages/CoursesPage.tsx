import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, BarChart4, BookOpenCheck } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  modules: number;
  category: string;
  imageUrl: string;
  enrolled?: boolean;
  progress?: number;
}

const CoursesPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  // Sample courses data
  const courses: Course[] = [
    {
      id: '1',
      title: 'Introduction to Python Programming',
      description: 'Learn the fundamentals of Python programming, from basic syntax to building simple applications. Perfect for beginners with no prior coding experience.',
      level: 'beginner',
      duration: 6,
      modules: 8,
      category: 'Programming',
      imageUrl: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg',
      enrolled: true,
      progress: 35,
    },
    {
      id: '2',
      title: 'Web Development Fundamentals',
      description: 'Master the core technologies of web development: HTML, CSS, and JavaScript. Build responsive websites and understand modern web standards.',
      level: 'beginner',
      duration: 10,
      modules: 12,
      category: 'Web Development',
      imageUrl: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg',
      enrolled: false,
    },
    {
      id: '3',
      title: 'Graphic Design Principles',
      description: 'Explore the fundamental principles of graphic design, including typography, color theory, composition, and visual hierarchy.',
      level: 'intermediate',
      duration: 8,
      modules: 10,
      category: 'Design',
      imageUrl: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg',
      enrolled: true,
      progress: 75,
    },
    {
      id: '4',
      title: 'Data Science with Python',
      description: 'Learn how to analyze and visualize data using Python libraries like Pandas, NumPy, and Matplotlib. Apply statistical methods to real-world datasets.',
      level: 'intermediate',
      duration: 12,
      modules: 15,
      category: 'Data Science',
      imageUrl: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg',
      enrolled: false,
    },
    {
      id: '5',
      title: 'Advanced Machine Learning',
      description: 'Dive deep into machine learning algorithms, neural networks, and model optimization. Build and deploy sophisticated AI systems.',
      level: 'advanced',
      duration: 14,
      modules: 18,
      category: 'AI & Machine Learning',
      imageUrl: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg',
      enrolled: false,
    },
    {
      id: '6',
      title: 'Mobile App Development with React Native',
      description: 'Create cross-platform mobile applications using React Native. Learn component-based architecture and native module integration.',
      level: 'intermediate',
      duration: 10,
      modules: 12,
      category: 'Mobile Development',
      imageUrl: 'https://images.pexels.com/photos/907489/pexels-photo-907489.jpeg',
      enrolled: false,
    },
    {
      id: '7',
      title: 'Digital Marketing Mastery',
      description: 'Master digital marketing strategies including SEO, social media marketing, content marketing, and paid advertising campaigns.',
      level: 'beginner',
      duration: 8,
      modules: 10,
      category: 'Marketing',
      imageUrl: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg',
      enrolled: false,
    },
    {
      id: '8',
      title: 'Photography Fundamentals',
      description: 'Learn the art and science of photography. Master composition, lighting, camera settings, and post-processing techniques.',
      level: 'beginner',
      duration: 6,
      modules: 8,
      category: 'Photography',
      imageUrl: 'https://images.pexels.com/photos/606541/pexels-photo-606541.jpeg',
      enrolled: false,
    },
  ];

  const myCourses = courses.filter(course => course.enrolled);
  const displayedCourses = activeTab === 'all' ? courses : myCourses;

  const enrollCourse = (courseId: string) => {
    toast({
      title: 'Enrolled Successfully',
      description: 'You have been enrolled in the course',
    });
  };

  const continueCourse = (courseId: string) => {
    toast({
      title: 'Continuing Course',
      description: 'Loading your progress...',
    });
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-cosmic-blue-800 text-cosmic-blue-100';
      case 'intermediate':
        return 'bg-cosmic-purple-800 text-cosmic-purple-100';
      case 'advanced':
        return 'bg-cosmic-gold-800 text-cosmic-gold-100';
      default:
        return 'bg-cosmic-blue-800 text-cosmic-blue-100';
    }
  };

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="font-display mb-4">Courses</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Learn at your own pace with our comprehensive course library. From beginner to advanced levels.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-cosmic-black/50 backdrop-blur-sm rounded-lg p-1 border border-cosmic-purple-700/30">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-cosmic-purple-600 text-white'
                  : 'bg-transparent text-white/70 hover:text-white'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Courses
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'my'
                  ? 'bg-cosmic-purple-600 text-white'
                  : 'bg-transparent text-white/70 hover:text-white'
              }`}
              onClick={() => setActiveTab('my')}
            >
              My Courses
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {displayedCourses.length === 0 ? (
          <div className="text-center py-12 text-white/70">
            You haven't enrolled in any courses yet.
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {displayedCourses.map((course) => (
              <motion.div
                key={course.id}
                className="cosmos-card overflow-hidden group"
                variants={itemVariant}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`badge ${getLevelColor(course.level)}`}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-display mb-2">{course.title}</h3>
                  <p className="text-white/70 text-sm mb-6 line-clamp-3">
                    {course.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="flex flex-col items-center text-sm bg-cosmic-black/30 p-2 rounded-md">
                      <Clock className="h-4 w-4 text-cosmic-gold-400 mb-1" />
                      <span>{course.duration}h</span>
                    </div>
                    <div className="flex flex-col items-center text-sm bg-cosmic-black/30 p-2 rounded-md">
                      <BookOpen className="h-4 w-4 text-cosmic-gold-400 mb-1" />
                      <span>{course.modules}</span>
                    </div>
                    <div className="flex flex-col items-center text-sm bg-cosmic-black/30 p-2 rounded-md">
                      <BarChart4 className="h-4 w-4 text-cosmic-gold-400 mb-1" />
                      <span>{course.level.slice(0, 3)}</span>
                    </div>
                  </div>

                  {course.enrolled && course.progress !== undefined && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-cosmic-black/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cosmic-purple-500 to-cosmic-blue-500 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {course.enrolled ? (
                    <button
                      onClick={() => continueCourse(course.id)}
                      className="btn-primary w-full flex items-center justify-center"
                    >
                      <BookOpenCheck className="h-4 w-4 mr-2" />
                      {course.progress ? 'Continue Learning' : 'Start Learning'}
                    </button>
                  ) : (
                    <button
                      onClick={() => enrollCourse(course.id)}
                      className="btn-primary w-full"
                    >
                      Enroll
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;