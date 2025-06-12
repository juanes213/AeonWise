import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BookOpen, Users, Sparkles, Trophy } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  
  console.log('HomePage rendering...');

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="pt-20 bg-cosmic-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="font-display mb-6 leading-tight text-4xl md:text-6xl">
              <span className="block text-white">Unlock your potential with AeonWise</span>
              <span className="magic-text">Share skills, find mentors, and accelerate your learning journey</span>
            </h1>
            <p className="text-white/80 text-xl mb-8 max-w-2xl mx-auto">
              Join our mystical community of mentors and learners to exchange knowledge, grow your skills, and discover new talents.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <>
                  <Link to="/skill-swap" className="btn-primary">
                    Start Learning
                  </Link>
                  <Link to="/mentorship" className="btn-secondary">
                    Find Mentors
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth/signup" className="btn-primary">
                    Get Started
                  </Link>
                  <Link to="/auth/signin" className="btn-secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.h2 
            className="text-center font-display mb-16 magic-text text-3xl md:text-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Unlock the Cosmic Power of Knowledge
          </motion.h2>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="cosmos-card group"
              variants={fadeIn}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-cosmic-purple-800/30 mb-6 group-hover:animate-glow transition-all">
                  <Users className="h-8 w-8 text-cosmic-gold-400" />
                </div>
                <h3 className="text-xl font-display mb-4">
                  Skill Swap
                </h3>
                <p className="text-white/70">
                  Exchange knowledge with others who have complementary skills
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="cosmos-card group"
              variants={fadeIn}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-cosmic-blue-800/30 mb-6 group-hover:animate-glow transition-all">
                  <Sparkles className="h-8 w-8 text-cosmic-gold-400" />
                </div>
                <h3 className="text-xl font-display mb-4">
                  Expert Mentorship
                </h3>
                <p className="text-white/70">
                  Learn directly from experienced mentors in your field
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="cosmos-card group"
              variants={fadeIn}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-cosmic-gold-800/30 mb-6 group-hover:animate-glow transition-all">
                  <BookOpen className="h-8 w-8 text-cosmic-gold-400" />
                </div>
                <h3 className="text-xl font-display mb-4">
                  AI-Generated Courses
                </h3>
                <p className="text-white/70">
                  Access personalized learning content created with AI
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="cosmos-card group"
              variants={fadeIn}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-cosmic-purple-800/30 mb-6 group-hover:animate-glow transition-all">
                  <Trophy className="h-8 w-8 text-cosmic-gold-400" />
                </div>
                <h3 className="text-xl font-display mb-4">
                  Knowledge Ranking
                </h3>
                <p className="text-white/70">
                  Build your expertise profile and climb the ranks
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="cosmos-card p-12 text-center">
            <h2 className="font-display mb-6 magic-text text-2xl md:text-3xl">Begin Your Journey of Wisdom</h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Whether you're seeking knowledge or ready to share your expertise, AeonWise connects you with a community of learners and mentors.
            </p>
            {user ? (
              <Link to="/skill-swap" className="btn-primary">
                Start Your Journey
              </Link>
            ) : (
              <Link to="/auth/signup" className="btn-primary">
                Join The Community
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;