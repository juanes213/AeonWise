import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, Save, Calendar, MapPin, ExternalLink, Building, 
  Award, Code, Briefcase, Edit2, Trash2, CheckCircle
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';

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

interface EnhancedProfileEditorProps {
  workExperience: WorkExperience[];
  projects: Project[];
  certifications: Certification[];
  onUpdateWorkExperience: (experiences: WorkExperience[]) => void;
  onUpdateProjects: (projects: Project[]) => void;
  onUpdateCertifications: (certifications: Certification[]) => void;
}

export const EnhancedProfileEditor: React.FC<EnhancedProfileEditorProps> = ({
  workExperience,
  projects,
  certifications,
  onUpdateWorkExperience,
  onUpdateProjects,
  onUpdateCertifications
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'experience' | 'projects' | 'certifications'>('experience');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Work Experience Form State
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

  // Project Form State
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    technologies: [],
    startDate: '',
    endDate: '',
    url: '',
    achievements: []
  });

  // Certification Form State
  const [newCertification, setNewCertification] = useState<Partial<Certification>>({
    name: '',
    organization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    url: ''
  });

  const [newTechnology, setNewTechnology] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const addWorkExperience = () => {
    if (!newExperience.jobTitle || !newExperience.company) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in job title and company',
        variant: 'destructive',
      });
      return;
    }

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

    onUpdateWorkExperience([...workExperience, experience]);
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
    setShowAddForm(false);
    
    toast({
      title: 'Experience Added',
      description: 'Work experience has been added to your profile',
    });
  };

  const addProject = () => {
    if (!newProject.name || !newProject.description) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in project name and description',
        variant: 'destructive',
      });
      return;
    }

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

    onUpdateProjects([...projects, project]);
    setNewProject({
      name: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      url: '',
      achievements: []
    });
    setShowAddForm(false);
    
    toast({
      title: 'Project Added',
      description: 'Project has been added to your profile',
    });
  };

  const addCertification = () => {
    if (!newCertification.name || !newCertification.organization) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in certification name and organization',
        variant: 'destructive',
      });
      return;
    }

    const certification: Certification = {
      id: Date.now().toString(),
      name: newCertification.name || '',
      organization: newCertification.organization || '',
      issueDate: newCertification.issueDate || '',
      expiryDate: newCertification.expiryDate || '',
      credentialId: newCertification.credentialId || '',
      url: newCertification.url || ''
    };

    onUpdateCertifications([...certifications, certification]);
    setNewCertification({
      name: '',
      organization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      url: ''
    });
    setShowAddForm(false);
    
    toast({
      title: 'Certification Added',
      description: 'Certification has been added to your profile',
    });
  };

  const removeWorkExperience = (id: string) => {
    onUpdateWorkExperience(workExperience.filter(exp => exp.id !== id));
    toast({
      title: 'Experience Removed',
      description: 'Work experience has been removed from your profile',
    });
  };

  const removeProject = (id: string) => {
    onUpdateProjects(projects.filter(proj => proj.id !== id));
    toast({
      title: 'Project Removed',
      description: 'Project has been removed from your profile',
    });
  };

  const removeCertification = (id: string) => {
    onUpdateCertifications(certifications.filter(cert => cert.id !== id));
    toast({
      title: 'Certification Removed',
      description: 'Certification has been removed from your profile',
    });
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !newProject.technologies?.includes(newTechnology.trim())) {
      setNewProject(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = (tech: string) => {
    setNewProject(prev => ({
      ...prev,
      technologies: prev.technologies?.filter(t => t !== tech) || []
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      if (activeTab === 'experience') {
        setNewExperience(prev => ({
          ...prev,
          achievements: [...(prev.achievements || []), newAchievement.trim()]
        }));
      } else if (activeTab === 'projects') {
        setNewProject(prev => ({
          ...prev,
          achievements: [...(prev.achievements || []), newAchievement.trim()]
        }));
      }
      setNewAchievement('');
    }
  };

  const removeAchievement = (achievement: string) => {
    if (activeTab === 'experience') {
      setNewExperience(prev => ({
        ...prev,
        achievements: prev.achievements?.filter(a => a !== achievement) || []
      }));
    } else if (activeTab === 'projects') {
      setNewProject(prev => ({
        ...prev,
        achievements: prev.achievements?.filter(a => a !== achievement) || []
      }));
    }
  };

  const tabs = [
    { id: 'experience', label: 'Work Experience', icon: Briefcase, count: workExperience.length },
    { id: 'projects', label: 'Projects', icon: Code, count: projects.length },
    { id: 'certifications', label: 'Certifications', icon: Award, count: certifications.length }
  ];

  return (
    <div className="cosmos-card p-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-cosmic-black/30 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setShowAddForm(false);
              setEditingItem(null);
            }}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cosmic-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="bg-cosmic-gold-500 text-cosmic-black text-xs px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-display">
          {activeTab === 'experience' && 'Work Experience'}
          {activeTab === 'projects' && 'Projects'}
          {activeTab === 'certifications' && 'Certifications'}
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary text-sm flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add {activeTab === 'experience' ? 'Experience' : activeTab === 'projects' ? 'Project' : 'Certification'}</span>
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-cosmic-black/20 rounded-lg p-4"
          >
            {activeTab === 'experience' && (
              <div className="space-y-4">
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
                
                {/* Achievements */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Achievements</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add an achievement"
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                      className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                    />
                    <button
                      onClick={addAchievement}
                      className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-md px-4 py-2"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newExperience.achievements?.map((achievement, index) => (
                      <div key={index} className="bg-cosmic-gold-900/30 text-cosmic-gold-100 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                        <span>{achievement}</span>
                        <button
                          onClick={() => removeAchievement(achievement)}
                          className="text-cosmic-gold-300 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={addWorkExperience}
                    className="btn-primary"
                  >
                    Add Experience
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
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
                
                {/* Technologies */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Technologies</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add a technology"
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                      className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                    />
                    <button
                      onClick={addTechnology}
                      className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-md px-4 py-2"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newProject.technologies?.map((tech, index) => (
                      <div key={index} className="bg-cosmic-blue-900/30 text-cosmic-blue-100 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                        <span>{tech}</span>
                        <button
                          onClick={() => removeTechnology(tech)}
                          className="text-cosmic-blue-300 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Achievements</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add an achievement"
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                      className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                    />
                    <button
                      onClick={addAchievement}
                      className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-md px-4 py-2"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newProject.achievements?.map((achievement, index) => (
                      <div key={index} className="bg-cosmic-gold-900/30 text-cosmic-gold-100 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                        <span>{achievement}</span>
                        <button
                          onClick={() => removeAchievement(achievement)}
                          className="text-cosmic-gold-300 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={addProject}
                    className="btn-primary"
                  >
                    Add Project
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'certifications' && (
              <div className="space-y-4">
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

                <div className="flex space-x-3">
                  <button
                    onClick={addCertification}
                    className="btn-primary"
                  >
                    Add Certification
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Lists */}
      <div className="space-y-4">
        {activeTab === 'experience' && (
          <>
            {workExperience.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No work experience added yet</p>
                <p className="text-sm">Add your professional experience to showcase your career journey</p>
              </div>
            ) : (
              workExperience.map((exp) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-cosmic-black/30 rounded-lg p-4 hover:bg-cosmic-black/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
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
                    <button
                      onClick={() => removeWorkExperience(exp.id)}
                      className="text-white/70 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
                </motion.div>
              ))
            )}
          </>
        )}

        {activeTab === 'projects' && (
          <>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No projects added yet</p>
                <p className="text-sm">Showcase your work and personal projects</p>
              </div>
            ) : (
              projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-cosmic-black/30 rounded-lg p-4 hover:bg-cosmic-black/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
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
                    <button
                      onClick={() => removeProject(project.id)}
                      className="text-white/70 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-white/70 text-sm mb-3">{project.description}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.technologies.map((tech, index) => (
                        <span key={index} className="text-xs bg-cosmic-blue-900/30 text-cosmic-blue-100 rounded px-2 py-1">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.achievements && project.achievements.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-cosmic-gold-300 mb-2">Key Achievements:</h5>
                      <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                        {project.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </>
        )}

        {activeTab === 'certifications' && (
          <>
            {certifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No certifications added yet</p>
                <p className="text-sm">Add your professional certifications and achievements</p>
              </div>
            ) : (
              certifications.map((cert) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-cosmic-black/30 rounded-lg p-4 hover:bg-cosmic-black/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
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
                    <button
                      onClick={() => removeCertification(cert.id)}
                      className="text-white/70 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};