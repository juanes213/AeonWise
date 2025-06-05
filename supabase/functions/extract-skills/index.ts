import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { Anthropic } from 'npm:@anthropic-ai/sdk@0.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('CLAUDE_API_KEY') || '',
    });

    const systemPrompt = `Extract teachable skills and learning goals from the user's input. Also generate a learning path for their goals.
    Format the response as JSON with these fields:
    - skills: array of skills they can teach
    - learning_goals: array of skills they want to learn
    - learning_path: array of steps to achieve their learning goals
    
    Example input: "I know Python and data science, want to learn web development"
    Example output: {
      "skills": ["Python", "Data Science"],
      "learning_goals": ["Web Development"],
      "learning_path": ["HTML Fundamentals", "CSS Basics", "JavaScript Essentials", "React Framework"]
    }`;

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.5,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }]
    });

    const result = JSON.parse(message.content[0].text);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});