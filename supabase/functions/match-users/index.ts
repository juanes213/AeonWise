import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

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

    // Get all profiles except the current user
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user_id);

    if (error) {
      throw error;
    }

    // Calculate matches
    const matches = profiles.map(profile => {
      let matchScore = 0;
      
      // Your skills matching their learning goals
      for (const skill of skills) {
        if (profile.learning_goals.some((goal: string) => 
          goal.toLowerCase().includes(skill.toLowerCase())
        )) {
          matchScore += 1;
        }
      }
      
      // Their skills matching your learning goals
      for (const goal of learning_goals) {
        if (profile.skills.some((skill: string) => 
          skill.toLowerCase().includes(goal.toLowerCase())
        )) {
          matchScore += 1;
        }
      }
      
      return {
        ...profile,
        matchScore,
        rank: profile.points >= 801 ? 'master' :
              profile.points >= 601 ? 'expert' :
              profile.points >= 401 ? 'journeyman' :
              profile.points >= 201 ? 'apprentice' : 'novice'
      };
    });
    
    // Filter to only include users with a match score > 0 and sort by match score
    const filteredMatches = matches
      .filter(profile => profile.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Limit to top 5 matches

    // Return the matches
    return new Response(JSON.stringify({ matches: filteredMatches }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});