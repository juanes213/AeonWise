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
    const { topic, level } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // In a real implementation, this would call Claude API to generate course content
    // For demo purposes, we'll return a mock course structure
    const modules = [
      { title: 'Introduction to the Topic', duration: 30 },
      { title: 'Core Concepts and Principles', duration: 45 },
      { title: 'Practical Applications', duration: 60 },
      { title: 'Advanced Techniques', duration: 45 },
      { title: 'Case Studies and Examples', duration: 60 },
      { title: 'Hands-on Project', duration: 90 },
      { title: 'Final Assessment', duration: 30 },
    ];

    const courseLevel = level || 'beginner';
    const courseDuration = modules.reduce((total, module) => total + module.duration, 0) / 60; // Convert to hours

    // Generate a course title based on topic
    const courseTitle = `Mastering ${topic}: A Comprehensive Guide`;
    
    // Generate a description
    const courseDescription = `This ${courseLevel}-level course covers all aspects of ${topic}, from foundational concepts to advanced techniques. Learn through practical examples, hands-on exercises, and real-world case studies.`;

    const courseData = {
      title: courseTitle,
      description: courseDescription,
      level: courseLevel,
      duration: Math.round(courseDuration),
      modules: modules.length,
      moduleDetails: modules,
    };

    // Return the generated course
    return new Response(JSON.stringify({ course: courseData }), {
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