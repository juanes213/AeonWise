import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/extract-skills', async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/extract-skills`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to extract skills');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error extracting skills:', error);
    res.status(500).json({ error: 'Failed to extract skills' });
  }
});

app.post('/api/find-matches', (req, res) => {
  const { skills, learningGoals, userId } = req.body;
  
  if (!skills || !learningGoals || !userId) {
    return res.status(400).json({ 
      error: 'Skills, learning goals, and userId are required' 
    });
  }
  
  // Mock data for demonstration
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
  }, 1000);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});