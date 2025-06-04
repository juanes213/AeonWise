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
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // In a real implementation, this would call Claude API
    // For demo purposes, we'll use a simple extraction logic
    const words = text.toLowerCase().split(/[\s,\.]+/);
    const commonSkills = [
      'javascript', 'python', 'react', 'node', 'design', 'marketing',
      'data', 'machine learning', 'ai', 'ui', 'ux', 'writing', 'teaching',
      'project management', 'leadership', 'communication', 'angular',
      'vue', 'typescript', 'sql', 'database', 'cloud', 'aws', 'azure',
      'devops', 'music', 'art', 'public speaking', 'coaching', 'analytics'
    ];
    
    const extractedSkills = commonSkills.filter(skill => 
      words.some(word => word.includes(skill.toLowerCase()))
    ).map(skill => 
      // Capitalize first letter of each word
      skill.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    );

    // Return the extracted skills
    return new Response(JSON.stringify({ skills: extractedSkills }), {
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