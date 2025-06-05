import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/analyze-profile', async (req, res) => {
  const { text, userId } = req.body;
  
  if (!text || !userId) {
    return res.status(400).json({ error: 'Text and userId are required' });
  }

  try {
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/analyze-profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze profile');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error analyzing profile:', error);
    res.status(500).json({ error: 'Failed to analyze profile' });
  }
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

app.post('/api/find-matches', async (req, res) => {
  const { skills, learningGoals, userId } = req.body;
  
  if (!skills || !learningGoals || !userId) {
    return res.status(400).json({ 
      error: 'Skills, learning goals, and userId are required' 
    });
  }

  try {
    // Find mentors based on the user's learning goals
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/match-users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skills, learningGoals, userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to find matches');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ error: 'Failed to find matches' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});