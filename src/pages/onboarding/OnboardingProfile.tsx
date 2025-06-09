import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, Plus, X, Briefcase, Award, Code, Calendar,
  Building, User, FileText, ArrowRight, Loader2
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../hooks/useToast';

interface WorkExperience {
  jobTitle: string;
  company: string;
  duration: string;
  responsibilities: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
}

interface Certification {
  name: string;
  organization: string;
  date: string;
}

interface UserInfo {
  fullName: string;
  username: string;
  email: string;
  timestamp: string;
}

const OnboardingProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();
  const { toast } = useToast();
  
  // User info from previous step
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Work Experience
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [newExperience, setNewExperience] = useState<WorkExperience>({
    jobTitle: '',
    company: '',
    duration: '',
    responsibilities: ''
  });

  // Skills
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [newTechnicalSkill, setNewTechnicalSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState<Project>({
    name: '',
    description: '',
    technologies: []
  });
  const [newTechnology, setNewTechnology] = useState('');

  // Certifications
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [newCertification, setNewCertification] = useState<Certification>({
    name: '',
    organization: '',
    date: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please complete the account creation first',
        variant: 'destructive',
      });
      navigate('/onboarding/questionnaire');
      return;
    }

    // Load user info from localStorage
    if (!dataLoaded) {
      const storedUserInfo = localStorage.getItem('onboarding_user_info');
      if (!storedUserInfo) {
        toast({
          title: 'Missing User Information',
          description: 'Please start from the beginning',
          variant: 'destructive',
        });
        navigate('/onboarding/questionnaire');
        return;
      }

      try {
        const parsedData = JSON.parse(storedUserInfo);
        setUserInfo(parsedData);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast({
          title: 'Invalid User Data',
          description: 'Please start from the beginning',
          variant: 'destructive',
        });
        navigate('/onboarding/questionnaire');
      }
    }
  }, [dataLoaded, navigate, toast, user]);

  // Work Experience Functions
  const addWorkExperience = () => {
    if (newExperience.jobTitle && newExperience.company) {
      setWorkExperience([...workExperience, newExperience]);
      setNewExperience({ jobTitle: '', company: '', duration: '', responsibilities: '' });
    }
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  // Skills Functions
  const addTechnicalSkill = () => {
    if (newTechnicalSkill.trim() && !technicalSkills.includes(newTechnicalSkill.trim())) {
      setTechnicalSkills([...technicalSkills, newTechnicalSkill.trim()]);
      setNewTechnicalSkill('');
    }
  };

  const removeTechnicalSkill = (index: number) => {
    setTechnicalSkills(technicalSkills.filter((_, i) => i !== index));
  };

  const addSoftSkill = () => {
    if (newSoftSkill.trim() && !softSkills.includes(newSoftSkill.trim())) {
      setSoftSkills([...softSkills, newSoftSkill.trim()]);
      setNewSoftSkill('');
    }
  };

  const removeSoftSkill = (index: number) => {
    setSoftSkills(softSkills.filter((_, i) => i !== index));
  };

  // Projects Functions
  const addTechnology = () => {
    if (newTechnology.trim() && !newProject.technologies.includes(newTechnology.trim())) {
      setNewProject({
        ...newProject,
        technologies: [...newProject.technologies, newTechnology.trim()]
      });
      setNewTechnology('');
    }
  };

  const removeTechnology = (index: number) => {
    setNewProject({
      ...newProject,
      technologies: newProject.technologies.filter((_, i) => i !== index)
    });
  };

  const addProject = () => {
    if (newProject.name && newProject.description) {
      setProjects([...projects, newProject]);
      setNewProject({ name: '', description: '', technologies: [] });
    }
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Certifications Functions
  const addCertification = () => {
    if (newCertification.name && newCertification.organization) {
      setCertifications([...certifications, newCertification]);
      setNewCertification({ name: '', organization: '', date: '' });
    }
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const calculatePoints = () => {
    let points = 0;
    
    // Experience points (50 per job)
    points += workExperience.length * 50;
    
    // Skills points (10 per technical skill, 5 per soft skill)
    points += technicalSkills.length * 10;
    points += softSkills.length * 5;
    
    // Project points (30 per project)
    points += projects.length * 30;
    
    // Certification points (40 per certification)
    points += certifications.length * 40;
    
    return points;
  };

  const handleSubmit = async () => {
    if (!userInfo || !user) {
      toast({
        title: 'Missing Information',
        description: 'Please start from the beginning',
        variant: 'destructive',
      });
      navigate('/onboarding/questionnaire');
      return;
    }

    if (technicalSkills.length === 0) {
      toast({
        title: 'Skills Required',
        description: 'Please add at least one technical skill',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Calculate points and prepare profile data
      const allSkills = [...technicalSkills, ...softSkills];
      const calculatedPoints = calculatePoints();
      const bio = `Experienced professional with ${workExperience.length} work experiences, ${projects.length} projects, and ${certifications.length} certifications.`;

      // Update user profile with all collected information
      const { error } = await updateProfile({
        skills: allSkills,
        points: calculatedPoints,
        bio: bio,
      });

      if (error) {
        throw error;
      }

      // Store complete profile data for recommendations
      localStorage.setItem('onboarding_complete_profile', JSON.stringify({
        userInfo,
        workExperience,
        technicalSkills,
        softSkills,
        projects,
        certifications,
        points: calculatedPoints,
        skills: allSkills,
        bio,
      }));

      // Clear the temporary user info
      localStorage.removeItem('onboarding_user_info');

      toast({
        title: 'Profile Created Successfully!',
        description: `Your cosmic profile has been created with ${calculatedPoints} points!`,
      });

      navigate('/onboarding/recommendations');
    } catch (error: any) {
      console.error('Profile creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  // Show loading while data is being loaded
  if (!dataLoaded || !userInfo || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cosmic-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <Sparkles className="h-12 w-12 text-cosmic-gold-400 mx-auto mb-4" />
          <h1 className="text-4xl font-display mb-4">Build Your Professional Profile</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Welcome {userInfo.fullName}! Tell us about your experience, skills, and achievements to create your cosmic profile
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Work Experience Section */}
          <div className="cosmos-card p-6">
            <h2 className="text-xl font-display mb-6 flex items-center">
              <Briefcase className="h-5 w-5 text-cosmic-gold-400 mr-2" />
              Work Experience
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Job Title"
                value={newExperience.jobTitle}
                onChange={(e) => setNewExperience({ ...newExperience, jobTitle: e.target.value })}
                className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
              />
              <input
                type="text"
                placeholder="Company"
                value={newExperience.company}
                onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
              />
              <input
                type="text"
                placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                value={newExperience.duration}
                onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
              />
              <div className="flex">
                <textarea
                  placeholder="Key responsibilities"
                  value={newExperience.responsibilities}
                  onChange={(e) => setNewExperience({ ...newExperience, responsibilities: e.target.value })}
                  className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-l-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 min-h-[80px]"
                />
                <button
                  onClick={addWorkExperience}
                  className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-r-md px-4 py-2"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {workExperience.map((exp, index) => (
                <div key={index} className="bg-cosmic-black/30 rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-cosmic-gold-400">{exp.jobTitle}</h3>
                    <p className="text-white/80">{exp.company}</p>
                    <p className="text-sm text-white/60">{exp.duration}</p>
                    {exp.responsibilities && (
                      <p className="text-sm text-white/70 mt-2">{exp.responsibilities}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeWorkExperience(index)}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div className="cosmos-card p-6">
            <h2 className="text-xl font-display mb-6 flex items-center">
              <Code className="h-5 w-5 text-cosmic-gold-400 mr-2" />
              Skills
            </h2>

            {/* Technical Skills */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Technical Skills</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="e.g., Python, React, Machine Learning..."
                  value={newTechnicalSkill}
                  onChange={(e) => setNewTechnicalSkill(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addTechnicalSkill)}
                  className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                />
                <button
                  onClick={addTechnicalSkill}
                  className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-md px-4 py-2"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {technicalSkills.map((skill, index) => (
                  <div key={index} className="inline-flex items-center bg-cosmic-purple-900/50 rounded-md px-3 py-1 text-sm">
                    {skill}
                    <button
                      onClick={() => removeTechnicalSkill(index)}
                      className="ml-2 text-white/70 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Soft Skills */}
            <div>
              <h3 className="text-lg font-medium mb-3">Soft Skills</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="e.g., Leadership, Communication, Problem Solving..."
                  value={newSoftSkill}
                  onChange={(e) => setNewSoftSkill(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addSoftSkill)}
                  className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                />
                <button
                  onClick={addSoftSkill}
                  className="bg-cosmic-blue-600 hover:bg-cosmic-blue-700 text-white rounded-md px-4 py-2"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {softSkills.map((skill, index) => (
                  <div key={index} className="inline-flex items-center bg-cosmic-blue-900/50 rounded-md px-3 py-1 text-sm">
                    {skill}
                    <button
                      onClick={() => removeSoftSkill(index)}
                      className="ml-2 text-white/70 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="cosmos-card p-6">
            <h2 className="text-xl font-display mb-6 flex items-center">
              <FileText className="h-5 w-5 text-cosmic-gold-400 mr-2" />
              Projects
            </h2>

            <div className="space-y-4 mb-4">
              <input
                type="text"
                placeholder="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
              />
              <textarea
                placeholder="Project Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500 min-h-[80px]"
              />
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Technology used"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addTechnology)}
                  className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                />
                <button
                  onClick={addTechnology}
                  className="bg-cosmic-gold-600 hover:bg-cosmic-gold-700 text-white rounded-md px-4 py-2"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {newProject.technologies.map((tech, index) => (
                  <div key={index} className="inline-flex items-center bg-cosmic-gold-900/50 rounded-md px-3 py-1 text-sm">
                    {tech}
                    <button
                      onClick={() => removeTechnology(index)}
                      className="ml-2 text-white/70 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addProject}
                className="btn-secondary w-full"
                disabled={!newProject.name || !newProject.description}
              >
                Add Project
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((project, index) => (
                <div key={index} className="bg-cosmic-black/30 rounded-lg p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-cosmic-gold-400">{project.name}</h3>
                    <p className="text-white/80 mb-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="text-xs bg-cosmic-gold-900/30 rounded px-2 py-1">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => removeProject(index)}
                    className="text-white/70 hover:text-white ml-4"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="cosmos-card p-6">
            <h2 className="text-xl font-display mb-6 flex items-center">
              <Award className="h-5 w-5 text-cosmic-gold-400 mr-2" />
              Certifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Certification Name"
                value={newCertification.name}
                onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
              />
              <input
                type="text"
                placeholder="Issuing Organization"
                value={newCertification.organization}
                onChange={(e) => setNewCertification({ ...newCertification, organization: e.target.value })}
                className="bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
              />
              <div className="flex">
                <input
                  type="text"
                  placeholder="Date Obtained"
                  value={newCertification.date}
                  onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
                  className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-l-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
                />
                <button
                  onClick={addCertification}
                  className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-r-md px-4 py-2"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {certifications.map((cert, index) => (
                <div key={index} className="bg-cosmic-black/30 rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-cosmic-gold-400">{cert.name}</h3>
                    <p className="text-white/80">{cert.organization}</p>
                    {cert.date && <p className="text-sm text-white/60">{cert.date}</p>}
                  </div>
                  <button
                    onClick={() => removeCertification(index)}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Summary and Submit */}
          <div className="cosmos-card p-6 text-center">
            <h2 className="text-xl font-display mb-4">Profile Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-cosmic-black/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-cosmic-gold-400">{workExperience.length}</div>
                <div className="text-sm text-white/70">Work Experiences</div>
              </div>
              <div className="bg-cosmic-black/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-cosmic-purple-400">{technicalSkills.length + softSkills.length}</div>
                <div className="text-sm text-white/70">Total Skills</div>
              </div>
              <div className="bg-cosmic-black/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-cosmic-blue-400">{projects.length}</div>
                <div className="text-sm text-white/70">Projects</div>
              </div>
              <div className="bg-cosmic-black/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-cosmic-gold-400">{certifications.length}</div>
                <div className="text-sm text-white/70">Certifications</div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-lg font-medium text-cosmic-gold-400">
                Estimated Points: {calculatePoints()}
              </div>
              <p className="text-sm text-white/70">
                Points are calculated based on your experience, skills, projects, and certifications
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || technicalSkills.length === 0}
              className="btn-primary flex items-center justify-center mx-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Creating your profile...
                </>
              ) : (
                <>
                  Complete Profile & Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProfile;