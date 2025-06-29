import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Edit2, BookOpen, Sparkles, Trophy, Plus, Save, X, 
  Loader2, BadgeCheck, UserCircle, Briefcase, Award, ArrowRight,
  Calendar, MapPin, ExternalLink, Building, CheckCircle, TrendingUp,
  Target, Star, Clock
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../hooks/useToast';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { EnhancedProfileEditor } from '../components/profile/EnhancedProfileEditor';
import { usePointsService } from '../services/pointsService';

// Avatar configuration with the uploaded images
const defaultAvatars = [
  '/images/avatar1.jpg', // Professional avatar
  '/images/avatar2.jpg', // Cosmic/futuristic avatar
  '/images/avatar3.jpg', // Mystical/magical avatar
];

// Rank-based avatars (locked until user reaches rank)
const rankAvatars = {
  comet_crafter: '/images/avatar5.jpg', // 801 points - Master/Scholar
  galactic_guide: '/images/avatar4.jpg', // 1201 points - Cosmic Sage/Wizard
  cosmic_sage: '/images/avatar4.jpg', // 1601 points - Ultimate Cosmic Sage
};

interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate: string;
  url?: string;
  achievements: string[];
}

interface Certification {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

const ProfilePage: React.FC = () => {
  const { user, isLoading, updateProfile } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const supabase = useSupabase();
  const pointsService = usePointsService();
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [profileData, setProfileData] = useState({
    bio: '',
    skills: [] as string[],
    learning_goals: [] as string[],
    workExperience: [] as WorkExperience[],
    projects: [] as Project[],
    certifications: [] as Certification[],
  });
  
  // Form states for adding new items
  const [newSkill, setNewSkill] = useState('');
  const [newLearningGoal, setNewLearningGoal] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'projects' | 'certifications' | 'achievements'>('overview');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/auth/signin');
      return;
    }

    if (user) {
      setProfileData({
        bio: user.bio || '',
        skills: user.skills || [],
        learning_goals: user.learning_goals || [],
        workExperience: user.work_experience || [],
        projects: user.projects || [],
        certifications: user.certifications || [],
      });
      setSelectedAvatar(user.avatar_url || defaultAvatars[0]);
      
      // Load points history
      loadPointsHistory();
      
      // If user has no profile data, start in editing mode
      if (!user.bio && (!user.skills || user.skills.length === 0)) {
        setIsEditing(true);
      }
    }
  }, [user, isLoading, navigate]);

  const loadPointsHistory = async () => {
    if (!user) return;
    
    try {
      const history = await pointsService.getPointsHistory(user.id);
      setPointsHistory(history);
    } catch (error) {
      console.error('Error loading points history:', error);
    }
  };

  const calculatePoints = () => {
    let points = 0;
    points += profileData.skills.length * 10;
    points += profileData.learning_goals.length * 5;
    points += profileData.workExperience.length * 50;
    points += profileData.projects.length * 30;
    points += profileData.certifications.length * 40;
    points += profileData.bio ? 50 : 0;
    
    // Bonus points for detailed entries
    profileData.workExperience.forEach(exp => {
      if (exp.achievements && exp.achievements.length > 0) points += exp.achievements.length * 10;
    });
    profileData.projects.forEach(proj => {
      if (proj.achievements && proj.achievements.length > 0) points += proj.achievements.length * 10;
    });
    
    return points;
  };

  const calculateRank = (points: number): string => {
    if (points >= 1601) return 'cosmic_sage';
    if (points >= 1201) return 'galactic_guide';
    if (points >= 801) return 'comet_crafter';
    if (points >= 501) return 'astral_apprentice';
    if (points >= 251) return 'nebula_novice';
    return 'starspark';
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addLearningGoal = () => {
    if (newLearningGoal.trim() && !profileData.learning_goals.includes(newLearningGoal.trim())) {
      setProfileData(prev => ({
        ...prev,
        learning_goals: [...prev.learning_goals, newLearningGoal.trim()]
      }));
      setNewLearningGoal('');
    }
  };

  const removeLearningGoal = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      learning_goals: prev.learning_goals.filter((_, i) => i !== index)
    }));
  };

  const validateProfileData = () => {
    const errors: string[] = [];
    
    if (profileData.skills.length === 0) {
      errors.push('At least one skill is required');
    }
    
    if (!profileData.bio || profileData.bio.trim().length < 10) {
      errors.push('Bio must be at least 10 characters long');
    }
    
    return errors;
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    // Validate data before saving
    const validationErrors = validateProfileData();
    if (validationErrors.length > 0) {
      toast({
        title: 'Validation Error',
        description: validationErrors.join(', '),
        variant: 'destructive',
      });
      return;
    }
    
    setSaving(true);
    try {
      const points = calculatePoints();
      const rank = calculateRank(points);
      
      const updateData = {
        bio: profileData.bio,
        skills: profileData.skills,
        learning_goals: profileData.learning_goals,
        work_experience: profileData.workExperience,
        projects: profileData.projects,
        certifications: profileData.certifications,
        points: points,
        avatar_url: selectedAvatar,
      };
      
      const { error } = await updateProfile(updateData);
      
      if (error) {
        throw error;
      }

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      toast({
        title: 'Profile Updated! 🎉',
        description: `You earned ${points} points and reached ${rank.replace('_', ' ')} rank!`,
      });
      
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

  const isAvatarUnlocked = (avatar: string) => {
    const userPoints = user?.points || 0;
    if (avatar === rankAvatars.comet_crafter) return userPoints >= 801;
    if (avatar === rankAvatars.galactic_guide) return userPoints >= 1201;
    if (avatar === rankAvatars.cosmic_sage) return userPoints >= 1601;
    return true; // Default avatars are always unlocked
  };

  const getNextRankInfo = () => {
    const currentPoints = user?.points || 0;
    return pointsService.getPointsForNextRank(currentPoints);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
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
  const nextRankInfo = getNextRankInfo();

  return (
    <div className="pt-24 pb-20 px-4 smooth-scroll">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="cosmos-card p-8 mb-8"
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
                  ) : saveSuccess ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save'}
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <div className="flex flex-col items-center text-center mb-6">
                {/* Avatar Selection */}
                {isEditing ? (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-3">Choose Avatar</h3>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {defaultAvatars.map((avatar, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedAvatar(avatar)}
                          className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                            selectedAvatar === avatar ? 'border-cosmic-gold-400 scale-105' : 'border-gray-600'
                          }`}
                        >
                          <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(rankAvatars).map(([rank, avatar]) => (
                        <button
                          key={rank}
                          onClick={() => isAvatarUnlocked(avatar) && setSelectedAvatar(avatar)}
                          className={`w-16 h-16 rounded-full overflow-hidden border-2 relative transition-all ${
                            selectedAvatar === avatar ? 'border-cosmic-gold-400 scale-105' : 'border-gray-600'
                          } ${!isAvatarUnlocked(avatar) ? 'opacity-50' : ''}`}
                          disabled={!isAvatarUnlocked(avatar)}
                        >
                          <img src={avatar} alt={`${rank} avatar`} className="w-full h-full object-cover" />
                          {!isAvatarUnlocked(avatar) && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Trophy className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-cosmic-gold-400">
                    <img src={selectedAvatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <h2 className="text-xl font-display mb-1">{user.username}</h2>
                <div className="mb-4">
                  <span className="badge bg-cosmic-purple-900 text-cosmic-purple-100">
                    {currentRank.replace('_', ' ')}
                  </span>
                </div>
                
                {/* Points and Progress */}
                <div className="w-full space-y-3">
                  <div className="bg-cosmic-black/30 px-4 py-2 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-cosmic-gold-400 mr-2" />
                    <span className="text-sm font-medium">
                      {user.points || 0} Points
                    </span>
                  </div>
                  
                  {nextRankInfo.pointsNeeded > 0 && (
                    <div className="w-full">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Next: {nextRankInfo.nextRank.replace('_', ' ')}</span>
                        <span>{nextRankInfo.pointsNeeded} more</span>
                      </div>
                      <div className="w-full bg-cosmic-black/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cosmic-purple-500 to-cosmic-gold-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, ((user.points || 0) / ((user.points || 0) + nextRankInfo.pointsNeeded)) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'experience', label: 'Experience', icon: Briefcase },
                  { id: 'projects', label: 'Projects', icon: BookOpen },
                  { id: 'certifications', label: 'Certifications', icon: Award },
                  { id: 'achievements', label: 'Achievements', icon: Trophy },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-cosmic-purple-600 text-white'
                        : 'bg-cosmic-black/30 text-white/70 hover:bg-cosmic-black/50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Bio Section */}
                  <div>
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
                  <div>
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
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-l-md px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 text-sm"
                            placeholder="Add skill..."
                          />
                          <button
                            onClick={addSkill}
                            className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-r-md px-2 py-1"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
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
                                onClick={() => removeSkill(index)}
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

                  {/* Learning Goals Section */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-display flex items-center">
                        <BookOpen className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                        Learning Goals
                      </h3>
                      {isEditing && (
                        <div className="flex">
                          <input
                            type="text"
                            value={newLearningGoal}
                            onChange={(e) => setNewLearningGoal(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addLearningGoal()}
                            className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-l-md px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 text-sm"
                            placeholder="Add learning goal..."
                          />
                          <button
                            onClick={addLearningGoal}
                            className="bg-cosmic-blue-600 hover:bg-cosmic-blue-700 text-white rounded-r-md px-2 py-1"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {profileData.learning_goals.length === 0 ? (
                        <p className="text-white/50 text-sm">No learning goals added yet.</p>
                      ) : (
                        profileData.learning_goals.map((goal, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center bg-cosmic-blue-900/50 rounded-md px-3 py-1 text-sm"
                          >
                            {goal}
                            {isEditing && (
                              <button
                                onClick={() => removeLearningGoal(index)}
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

                  {/* Points Summary */}
                  <div className="bg-cosmic-black/20 rounded-lg p-4">
                    <h3 className="text-lg font-display mb-4">Points Breakdown</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Skills: {profileData.skills.length} × 10 = {profileData.skills.length * 10} pts</div>
                      <div>Goals: {profileData.learning_goals.length} × 5 = {profileData.learning_goals.length * 5} pts</div>
                      <div>Bio: {profileData.bio ? '1 × 50 = 50' : '0 × 50 = 0'} pts</div>
                      <div>Experience: {profileData.workExperience.length} × 50 = {profileData.workExperience.length * 50} pts</div>
                      <div>Projects: {profileData.projects.length} × 30 = {profileData.projects.length * 30} pts</div>
                      <div>Certifications: {profileData.certifications.length} × 40 = {profileData.certifications.length * 40} pts</div>
                      <div className="font-bold text-cosmic-gold-400 col-span-2">Total: {currentPoints} pts</div>
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
              )}

              {activeTab === 'experience' && (
                <div className="space-y-6">
                  {isEditing ? (
                    <EnhancedProfileEditor
                      workExperience={profileData.workExperience}
                      projects={profileData.projects}
                      certifications={profileData.certifications}
                      onUpdateWorkExperience={(experiences) => setProfileData(prev => ({ ...prev, workExperience: experiences }))}
                      onUpdateProjects={(projects) => setProfileData(prev => ({ ...prev, projects: projects }))}
                      onUpdateCertifications={(certifications) => setProfileData(prev => ({ ...prev, certifications: certifications }))}
                    />
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-display flex items-center">
                          <Briefcase className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                          Work Experience
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {profileData.workExperience.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No work experience added yet</p>
                            <p className="text-sm">Click 'Edit Profile' to add your professional experience</p>
                          </div>
                        ) : (
                          profileData.workExperience.map((exp) => (
                            <div key={exp.id} className="bg-cosmic-black/30 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium text-cosmic-gold-400">{exp.jobTitle}</h4>
                                  <div className="flex items-center text-white/80 mb-1">
                                    <Building className="h-4 w-4 mr-1" />
                                    {exp.company}
                                  </div>
                                  {exp.location && (
                                    <div className="flex items-center text-white/60 text-sm mb-1">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {exp.location}
                                    </div>
                                  )}
                                  <div className="flex items-center text-white/60 text-sm">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                                  </div>
                                </div>
                              </div>
                              {exp.description && (
                                <p className="text-white/70 text-sm mt-2">{exp.description}</p>
                              )}
                              {exp.achievements && exp.achievements.length > 0 && (
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium text-cosmic-gold-300 mb-2">Key Achievements:</h5>
                                  <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                                    {exp.achievements.map((achievement, index) => (
                                      <li key={index}>{achievement}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-6">
                  {isEditing ? (
                    <EnhancedProfileEditor
                      workExperience={profileData.workExperience}
                      projects={profileData.projects}
                      certifications={profileData.certifications}
                      onUpdateWorkExperience={(experiences) => setProfileData(prev => ({ ...prev, workExperience: experiences }))}
                      onUpdateProjects={(projects) => setProfileData(prev => ({ ...prev, projects: projects }))}
                      onUpdateCertifications={(certifications) => setProfileData(prev => ({ ...prev, certifications: certifications }))}
                    />
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-display flex items-center">
                          <BookOpen className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                          Projects
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {profileData.projects.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No projects added yet</p>
                            <p className="text-sm">Click 'Edit Profile' to showcase your work</p>
                          </div>
                        ) : (
                          profileData.projects.map((project) => (
                            <div key={project.id} className="bg-cosmic-black/30 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="flex items-center">
                                    <h4 className="font-medium text-cosmic-gold-400">{project.name}</h4>
                                    {project.url && (
                                      <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-cosmic-blue-400 hover:text-cosmic-blue-300"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    )}
                                  </div>
                                  <div className="flex items-center text-white/60 text-sm">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                                  </div>
                                </div>
                              </div>
                              <p className="text-white/70 text-sm">{project.description}</p>
                              {project.technologies && project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {project.technologies.map((tech, index) => (
                                    <span key={index} className="text-xs bg-cosmic-blue-900/30 rounded px-2 py-1">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {project.achievements && project.achievements.length > 0 && (
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium text-cosmic-gold-300 mb-2">Key Achievements:</h5>
                                  <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                                    {project.achievements.map((achievement, index) => (
                                      <li key={index}>{achievement}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'certifications' && (
                <div className="space-y-6">
                  {isEditing ? (
                    <EnhancedProfileEditor
                      workExperience={profileData.workExperience}
                      projects={profileData.projects}
                      certifications={profileData.certifications}
                      onUpdateWorkExperience={(experiences) => setProfileData(prev => ({ ...prev, workExperience: experiences }))}
                      onUpdateProjects={(projects) => setProfileData(prev => ({ ...prev, projects: projects }))}
                      onUpdateCertifications={(certifications) => setProfileData(prev => ({ ...prev, certifications: certifications }))}
                    />
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-display flex items-center">
                          <Award className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                          Certifications
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {profileData.certifications.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No certifications added yet</p>
                            <p className="text-sm">Click 'Edit Profile' to add your professional certifications</p>
                          </div>
                        ) : (
                          profileData.certifications.map((cert) => (
                            <div key={cert.id} className="bg-cosmic-black/30 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="flex items-center">
                                    <h4 className="font-medium text-cosmic-gold-400">{cert.name}</h4>
                                    {cert.url && (
                                      <a
                                        href={cert.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-cosmic-blue-400 hover:text-cosmic-blue-300"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    )}
                                  </div>
                                  <p className="text-white/80">{cert.organization}</p>
                                  <div className="flex items-center text-white/60 text-sm">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Issued: {formatDate(cert.issueDate)}
                                    {cert.expiryDate && ` • Expires: ${formatDate(cert.expiryDate)}`}
                                  </div>
                                  {cert.credentialId && (
                                    <p className="text-white/60 text-sm">ID: {cert.credentialId}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-display flex items-center">
                      <Trophy className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                      Achievements & Points History
                    </h3>
                  </div>

                  {/* Points Progress */}
                  <div className="bg-cosmic-black/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-lg">{user.points || 0} Points</h4>
                        <p className="text-sm text-gray-400">Current Rank: {user.rank?.replace('_', ' ') || 'starspark'}</p>
                      </div>
                      {nextRankInfo.pointsNeeded > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-cosmic-gold-400">Next Rank: {nextRankInfo.nextRank.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-400">{nextRankInfo.pointsNeeded} points needed</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full bg-cosmic-black/50 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-cosmic-purple-500 to-cosmic-gold-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((user.points || 0) / ((user.points || 0) + nextRankInfo.pointsNeeded)) * 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Rank Progression */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-4">Rank Progression</h4>
                    <div className="relative">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-cosmic-black/50 -translate-y-1/2"></div>
                      <div className="relative flex justify-between">
                        {[
                          { rank: 'starspark', points: 0 },
                          { rank: 'nebula_novice', points: 251 },
                          { rank: 'astral_apprentice', points: 501 },
                          { rank: 'comet_crafter', points: 801 },
                          { rank: 'galactic_guide', points: 1201 },
                          { rank: 'cosmic_sage', points: 1601 }
                        ].map((rankInfo, index) => {
                          const isCurrentOrPassed = (user.points || 0) >= rankInfo.points;
                          const isCurrent = index < 5 
                            ? (user.points || 0) >= rankInfo.points && (user.points || 0) < [251, 501, 801, 1201, 1601][index]
                            : (user.points || 0) >= 1601;
                          
                          return (
                            <div key={rankInfo.rank} className="flex flex-col items-center">
                              <div 
                                className={`w-6 h-6 rounded-full z-10 flex items-center justify-center ${
                                  isCurrentOrPassed 
                                    ? isCurrent 
                                      ? 'bg-cosmic-gold-500 text-cosmic-black' 
                                      : 'bg-cosmic-purple-600 text-white'
                                    : 'bg-cosmic-black/70 text-gray-500'
                                }`}
                              >
                                {isCurrent ? (
                                  <Star className="h-3 w-3" />
                                ) : isCurrentOrPassed ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <span className="text-xs">{index + 1}</span>
                                )}
                              </div>
                              <div className="mt-2 text-center">
                                <div className={`text-xs font-medium ${
                                  isCurrent ? 'text-cosmic-gold-400' : 
                                  isCurrentOrPassed ? 'text-cosmic-purple-400' : 'text-gray-500'
                                }`}>
                                  {rankInfo.rank.replace('_', ' ')}
                                </div>
                                <div className={`text-xs ${isCurrentOrPassed ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {rankInfo.points} pts
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Points History */}
                  <div>
                    <h4 className="font-medium mb-4">Points History</h4>
                    {pointsHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No points history yet</p>
                        <p className="text-sm">Complete activities to earn points</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pointsHistory.map((entry) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-cosmic-black/30 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                    entry.points > 0 ? 'bg-cosmic-gold-900/30' : 'bg-red-900/30'
                                  }`}>
                                    {entry.source === 'lesson_completion' && <BookOpen className="h-4 w-4 text-cosmic-gold-400" />}
                                    {entry.source === 'skill_swap' && <Users className="h-4 w-4 text-cosmic-purple-400" />}
                                    {entry.source === 'profile_update' && <User className="h-4 w-4 text-cosmic-blue-400" />}
                                    {entry.source === 'decay' && <Clock className="h-4 w-4 text-red-400" />}
                                  </div>
                                  <div>
                                    <h5 className="font-medium">
                                      {entry.source === 'lesson_completion' && 'Lesson Completed'}
                                      {entry.source === 'skill_swap' && 'Skill Swap'}
                                      {entry.source === 'profile_update' && 'Profile Updated'}
                                      {entry.source === 'decay' && 'Points Decay'}
                                    </h5>
                                    <p className="text-sm text-gray-400">
                                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className={`text-lg font-bold ${
                                entry.points > 0 ? 'text-cosmic-gold-400' : 'text-red-400'
                              }`}>
                                {entry.points > 0 ? '+' : ''}{entry.points}
                              </div>
                            </div>
                            
                            {/* Details */}
                            {entry.details && (
                              <div className="mt-2 ml-11 text-sm text-gray-400">
                                {entry.source === 'lesson_completion' && entry.details.lesson_title && (
                                  <p>Completed: {entry.details.lesson_title}</p>
                                )}
                                {entry.source === 'skill_swap' && entry.details.match_username && (
                                  <p>Matched with: {entry.details.match_username}</p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
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