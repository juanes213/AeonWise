import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mock API for skill extraction using Claude
app.post('/api/extract-skills', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  // In a real implementation, this would call Claude API
  // For demo purposes, we'll use a simple extraction logic
  const words = text.toLowerCase().split(/[\s,\.]+/);
  const commonSkills = [
    'javascript', 'python', 'react', 'node', 'design', 'marketing',
    'data', 'machine learning', 'ui', 'ux', 'writing', 'teaching',
    'project management', 'leadership', 'communication'
  ];
  
  const extractedSkills = commonSkills.filter(skill => 
    words.some(word => word.includes(skill.toLowerCase()))
  );
  
  setTimeout(() => {
    res.json({ skills: extractedSkills });
  }, 500); // Simulate API delay
});

// Mock API for finding matches
app.post('/api/find-matches', (req, res) => {
  const { skills, learningGoals, userId } = req.body;
  
  if (!skills || !learningGoals || !userId) {
    return res.status(400).json({ 
      error: 'Skills, learning goals, and userId are required' 
    });
  }
  
  // In a real implementation, this would query the database
  // For demo purposes, return mock data
  const mockMatches = [
    {
      id: 'usr123',
      username: 'Alexandria',
      skills: ['Python', 'Machine Learning', 'Data Science'],
      learning_goals: ['Design', 'Public Speaking'],
      points: 850,
      rank: 'master',
    },
    {
      id: 'usr456',
      username: 'Marcus',
      skills: ['JavaScript', 'React', 'Node.js'],
      learning_goals: ['Python', 'Data Science'],
      points: 650,
      rank: 'expert',
    },
    {
      id: 'usr789',
      username: 'Sophia',
      skills: ['UX Design', 'Psychology', 'User Research'],
      learning_goals: ['JavaScript', 'Web Development'],
      points: 720,
      rank: 'expert',
    }
  ];
  
  setTimeout(() => {
    res.json({ matches: mockMatches });
  }, 1000); // Simulate API delay
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});