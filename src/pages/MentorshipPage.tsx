import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, Star, Sparkles, Loader2, User, MapPin } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useSupabase } from '../lib/supabase/SupabaseProvider';

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

const MentorshipPage: React.FC = () => {
  const { toast } = useToast();
  const supabase = useSupabase();
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('mentorship_profiles')
        .select(`
          *,
          profiles!inner(username, points, avatar_url)
        `);
      
      if (error) throw error;
      
      const formattedMentors = data?.map(mentor => ({
        id: mentor.id,
        username: mentor.profiles.username,
        specialty: mentor.specialty,
        price: mentor.price,
        currency: mentor.currency,
        session_length: mentor.session_length,
        availability: mentor.availability,
        bio: mentor.bio,
        category: mentor.category,
        points: mentor.profiles.points,
        rank: mentor.profiles.points >= 1601 ? 'cosmic_sage' :
              mentor.profiles.points >= 1201 ? 'galactic_guide' :
              mentor.profiles.points >= 801 ? 'comet_crafter' :
              mentor.profiles.points >= 501 ? 'astral_apprentice' :
              mentor.profiles.points >= 251 ? 'nebula_novice' : 'starspark',
        avatar_url: mentor.profiles.avatar_url
      })) || [];
      
      setMentors(formattedMentors);
    } catch (error) {
      console.error('Error loading mentors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mentors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
                  <div className="absolute top-4 right-4 bg-cosmic-black/70 px-2 py-1 rounded-full flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                    <span className="text-xs text-white">4.8</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-display">{mentor.username}</h3>
                    <p className="text-cosmic-gold-400 text-sm">{mentor.specialty}</p>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <span className={`badge ${
                        mentor.rank === 'cosmic_sage' ? 'bg-cosmic-gold-800 text-cosmic-gold-100' :
                        mentor.rank === 'galactic_guide' ? 'bg-cosmic-purple-800 text-cosmic-purple-100' :
                        'bg-cosmic-blue-800 text-cosmic-blue-100'
                      } mr-2`}>
                        {mentor.rank.replace('_', ' ')}
                      </span>
                      <span>{mentor.points} points</span>
                    </div>
                  </div>

                  <p className="text-white/70 text-sm mb-4 line-clamp-3">
                    {mentor.bio}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                      <span>
                        ${mentor.price} / session
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                      <span>{mentor.session_length} min</span>
                    </div>
                    <div className="flex items-center text-sm col-span-2">
                      <Calendar className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                      <span className="text-xs">{mentor.availability}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => bookSession(mentor)}
                      className="btn-primary flex-1"
                    >
                      Book Session
                    </button>
                    <button className="btn-secondary flex-1">
                      View Profile
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
            Become a Mentor
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && selectedMentor && (
        <div className="fixed inset-0 bg-cosmic-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="cosmos-card max-w-md w-full p-6">
            <h3 className="text-xl font-display mb-4">Book a Session with {selectedMentor.username}</h3>
            
            <div className="mb-6">
              <div className="flex items-center mb-4">
                {selectedMentor.avatar_url ? (
                  <img
                    src={selectedMentor.avatar_url}
                    alt={selectedMentor.username}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-cosmic-purple-800 flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-cosmic-gold-400" />
                  </div>
                )}
                <div>
                  <p className="text-cosmic-gold-400">{selectedMentor.specialty}</p>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                    <span className="text-xs">4.8 (152 sessions)</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                  <span>
                    ${selectedMentor.price} {selectedMentor.currency}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                  <span>{selectedMentor.session_length} min</span>
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