import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  User, Edit2, BookOpen, Sparkles, Trophy, Plus, Save, X, 
  Loader2, BadgeCheck, UserCircle
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../hooks/useToast';
import { useSupabase } from '../lib/supabase/SupabaseProvider';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading, updateProfile } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const supabase = useSupabase();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    bio: user?.bio || '',
    skills: user?.skills || [],
    learning_goals: user?.learning_goals || [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [saving, setSaving] = useState(false);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user && !isLoading) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to view your profile',
      });
      navigate('/auth/signup');
    }
  }, [user, isLoading, navigate, toast]);

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    // Reset to original values
    setEditedProfile({
      bio: user?.bio || '',
      skills: user?.skills || [],
      learning_goals: user?.learning_goals || [],
    });
    setNewSkill('');
    setNewGoal('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile({ ...editedProfile, [name]: value });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !editedProfile.skills.includes(newSkill.trim())) {
      setEditedProfile({
        ...editedProfile,
        skills: [...editedProfile.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = [...editedProfile.skills];
    updatedSkills.splice(index, 1);
    setEditedProfile({ ...editedProfile, skills: updatedSkills });
  };

  const handleAddGoal = () => {
    if (newGoal.trim() && !editedProfile.learning_goals.includes(newGoal.trim())) {
      setEditedProfile({
        ...editedProfile,
        learning_goals: [...editedProfile.learning_goals, newGoal.trim()],
      });
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    const updatedGoals = [...editedProfile.learning_goals];
    updatedGoals.splice(index, 1);
    setEditedProfile({ ...editedProfile, learning_goals: updatedGoals });
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: editedProfile.bio,
          skills: editedProfile.skills,
          learning_goals: editedProfile.learning_goals,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      
      setIsEditing(false);
      
      // Update profile using the context
      if (updateProfile) {
        updateProfile(editedProfile);
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cosmic-purple-500 animate-spin" />
      </div>
    );
  }

  const calculateRank = (points: number): string => {
    if (points >= 1601) return 'cosmic_sage';
    if (points >= 1201) return 'galactic_guide';
    if (points >= 801) return 'comet_crafter';
    if (points >= 501) return 'astral_apprentice';
    if (points >= 251) return 'nebula_novice';
    return 'starspark';
  };

  const rank = calculateRank(user.points || 0);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          className="cosmos-card p-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-display">Your Profile</h1>
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelEditing}
                  className="btn-secondary flex items-center text-sm px-3 py-1"
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="btn-primary flex items-center text-sm px-3 py-1"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartEditing}
                className="btn-secondary flex items-center text-sm"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Profile Overview */}
            <div className="md:col-span-1">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-cosmic-purple-800/50 flex items-center justify-center mb-4 relative">
                  <UserCircle className="w-16 h-16 text-white/70" />
                </div>
                <h2 className="text-xl font-display mb-1">{user.username}</h2>
                <div className="mb-4">
                  <span className="badge bg-cosmic-purple-900 text-cosmic-purple-100">
                    {rank.replace('_', ' ')}
                  </span>
                </div>
                <div className="bg-cosmic-black/30 px-4 py-2 rounded-full mb-2 flex items-center">
                  <Trophy className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                  <span className="text-sm">
                    {user.points || 0} Points
                  </span>
                </div>
              </div>

              <div className="bg-cosmic-black/20 rounded-lg p-4 mb-6">
                <h3 className="text-sm uppercase tracking-wider text-cosmic-gold-400 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Account Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-white/50">Username</p>
                    <p>{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50">Member Since</p>
                    <p>{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details & Editable Fields */}
            <div className="md:col-span-2">
              {/* Bio */}
              <div className="mb-8">
                <h3 className="text-lg font-display mb-3">Bio</h3>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={editedProfile.bio}
                    onChange={handleChange}
                    className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 min-h-[100px]"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-white/80">
                    {user.bio || "No bio available. Click 'Edit Profile' to add one."}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-display flex items-center">
                    <Sparkles className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                    Skills
                  </h3>
                  {isEditing && (
                    <div className="flex">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-l-md px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 text-sm"
                        placeholder="Add skill..."
                      />
                      <button
                        onClick={handleAddSkill}
                        className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-r-md px-2 py-1"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {editedProfile.skills.length === 0 ? (
                    <p className="text-white/50 text-sm">No skills added yet.</p>
                  ) : (
                    editedProfile.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center bg-cosmic-purple-900/50 rounded-md px-3 py-1 text-sm"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveSkill(index)}
                            className="ml-2 text-white/70 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Learning Goals */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-display flex items-center">
                    <BookOpen className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                    Learning Goals
                  </h3>
                  {isEditing && (
                    <div className="flex">
                      <input
                        type="text"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-l-md px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 text-sm"
                        placeholder="Add goal..."
                      />
                      <button
                        onClick={handleAddGoal}
                        className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-r-md px-2 py-1"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {editedProfile.learning_goals.length === 0 ? (
                    <p className="text-white/50 text-sm">No learning goals added yet.</p>
                  ) : (
                    editedProfile.learning_goals.map((goal, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center bg-cosmic-blue-900/50 rounded-md px-3 py-1 text-sm"
                      >
                        {goal}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveGoal(index)}
                            className="ml-2 text-white/70 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Verification Section */}
              <div className="mt-8 bg-cosmic-black/20 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <BadgeCheck className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                  <h3 className="text-lg font-display">Verification & Ranking</h3>
                </div>
                <p className="text-white/70 mb-4">
                  Upload your CV or portfolio to verify your skills and increase your knowledge points.
                </p>
                <button className="btn-secondary text-sm">
                  Upload Documents
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;