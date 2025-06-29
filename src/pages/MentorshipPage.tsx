import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, Star, Sparkles, Loader2, User, MapPin } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface Mentor {
  id: string;
  username: string;
  specialty: string;
  price: number;
  currency: string;
  session_length: number;
  availability: string;
  bio: string;
  category: string;
  points: number;
  rank: string;
  avatar_url?: string;
}

const categories = [
  'All Categories',
  'Programming',
  'Design',
  'Business',
  'Music',
  'Data Science',
  'AI & Machine Learning'
];

// Mock mentor data for hackathon demo
const mockMentors: Mentor[] = [
  {
    id: '1',
    username: 'Dr. Sarah Chen',
    specialty: 'Full-Stack Development & React',
    price: 75,
    currency: 'USD',
    session_length: 60,
    availability: 'Mon-Fri, 9AM-6PM EST',
    bio: 'Senior Software Engineer with 8+ years experience in React, Node.js, and cloud architecture. Former Google engineer passionate about teaching clean code practices.',
    category: 'Programming',
    points: 1850,
    rank: 'cosmic_sage',
    avatar_url: '/images/avatar1.jpg'
  },
  {
    id: '2',
    username: 'Alex Rodriguez',
    specialty: 'UI/UX Design & Product Strategy',
    price: 65,
    currency: 'USD',
    session_length: 45,
    availability: 'Tue-Sat, 10AM-8PM PST',
    bio: 'Product Designer with expertise in user research, prototyping, and design systems. Helped scale design teams at Airbnb and Stripe.',
    category: 'Design',
    points: 1420,
    rank: 'galactic_guide',
    avatar_url: '/images/avatar2.jpg'
  },
  {
    id: '3',
    username: 'Dr. Maya Patel',
    specialty: 'Machine Learning & Data Science',
    price: 90,
    currency: 'USD',
    session_length: 90,
    availability: 'Mon-Thu, 2PM-10PM GMT',
    bio: 'ML Research Scientist with PhD from MIT. Specializes in deep learning, computer vision, and ethical AI. Published 20+ papers.',
    category: 'AI & Machine Learning',
    points: 2100,
    rank: 'cosmic_sage',
    avatar_url: '/images/avatar3.jpg'
  },
  {
    id: '4',
    username: 'Marcus Johnson',
    specialty: 'Startup Strategy & Fundraising',
    price: 120,
    currency: 'USD',
    session_length: 60,
    availability: 'Mon-Fri, 8AM-5PM EST',
    bio: 'Serial entrepreneur with 3 successful exits. Expert in startup growth, fundraising, and scaling operations. Mentor at Y Combinator.',
    category: 'Business',
    points: 1680,
    rank: 'cosmic_sage',
    avatar_url: '/images/avatar4.jpg'
  },
  {
    id: '5',
    username: 'Elena Vasquez',
    specialty: 'Music Production & Audio Engineering',
    price: 55,
    currency: 'USD',
    session_length: 60,
    availability: 'Wed-Sun, 12PM-9PM PST',
    bio: 'Grammy-nominated producer and audio engineer. Specializes in electronic music, mixing, and mastering. Worked with major labels.',
    category: 'Music',
    points: 1350,
    rank: 'galactic_guide',
    avatar_url: '/images/avatar5.jpg'
  },
  {
    id: '6',
    username: 'David Kim',
    specialty: 'Python & Data Engineering',
    price: 70,
    currency: 'USD',
    session_length: 60,
    availability: 'Mon-Fri, 9AM-7PM EST',
    bio: 'Senior Data Engineer with expertise in Python, Apache Spark, and cloud data platforms. Built data pipelines for Fortune 500 companies.',
    category: 'Data Science',
    points: 1580,
    rank: 'comet_crafter',
    avatar_url: '/images/avatar1.jpg'
  }
];

const MentorshipPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for demo
    const timer = setTimeout(() => {
      setMentors(mockMentors);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredMentors = selectedCategory === 'All Categories'
    ? mentors
    : mentors.filter(mentor => 
        mentor.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        mentor.specialty.toLowerCase().includes(selectedCategory.toLowerCase())
      );

  const bookSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowModal(true);
  };

  const handleBooking = () => {
    toast({
      title: 'Session Booked!',
      description: `Your session with ${selectedMentor?.username} has been scheduled.`,
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

  if (loading) {
    return (
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 text-cosmic-purple-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="font-display mb-4">Find a Mentor</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Learn directly from experts in your field. Get personalized guidance and accelerate your learning journey.
          </p>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-xl font-display mb-6">Categories</h2>
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
            No mentors found in this category yet.
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
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-cosmic-purple-800/30 to-cosmic-blue-800/30 flex items-center justify-center">
                  {mentor.avatar_url ? (
                    <img
                      src={mentor.avatar_url}
                      alt={mentor.username}
                      className="w-24 h-24 rounded-full object-cover border-2 border-cosmic-gold-400"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-cosmic-purple-800 flex items-center justify-center border-2 border-cosmic-gold-400">
                      <User className="h-12 w-12 text-cosmic-gold-400" />
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4">
                    <div className="bg-cosmic-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                      <span className="text-cosmic-gold-400 font-medium">{mentor.rank.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-display mb-1">{mentor.username}</h3>
                      <p className="text-sm text-cosmic-purple-300 mb-2">{mentor.specialty}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-cosmic-gold-400">
                        ${mentor.price}
                      </div>
                      <div className="text-xs text-gray-400">per session</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-4 line-clamp-3">{mentor.bio}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-2" />
                      {mentor.session_length} min sessions
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="h-3 w-3 mr-2" />
                      {mentor.availability}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <MapPin className="h-3 w-3 mr-2" />
                      Remote
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">4.9</span>
                      <span className="text-xs text-gray-400 ml-1">(127 reviews)</span>
                    </div>
                    <button
                      onClick={() => bookSession(mentor)}
                      className="btn-primary text-xs px-4 py-2"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="cosmos-card max-w-md w-full"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-display mb-2">Book Session with {selectedMentor.username}</h3>
              <p className="text-sm text-gray-400">{selectedMentor.specialty}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Session Length:</span>
                <span>{selectedMentor.session_length} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price:</span>
                <span className="text-cosmic-gold-400 font-bold">${selectedMentor.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Availability:</span>
                <span className="text-sm">{selectedMentor.availability}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                className="btn-primary flex-1"
              >
                Confirm Booking
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MentorshipPage;