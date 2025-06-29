export interface AIRecommendations {
  courses: Array<{
    id: string;
    title: string;
    description: string;
    level: string;
    duration: number;
    modules: number;
    category: string;
  }>;
  mentors: Array<{
    id: string;
    name: string;
    specialty: string;
    price: number;
    currency: string;
    sessionLength: number;
    bio: string;
    rating: number;
  }>;
  matches: Array<{
    id: string;
    name: string;
    skills: string[];
    bio: string;
    matchScore: number;
  }>;
}

export interface QAResponse {
  answer: string;
  confidence: number;
  sources?: string[];
}

class AIService {
  private groqApiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    this.groqApiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.groqApiKey && this.groqApiKey.trim().length > 0;
  }

  getConfigurationMessage(): string {
    if (!this.groqApiKey || this.groqApiKey.trim().length === 0) {
      return 'AI features require a Groq API key. Please add VITE_GROQ_API_KEY to your environment variables.';
    }
    return 'AI service is ready';
  }

  async generateRecommendations(learningGoal: string): Promise<AIRecommendations> {
    if (!this.isConfigured()) {
      console.warn('Groq API key not configured, using mock data');
      return this.generateMockRecommendations(learningGoal);
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant for AeonWise, a skill-sharing platform. Based on the user's learning goal, provide recommendations in JSON format with three arrays:
              
              1. "courses" - Array of 3 course objects with: title, description, level (beginner/intermediate/advanced), duration (in hours), modules (number), category
              2. "mentors" - Array of 3 mentor objects with: name, specialty, price (number), currency ("USD"), sessionLength (in minutes), bio, rating (4.0-5.0)
              3. "matches" - Array of 3 user match objects with: name, skills (array), bio, matchScore (1-10)
              
              Make recommendations realistic and relevant to the learning goal.
              
              IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text before or after the JSON.`
            },
            {
              role: 'user',
              content: `Generate recommendations for someone wanting to learn: ${learningGoal}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        console.error(`Groq API error: ${response.status}`);
        return this.generateMockRecommendations(learningGoal);
      }

      const groqResponse = await response.json();
      let aiRecommendations;
      
      try {
        let content = groqResponse.choices[0].message.content.trim();
        
        // Clean the response content to ensure it's valid JSON
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Try to find JSON content if there's extra text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          content = jsonMatch[0];
        }
        
        aiRecommendations = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse AI response:', groqResponse.choices[0].message.content);
        return this.generateMockRecommendations(learningGoal);
      }

      // Add IDs and validate structure
      const coursesWithIds = (aiRecommendations.courses || []).map((course: any, index: number) => ({
        ...course,
        id: `ai-course-${index}-${Date.now()}`
      }));

      const mentorsWithIds = (aiRecommendations.mentors || []).map((mentor: any, index: number) => ({
        ...mentor,
        id: `ai-mentor-${index}-${Date.now()}`
      }));

      const matchesWithIds = (aiRecommendations.matches || []).map((match: any, index: number) => ({
        ...match,
        id: `ai-match-${index}-${Date.now()}`
      }));

      return {
        courses: coursesWithIds,
        mentors: mentorsWithIds,
        matches: matchesWithIds
      };

    } catch (error) {
      console.error('Error calling Groq API:', error);
      return this.generateMockRecommendations(learningGoal);
    }
  }

  async answerQuestion(question: string, context: string): Promise<QAResponse> {
    if (!this.isConfigured()) {
      console.warn('Groq API key not configured, using mock response');
      return this.generateMockQAResponse(question);
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: `You are an AI teaching assistant for AeonWise, a learning platform. Answer the user's question based on the provided lesson context. Be helpful, educational, and encouraging. Keep responses concise but informative.

Context: ${context}`
            },
            {
              role: 'user',
              content: question
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        console.error(`Groq API error: ${response.status}`);
        return this.generateMockQAResponse(question);
      }

      const groqResponse = await response.json();
      const answer = groqResponse.choices[0].message.content.trim();

      return {
        answer,
        confidence: 0.85,
        sources: ['Lesson Content', 'AI Knowledge Base']
      };

    } catch (error) {
      console.error('Error calling Groq API for Q&A:', error);
      return this.generateMockQAResponse(question);
    }
  }

  private generateMockRecommendations(goal: string): AIRecommendations {
    return {
      courses: [
        {
          id: `mock-course-1-${Date.now()}`,
          title: `Introduction to ${goal}`,
          description: `Learn the fundamentals of ${goal} from scratch with hands-on projects`,
          level: 'beginner',
          duration: 8,
          modules: 6,
          category: 'General'
        },
        {
          id: `mock-course-2-${Date.now()}`,
          title: `Advanced ${goal} Techniques`,
          description: `Master advanced concepts and best practices in ${goal}`,
          level: 'intermediate',
          duration: 12,
          modules: 10,
          category: 'Advanced'
        },
        {
          id: `mock-course-3-${Date.now()}`,
          title: `${goal} for Professionals`,
          description: `Professional-level ${goal} skills for career advancement`,
          level: 'advanced',
          duration: 16,
          modules: 12,
          category: 'Professional'
        }
      ],
      mentors: [
        {
          id: `mock-mentor-1-${Date.now()}`,
          name: 'Alex Johnson',
          specialty: goal,
          price: 75,
          currency: 'USD',
          sessionLength: 60,
          bio: `Expert in ${goal} with 8+ years of experience helping students master the subject`,
          rating: 4.8
        },
        {
          id: `mock-mentor-2-${Date.now()}`,
          name: 'Sarah Chen',
          specialty: `Advanced ${goal}`,
          price: 95,
          currency: 'USD',
          sessionLength: 45,
          bio: `Senior specialist in ${goal} with industry experience and proven teaching methods`,
          rating: 4.9
        },
        {
          id: `mock-mentor-3-${Date.now()}`,
          name: 'Mike Rodriguez',
          specialty: `${goal} Fundamentals`,
          price: 60,
          currency: 'USD',
          sessionLength: 60,
          bio: `Passionate educator specializing in making ${goal} accessible to beginners`,
          rating: 4.7
        }
      ],
      matches: [
        {
          id: `mock-match-1-${Date.now()}`,
          name: 'Emma Wilson',
          skills: [goal, 'Teaching', 'Mentoring'],
          bio: `Experienced in ${goal} and loves helping others learn`,
          matchScore: 9
        },
        {
          id: `mock-match-2-${Date.now()}`,
          name: 'David Kim',
          skills: [goal, 'Project Management', 'Communication'],
          bio: `Professional with strong ${goal} background, happy to share knowledge`,
          matchScore: 8
        },
        {
          id: `mock-match-3-${Date.now()}`,
          name: 'Lisa Thompson',
          skills: [goal, 'Problem Solving', 'Collaboration'],
          bio: `Enthusiastic learner and teacher in the ${goal} community`,
          matchScore: 7
        }
      ]
    };
  }

  private generateMockQAResponse(question: string): QAResponse {
    const mockResponses = [
      "That's a great question! This concept is fundamental to understanding the topic. Let me break it down for you step by step.",
      "I understand your confusion. This is a common question when learning this material. The key thing to remember is...",
      "Good observation! Here's how you can think about this problem from a practical perspective.",
      "That's exactly the right question to ask at this point in your learning journey. Let me explain the reasoning behind this.",
      "Excellent question! This touches on one of the more nuanced aspects of the subject. Here's what you need to know..."
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    return {
      answer: randomResponse,
      confidence: 0.75,
      sources: ['Course Material', 'Educational Database']
    };
  }
}

export const aiService = new AIService();