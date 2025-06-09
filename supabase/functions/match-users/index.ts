import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

function calculateMatchScore(userSkills: string[], userGoals: string[], profileSkills: string[], profileGoals: string[]): number {
  let score = 0;
  
  // Your skills matching their learning goals (they can learn from you)
  for (const skill of userSkills) {
    for (const goal of profileGoals) {
      if (skill.toLowerCase().includes(goal.toLowerCase()) || 
          goal.toLowerCase().includes(skill.toLowerCase()) ||
          areRelatedSkills(skill, goal)) {
        score += 2; // Higher weight for teaching opportunities
      }
    }
  }
  
  // Their skills matching your learning goals (you can learn from them)
  for (const goal of userGoals) {
    for (const skill of profileSkills) {
      if (goal.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(goal.toLowerCase()) ||
          areRelatedSkills(goal, skill)) {
        score += 2; // Higher weight for learning opportunities
      }
    }
  }
  
  return score;
}

function areRelatedSkills(skill1: string, skill2: string): boolean {
  const relatedTerms = {
    'web development': ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'frontend', 'backend'],
    'mobile development': ['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin'],
    'data science': ['python', 'machine learning', 'ai', 'statistics', 'pandas', 'numpy'],
    'machine learning': ['python', 'tensorflow', 'pytorch', 'ai', 'data science'],
    'programming': ['python', 'javascript', 'java', 'c++', 'coding'],
    'design': ['ui', 'ux', 'graphic design', 'photoshop', 'figma'],
  };
  
  const s1 = skill1.toLowerCase();
  const s2 = skill2.toLowerCase();
  
  for (const [category, terms] of Object.entries(relatedTerms)) {
    if ((s1.includes(category) || terms.some(term => s1.includes(term))) &&
        (s2.includes(category) || terms.some(term => s2.includes(term)))) {
      return true;
    }
  }
  
  return false;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Parse request JSON
    const { user_id, skills, learning_goals } = await req.json();

    if (!user_id || !skills || !learning_goals) {
      return new Response(JSON.stringify({ error: 'User ID, skills, and learning goals are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Finding matches for user:', user_id);
    console.log('User skills:', skills);
    console.log('User learning goals:', learning_goals);

    // Get all profiles except the current user
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, skills, learning_goals, points, avatar_url')
      .neq('id', user_id);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Found profiles:', profiles?.length);

    // Calculate matches with improved algorithm
    const matches = profiles?.map(profile => {
      const matchScore = calculateMatchScore(skills, learning_goals, profile.skills || [], profile.learning_goals || []);
      
      return {
        ...profile,
        matchScore,
        rank: profile.points >= 1601 ? 'cosmic_sage' :
              profile.points >= 1201 ? 'galactic_guide' :
              profile.points >= 801 ? 'comet_crafter' :
              profile.points >= 501 ? 'astral_apprentice' :
              profile.points >= 251 ? 'nebula_novice' : 'starspark'
      };
    }) || [];
    
    // Filter to only include users with a match score > 0 and sort by match score
    const filteredMatches = matches
      .filter(profile => profile.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Limit to top 10 matches

    console.log('Filtered matches:', filteredMatches.length);
    console.log('Match scores:', filteredMatches.map(m => ({ username: m.username, score: m.matchScore })));

    // Return the matches
    return new Response(JSON.stringify({ matches: filteredMatches }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Error in match-users function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});