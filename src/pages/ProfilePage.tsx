import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Edit2, BookOpen, Sparkles, Trophy, Plus, Save, X, 
  Loader2, BadgeCheck, UserCircle, Briefcase, Award, ArrowRight,
  Calendar, MapPin, ExternalLink, Building
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../hooks/useToast';
import { useSupabase } from '../lib/supabase/SupabaseProvider';

// Avatar configuration with the new uploaded images
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [profileData, setProfileData] = useState({
    bio: '',
    skills: [] as string[],
    workExperience: [] as WorkExperience[],
    projects: [] as Project[],
    certifications: [] as Certification[],
  });
  
  // Form states for adding new items
  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState<Partial<WorkExperience>>({
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: []
  });
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    technologies: [],
    startDate: '',
    endDate: '',
    url: '',
    achievements: []
  });
  const [newCertification, setNewCertification] = useState<Partial<Certification>>({
    name: '',
    organization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    url: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'projects' | 'certifications'>('overview');

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

  const addWorkExperience = () => {
    if (newExperience.jobTitle && newExperience.company) {
      const experience: WorkExperience = {
        id: Date.now().toString(),
        jobTitle: newExperience.jobTitle || '',
        company: newExperience.company || '',
        location: newExperience.location || '',
        startDate: newExperience.startDate || '',
        endDate: newExperience.current ? '' : (newExperience.endDate || ''),
        current: newExperience.current || false,
        description: newExperience.description || '',
        achievements: newExperience.achievements || []
      };
      
      setProfileData(prev => ({
        ...prev,
        workExperience: [...prev.workExperience, experience]
      }));
      
      setNewExperience({
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        achievements: []
      });
    }
  };

  const addProject = () => {
    if (newProject.name && newProject.description) {
      const project: Project = {
        id: Date.now().toString(),
        name: newProject.name || '',
        description: newProject.description || '',
        technologies: newProject.technologies || [],
        startDate: newProject.startDate || '',
        endDate: newProject.endDate || '',
        url: newProject.url || '',
        achievements: newProject.achievements || []
      };
      
      setProfileData(prev => ({
        ...prev,
        projects: [...prev.projects, project]
      }));
      
      setNewProject({
        name: '',
        description: '',
        technologies: [],
        startDate: '',
        endDate: '',
        url: '',
        achievements: []
      });
    }
  };

  const addCertification = () => {
    if (newCertification.name && newCertification.organization) {
      const certification: Certification = {
        id: Date.now().toString(),
        name: newCertification.name || '',
        organization: newCertification.organization || '',
        issueDate: newCertification.issueDate || '',
        expiryDate: newCertification.expiryDate || '',
        credentialId: newCertification.credentialId || '',
        url: newCertification.url || ''
      };
      
      setProfileData(prev => ({
        ...prev,
        certifications: [...prev.certifications, certification]
      }));
      
      setNewCertification({
        name: '',
        organization: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        url: ''
      });
    }
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

  const isAvatarUnlocked = (avatar: string) => {
    const userPoints = user?.points || 0;
    if (avatar === rankAvatars.comet_crafter) return userPoints >= 801;
    if (avatar === rankAvatars.galactic_guide) return userPoints >= 1201;
    if (avatar === rankAvatars.cosmic_sage) return userPoints >= 1601;
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
                          className={`w-16 h-16 rounded-full overflow-hidden border-2 ${
                            selectedAvatar === avatar ? 'border-cosmic-gold-400' : 'border-gray-600'
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
                          className={`w-16 h-16 rounded-full overflow-hidden border-2 relative ${
                            selectedAvatar === avatar ? 'border-cosmic-gold-400' : 'border-gray-600'
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

              {/* Navigation Tabs */}
              <div className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'experience', label: 'Experience', icon: Briefcase },
                  { id: 'projects', label: 'Projects', icon: BookOpen },
                  { id: 'certifications', label: 'Certifications', icon: Award },
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

                  {/* Points Summary */}
                  <div className="bg-cosmic-black/20 rounded-lg p-4">
                    <h3 className="text-lg font-display mb-4">Points Breakdown</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Skills: {profileData.skills.length} × 10 = {profileData.skills.length * 10} pts</div>
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
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-display flex items-center">
                      <Briefcase className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                      Work Experience
                    </h3>
                  </div>

                  {isEditing && (
                    <div className="bg-cosmic-black/20 rounded-lg p-4 space-y-4">
                      <h4 className="font-medium">Add Work Experience</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Job Title"
                          value={newExperience.jobTitle || ''}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, jobTitle: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                        <input
                          type="text"
                          placeholder="Company"
                          value={newExperience.company || ''}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                        <input
                          type="text"
                          placeholder="Location"
                          value={newExperience.location || ''}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="current"
                            checked={newExperience.current || false}
                            onChange={(e) => setNewExperience(prev => ({ ...prev, current: e.target.checked }))}
                            className="rounded"
                          />
                          <label htmlFor="current" className="text-sm">Current Position</label>
                        </div>
                        <input
                          type="month"
                          placeholder="Start Date"
                          value={newExperience.startDate || ''}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                        {!newExperience.current && (
                          <input
                            type="month"
                            placeholder="End Date"
                            value={newExperience.endDate || ''}
                            onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                            className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                          />
                        )}
                      </div>
                      <textarea
                        placeholder="Job Description"
                        value={newExperience.description || ''}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 min-h-[80px]"
                      />
                      <button
                        onClick={addWorkExperience}
                        className="btn-primary"
                        disabled={!newExperience.jobTitle || !newExperience.company}
                      >
                        Add Experience
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {profileData.workExperience.map((exp) => (
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
                              {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                            </div>
                          </div>
                        </div>
                        {exp.description && (
                          <p className="text-white/70 text-sm mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-display flex items-center">
                      <BookOpen className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                      Projects
                    </h3>
                  </div>

                  {isEditing && (
                    <div className="bg-cosmic-black/20 rounded-lg p-4 space-y-4">
                      <h4 className="font-medium">Add Project</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Project Name"
                          value={newProject.name || ''}
                          onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                        <input
                          type="url"
                          placeholder="Project URL (optional)"
                          value={newProject.url || ''}
                          onChange={(e) => setNewProject(prev => ({ ...prev, url: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                        <input
                          type="month"
                          placeholder="Start Date"
                          value={newProject.startDate || ''}
                          onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                        <input
                          type="month"
                          placeholder="End Date"
                          value={newProject.endDate || ''}
                          onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                      </div>
                      <textarea
                        placeholder="Project Description"
                        value={newProject.description || ''}
                        onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 min-h-[80px]"
                      />
                      <button
                        onClick={addProject}
                        className="btn-primary"
                        disabled={!newProject.name || !newProject.description}
                      >
                        Add Project
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {profileData.projects.map((project) => (
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
                              {project.startDate} - {project.endDate}
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'certifications' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-display flex items-center">
                      <Award className="h-5 w-5 text-cosmic-gold-400 mr-2" />
                      Certifications
                    </h3>
                  </div>

                  {isEditing && (
                    <div className="bg-cosmic-black/20 rounded-lg p-4 space-y-4">
                      <h4 className="font-medium">Add Certification</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Certification Name"
                          value={newCertification.name || ''}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                        <input
                          type="text"
                          placeholder="Issuing Organization"
                          value={newCertification.organization || ''}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, organization: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                        <input
                          type="month"
                          placeholder="Issue Date"
                          value={newCertification.issueDate || ''}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, issueDate: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                        <input
                          type="month"
                          placeholder="Expiry Date (optional)"
                          value={newCertification.expiryDate || ''}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, expiryDate: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                        <input
                          type="text"
                          placeholder="Credential ID (optional)"
                          value={newCertification.credentialId || ''}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, credentialId: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                        <input
                          type="url"
                          placeholder="Verification URL (optional)"
                          value={newCertification.url || ''}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, url: e.target.value }))}
                          className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                        />
                      </div>
                      <button
                        onClick={addCertification}
                        className="btn-primary"
                        disabled={!newCertification.name || !newCertification.organization}
                      >
                        Add Certification
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {profileData.certifications.map((cert) => (
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
                              Issued: {cert.issueDate}
                              {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
                            </div>
                            {cert.credentialId && (
                              <p className="text-white/60 text-sm">ID: {cert.credentialId}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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