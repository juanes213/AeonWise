import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BookOpen, Users, Sparkles, Trophy } from 'lucide-react';

const HomePage: React.FC = () => {
  const { t } = useTranslation();

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
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-cosmos opacity-20 z-0"></div>
        <div className="container mx-auto relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="font-display mb-6 leading-tight">
              <span className="block text-white">{t('home.hero.title')}</span>
              <span className="magic-text">{t('home.hero.subtitle')}</span>
            </h1>
            <p className="text-white/80 text-xl mb-8 max-w-2xl mx-auto">
              Join our mystical community of mentors and learners to exchange knowledge, grow your skills, and discover new talents.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/skill-swap" className="btn-primary">
                {t('home.hero.cta')}
              </Link>
              <Link to="/mentorship" className="btn-secondary">
                {t('nav.mentorship')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.h2 
            className="text-center font-display mb-16 magic-text"
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
                  {t('home.features.skillSwap.title')}
                </h3>
                <p className="text-white/70">
                  {t('home.features.skillSwap.description')}
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
                  {t('home.features.mentorship.title')}
                </h3>
                <p className="text-white/70">
                  {t('home.features.mentorship.description')}
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
                  {t('home.features.courses.title')}
                </h3>
                <p className="text-white/70">
                  {t('home.features.courses.description')}
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
                  {t('home.features.ranking.title')}
                </h3>
                <p className="text-white/70">
                  {t('home.features.ranking.description')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Mentors Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display mb-4">Featured Mentors</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Learn from our most respected masters across various disciplines. These mentors have achieved the highest ranks and are ready to guide you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mentor Card 1 */}
            <div className="cosmos-card overflow-hidden group">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cosmic-gold-400 mb-4">
                  <img 
                    src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" 
                    alt="Alexandria"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2 mb-4">
                  <span className="badge badge-master">Master</span>
                </div>
                <h3 className="text-xl font-display mb-2">Alexandria</h3>
                <p className="text-cosmic-gold-400 text-sm mb-4">Data Science & AI</p>
                <p className="text-white/70 text-sm mb-6">
                  With 15 years of experience in data science and machine learning, Alexandria helps students unlock the secrets of AI.
                </p>
                <Link to="/mentorship" className="btn-secondary text-sm">
                  View Profile
                </Link>
              </div>
            </div>

            {/* Mentor Card 2 */}
            <div className="cosmos-card overflow-hidden group">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cosmic-gold-400 mb-4">
                  <img 
                    src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" 
                    alt="Marcus"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2 mb-4">
                  <span className="badge badge-expert">Expert</span>
                </div>
                <h3 className="text-xl font-display mb-2">Marcus</h3>
                <p className="text-cosmic-gold-400 text-sm mb-4">Full-Stack Development</p>
                <p className="text-white/70 text-sm mb-6">
                  Full-stack developer specializing in React and Node.js, with a decade of experience building web applications.
                </p>
                <Link to="/mentorship" className="btn-secondary text-sm">
                  View Profile
                </Link>
              </div>
            </div>

            {/* Mentor Card 3 */}
            <div className="cosmos-card overflow-hidden group">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cosmic-gold-400 mb-4">
                  <img 
                    src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" 
                    alt="Sophia"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2 mb-4">
                  <span className="badge badge-master">Master</span>
                </div>
                <h3 className="text-xl font-display mb-2">Sophia</h3>
                <p className="text-cosmic-gold-400 text-sm mb-4">UX Design & Psychology</p>
                <p className="text-white/70 text-sm mb-6">
                  Award-winning UX designer with a background in cognitive psychology, specializing in user-centered design.
                </p>
                <Link to="/mentorship" className="btn-secondary text-sm">
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="cosmos-card p-12 text-center">
            <h2 className="font-display mb-6 magic-text">Begin Your Journey of Wisdom</h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Whether you're seeking knowledge or ready to share your expertise, AeonWise connects you with a community of learners and mentors.
            </p>
            <Link to="/auth/signup" className="btn-primary">
              Join The Community
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;