import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import { Calendar, Clock, DollarSign, Volume2, Play, Sparkles } from 'lucide-react';
import { getRankBadgeClass } from '../lib/utils';

interface Mentor {
  id: string;
  name: string;
  rank: string;
  category: string;
  specialty: string;
  price: number;
  currency: string;
  sessions: number;
  rating: number;
  sessionLength: number;
  availability: string;
  bio: string;
  imageUrl: string;
  ipfsHash?: string;
}

const categories = [
  'All Categories',
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Data Science',
  'Language',
  'Music',
  'Fitness',
];

const mentors: Mentor[] = [
  {
    id: '1',
    name: 'Alexandria',
    rank: 'master',
    category: 'Data Science',
    specialty: 'Machine Learning & AI',
    price: 120,
    currency: 'USD',
    sessions: 152,
    rating: 4.9,
    sessionLength: 60,
    availability: 'Mon-Fri, 2-6pm',
    bio: 'Data scientist with 15 years of experience in machine learning, neural networks, and AI applications. Specialized in predictive modeling and natural language processing.',
    imageUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    ipfsHash: 'Qm123456789abcdef',
  },
  {
    id: '2',
    name: 'Marcus',
    rank: 'expert',
    category: 'Programming',
    specialty: 'Full-Stack Development',
    price: 95,
    currency: 'USD',
    sessions: 87,
    rating: 4.7,
    sessionLength: 45,
    availability: 'Wed-Sun, 10am-4pm',
    bio: 'Full-stack developer with extensive experience in React, Node.js, and cloud architectures. Helped scale multiple startups from concept to production.',
    imageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    ipfsHash: 'Qm987654321fedcba',
  },
  {
    id: '3',
    name: 'Sophia',
    rank: 'master',
    category: 'Design',
    specialty: 'UX/UI & Psychology',
    price: 110,
    currency: 'USD',
    sessions: 203,
    rating: 5.0,
    sessionLength: 60,
    availability: 'Tue-Sat, 12-8pm',
    bio: 'Award-winning UX designer with a background in cognitive psychology. Specializes in creating intuitive, accessible interfaces for complex applications.',
    imageUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    ipfsHash: 'Qm567890abcdefg',
  },
  {
    id: '4',
    name: 'Julian',
    rank: 'journeyman',
    category: 'Music',
    specialty: 'Music Theory & Composition',
    price: 80,
    currency: 'USD',
    sessions: 64,
    rating: 4.8,
    sessionLength: 45,
    availability: 'Mon-Wed, 6-10pm',
    bio: 'Classically trained composer with a modern approach to music theory. Teaches composition, arrangement, and production for all genres.',
    imageUrl: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    ipfsHash: 'Qm345678hijklmn',
  },
  {
    id: '5',
    name: 'Elena',
    rank: 'expert',
    category: 'Business',
    specialty: 'Entrepreneurship & Funding',
    price: 150,
    currency: 'USD',
    sessions: 127,
    rating: 4.9,
    sessionLength: 90,
    availability: 'Thu-Sun, 9am-5pm',
    bio: 'Serial entrepreneur who has founded three successful tech startups. Expertise in business model development, fundraising, and strategic growth.',
    imageUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    ipfsHash: 'Qm789012pqrstuv',
  },
  {
    id: '6',
    name: 'Raj',
    rank: 'master',
    category: 'Programming',
    specialty: 'Algorithms & System Design',
    price: 130,
    currency: 'USD',
    sessions: 176,
    rating: 4.9,
    sessionLength: 60,
    availability: 'Mon-Fri, 7-11pm',
    bio: 'Principal engineer at a major tech company with expertise in distributed systems and algorithm optimization. Author of two books on system design.',
    imageUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    ipfsHash: 'Qm901234wxyzabc',
  },
];

const MentorshipPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredMentors = selectedCategory === 'All Categories'
    ? mentors
    : mentors.filter(mentor => mentor.category === selectedCategory);

  const playIntroduction = (mentorId: string) => {
    // In a real app, this would play the ElevenLabs-generated audio
    if (playingAudio === mentorId) {
      setPlayingAudio(null);
      toast({
        title: 'Audio stopped',
      });
    } else {
      setPlayingAudio(mentorId);
      toast({
        title: 'Playing introduction',
        description: 'This would play the mentor\'s audio introduction in a real app',
      });
      
      // Simulate audio playing for 5 seconds
      setTimeout(() => {
        setPlayingAudio(null);
      }, 5000);
    }
  };

  const bookSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowModal(true);
  };

  const handleBooking = () => {
    // In a real app, this would process the booking
    toast({
      title: 'Session Booked!',
      description: `Your session with ${selectedMentor?.name} has been scheduled.`,
    });
    setShowModal(false);
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

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="font-display mb-4">{t('mentorship.title')}</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            {t('mentorship.description')}
          </p>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-xl font-display mb-6">{t('mentorship.categories')}</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedCategory === category
                    ? 'bg-cosmic-purple-600 text-white'
                    : 'bg-cosmic-black/50 border border-cosmic-purple-700/30 text-white/70 hover:bg-cosmic-purple-700/20'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Mentors List */}
        {filteredMentors.length === 0 ? (
          <div className="text-center py-12 text-white/70">
            {t('mentorship.noMentors')}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredMentors.map((mentor) => (
              <motion.div
                key={mentor.id}
                className="cosmos-card overflow-hidden group"
                variants={itemVariant}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={mentor.imageUrl}
                    alt={mentor.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`badge ${getRankBadgeClass(mentor.rank)}`}>
                      {t(`ranks.${mentor.rank}`)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-display">{mentor.name}</h3>
                      <p className="text-cosmic-gold-400 text-sm">{mentor.specialty}</p>
                    </div>
                    <button
                      onClick={() => playIntroduction(mentor.id)}
                      className={`p-2 rounded-full ${
                        playingAudio === mentor.id
                          ? 'bg-cosmic-gold-500 text-white animate-pulse'
                          : 'bg-cosmic-purple-800/50 text-white/70 hover:bg-cosmic-purple-700'
                      } transition-colors`}
                      aria-label="Play introduction"
                    >
                      {playingAudio === mentor.id ? (
                        <Volume2 className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <p className="text-white/70 text-sm mb-6 line-clamp-3">
                    {mentor.bio}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                      <span>
                        {mentor.price} {mentor.currency} / session
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                      <span>{mentor.sessionLength} min</span>
                    </div>
                    <div className="flex items-center text-sm col-span-2">
                      <Calendar className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                      <span>{mentor.availability}</span>
                    </div>
                  </div>

                  {mentor.ipfsHash && (
                    <div className="mb-4 bg-cosmic-black/30 p-2 rounded-md">
                      <p className="text-xs text-white/50 break-all">
                        IPFS: {mentor.ipfsHash}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => bookSession(mentor)}
                      className="btn-primary flex-1"
                    >
                      {t('mentorship.bookSession')}
                    </button>
                    <button className="btn-secondary flex-1">
                      {t('mentorship.viewProfile')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Become a Mentor CTA */}
        <div className="mt-16 cosmos-card p-8 text-center">
          <Sparkles className="h-8 w-8 text-cosmic-gold-400 mx-auto mb-4" />
          <h2 className="text-2xl font-display mb-4">Share Your Wisdom</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-6">
            Are you an expert in your field? Join our community of mentors and help others on their journey to mastery.
          </p>
          <button className="btn-primary">
            {t('mentorship.becomeMentor')}
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && selectedMentor && (
        <div className="fixed inset-0 bg-cosmic-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="cosmos-card max-w-md w-full p-6">
            <h3 className="text-xl font-display mb-4">Book a Session with {selectedMentor.name}</h3>
            
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <img
                  src={selectedMentor.imageUrl}
                  alt={selectedMentor.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="text-cosmic-gold-400">{selectedMentor.specialty}</p>
                  <span className={`badge ${getRankBadgeClass(selectedMentor.rank)}`}>
                    {t(`ranks.${selectedMentor.rank}`)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                  <span>
                    {selectedMentor.price} {selectedMentor.currency}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                  <span>{selectedMentor.sessionLength} min</span>
                </div>
              </div>
              
              <div className="bg-cosmic-black/30 p-4 rounded-md mb-6">
                <h4 className="text-sm font-medium text-cosmic-gold-400 mb-2">Available Times</h4>
                <p className="text-white/70 text-sm">{selectedMentor.availability}</p>
              </div>
              
              {/* Mock payment options */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-cosmic-gold-400 mb-2">Payment Method</h4>
                <select className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white">
                  <option>Credit Card</option>
                  <option>PayPal</option>
                  <option>Crypto</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleBooking}
                className="btn-primary flex-1"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipPage;