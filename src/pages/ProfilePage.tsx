import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Edit2, BookOpen, Sparkles, Trophy, Plus, Save, X, 
  Loader2, BadgeCheck, UserCircle, Briefcase, Award, ArrowRight
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../hooks/useToast';
import { useSupabase } from '../lib/supabase/SupabaseProvider';

// Default avatars
const defaultAvatars = [
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
  'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
];

// Rank-based avatars (locked until user reaches rank)
const rankAvatars = {
  bronze: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1', // 500 points
  silver: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1', // 1000 points
  gold: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1', // 1500 points
};

const ProfilePage: React.FC = () => {
  const { user, isLoading, updateProfile } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const supabase = useSupabase();
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [profileData, setProfileData] = useState({
    bio: '',
    skills: [] as string[],
    workExperience: [] as string[],
    projects: [] as string[],
    certifications: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/auth/signin');
      return;
    }

    if (user) {
      setProfileData({
        bio: user.bio || '',
        skills: user.skills || [],
        workExperience: [],
        projects: [],
        certifications: [],
      });
      setSelectedAvatar(user.avatar_url || defaultAvatars[0]);
      
      // If user has no profile data, start in editing mode
      if (!user.bio && (!user.skills || user.skills.length === 0)) {
        setIsEditing(true);
      }
    }
  }, [user, isLoading, navigate]);

  const calculatePoints = () => {
    let points = 0;
    points += profileData.skills.length * 10;
    points += profileData.workExperience.length * 25;
    points += profileData.projects.length * 20;
    points += profileData.certifications.length * 30;
    points += profileData.bio ? 50 : 0;
    return points;
  };

  const calculateRank = (points: number): string => {
    if (points >= 1500) return 'cosmic_sage';
    if (points >= 1000) return 'galactic_guide';
    if (points >= 500) return 'comet_crafter';
    if (points >= 250) return 'astral_apprentice';
    if (points >= 100) return 'nebula_novice';
    return 'starspark';
  };

  const addItem = (type: 'skills' | 'workExperience' | 'projects' | 'certifications', value: string) => {
    if (value.trim() && !profileData[type].includes(value.trim())) {
      setProfileData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
      
      // Clear the input
      if (type === 'skills') setNewSkill('');
      if (type === 'workExperience') setNewExperience('');
      if (type === 'projects') setNewProject('');
      if (type === 'certifications') setNewCertification('');
    }
  };

  const removeItem = (type: 'skills' | 'workExperience' | 'projects' | 'certifications', index: number) => {
    setProfileData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const points = calculatePoints();
      const rank = calculateRank(points);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: profileData.bio,
          skills: profileData.skills,
          points: points,
          avatar_url: selectedAvatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Profile Updated!',
        description: `You earned ${points} points and reached ${rank.replace('_', ' ')} rank!`,
      });
      
      setIsEditing(false);
      
      if (updateProfile) {
        updateProfile({
          bio: profileData.bio,
          skills: profileData.skills,
          points: points,
          avatar_url: selectedAvatar,
        });
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

  const isAvatarUnlocked = (avatar: string, rank: string) => {
    const userPoints = user?.points || 0;
    if (avatar === rankAvatars.bronze) return userPoints >= 500;
    if (avatar === rankAvatars.silver) return userPoints >= 1000;
    if (avatar === rankAvatars.gold) return userPoints >= 1500;
    return true; // Default avatars are always unlocked
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cosmic-purple-500 animate-spin" />
      </div>
    );
  }

  const currentPoints = calculatePoints();
  const currentRank = calculateRank(currentPoints);

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          className="cosmos-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-display">Your Profile</h1>
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
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
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center text-sm"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="flex flex-col items-center text-center mb-6">
                {/* Avatar Selection */}
                {isEditing ? (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-3">Choose Avatar</h3>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {defaultAvatars.map((avatar, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedAvatar(avatar)}
                          className={`w-16 h-16 rounded-full overflow-hidden border-2 ${
                            selectedAvatar === avatar ? 'border-cosmic-gold-400' : 'border-gray-600'
                          }`}
                        >
                          <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(rankAvatars).map(([rank, avatar]) => (
                        <button
                          key={rank}
                          onClick={() => isAvatarUnlocked(avatar, rank) && setSelectedAvatar(avatar)}
                          className={`w-16 h-16 rounded-full overflow-hidden border-2 relative ${
                            selectedAvatar === avatar ? 'border-cosmic-gold-400' : 'border-gray-600'
                          } ${!isAvatarUnlocked(avatar, rank) ? 'opacity-50' : ''}`}
                          disabled={!isAvatarUnlocked(avatar, rank)}
                        >
                          <img src={avatar} alt={`${rank} avatar`} className="w-full h-full object-cover" />
                          {!isAvatarUnlocked(avatar, rank) && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Trophy className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                    <img src={selectedAvatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <h2 className="text-xl font-display mb-1">{user.username}</h2>
                <div className="mb-4">
                  <span className="badge bg-cosmic-purple-900 text-cosmic-purple-100">
                    {currentRank.replace('_', ' ')}
                  </span>
                </div>
                <div className="bg-cosmic-black/30 px-4 py-2 rounded-full mb-2 flex items-center">
                  <Trophy className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                  <span className="text-sm">
                    {currentPoints} Points
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              {/* Bio Section */}
              <div className="mb-8">
                <h3 className="text-lg font-display mb-3">Bio</h3>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 min-h-[100px]"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-white/80">
                    {profileData.bio || "No bio available. Click 'Edit Profile' to add one."}
                  </p>
                )}
              </div>

              {/* Skills Section */}
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
                        onKeyPress={(e) => e.key === 'Enter' && addItem('skills', newSkill)}
                        className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-l-md px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 text-sm"
                        placeholder="Add skill..."
                      />
                      <button
                        onClick={() => addItem('skills', newSkill)}
                        className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-r-md px-2 py-1"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.length === 0 ? (
                    <p className="text-white/50 text-sm">No skills added yet.</p>
                  ) : (
                    profileData.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center bg-cosmic-purple-900/50 rounded-md px-3 py-1 text-sm"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => removeItem('skills', index)}
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

              {/* Work Experience Section */}
              {isEditing && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-display flex items-center">
                      <Briefcase className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                      Work Experience
                    </h3>
                    <div className="flex">
                      <input
                        type="text"
                        value={newExperience}
                        onChange={(e) => setNewExperience(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addItem('workExperience', newExperience)}
                        className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-l-md px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 text-sm"
                        placeholder="Add experience..."
                      />
                      <button
                        onClick={() => addItem('workExperience', newExperience)}
                        className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-r-md px-2 py-1"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {profileData.workExperience.map((exp, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center bg-cosmic-blue-900/50 rounded-md px-3 py-1 text-sm"
                      >
                        {exp}
                        <button
                          onClick={() => removeItem('workExperience', index)}
                          className="ml-2 text-white/70 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              {isEditing && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-display flex items-center">
                      <BookOpen className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                      Projects
                    </h3>
                    <div className="flex">
                      <input
                        type="text"
                        value={newProject}
                        onChange={(e) => setNewProject(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addItem('projects', newProject)}
                        className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-l-md px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 text-sm"
                        placeholder="Add project..."
                      />
                      <button
                        onClick={() => addItem('projects', newProject)}
                        className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-r-md px-2 py-1"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {profileData.projects.map((project, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center bg-cosmic-gold-900/50 rounded-md px-3 py-1 text-sm"
                      >
                        {project}
                        <button
                          onClick={() => removeItem('projects', index)}
                          className="ml-2 text-white/70 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications Section */}
              {isEditing && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-display flex items-center">
                      <Award className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                      Certifications
                    </h3>
                    <div className="flex">
                      <input
                        type="text"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addItem('certifications', newCertification)}
                        className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-l-md px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 text-sm"
                        placeholder="Add certification..."
                      />
                      <button
                        onClick={() => addItem('certifications', newCertification)}
                        className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-r-md px-2 py-1"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {profileData.certifications.map((cert, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center bg-cosmic-purple-900/50 rounded-md px-3 py-1 text-sm"
                      >
                        {cert}
                        <button
                          onClick={() => removeItem('certifications', index)}
                          className="ml-2 text-white/70 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Points Summary */}
              <div className="bg-cosmic-black/20 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-display mb-4">Points Breakdown</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Skills: {profileData.skills.length} × 10 = {profileData.skills.length * 10} pts</div>
                  <div>Bio: {profileData.bio ? '1 × 50 = 50' : '0 × 50 = 0'} pts</div>
                  <div>Experience: {profileData.workExperience.length} × 25 = {profileData.workExperience.length * 25} pts</div>
                  <div>Projects: {profileData.projects.length} × 20 = {profileData.projects.length * 20} pts</div>
                  <div>Certifications: {profileData.certifications.length} × 30 = {profileData.certifications.length * 30} pts</div>
                  <div className="font-bold text-cosmic-gold-400">Total: {currentPoints} pts</div>
                </div>
              </div>

              {/* Navigation to Skill Swap */}
              {!isEditing && (
                <div className="text-center">
                  <button
                    onClick={() => navigate('/skill-swap')}
                    className="btn-primary flex items-center justify-center mx-auto"
                  >
                    Start Learning Journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;