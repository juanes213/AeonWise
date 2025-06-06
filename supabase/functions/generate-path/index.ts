import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

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
    const { goal, userId } = await req.json();

    if (!goal) {
      return new Response(
        JSON.stringify({ error: 'Learning goal is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Groq API with LLaMA 3
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for AeonWise, a skill-sharing platform. Generate a logical and concise learning path as a JSON array for the given learning goal. Each step should be a specific, beginner-friendly topic or skill. Limit the path to 3-5 steps. Ensure the output is valid JSON.

Example:
- Input: "Web Development"
- Output: ["HTML Basics", "CSS Fundamentals", "JavaScript Essentials", "React Framework"]

Rules:
- Paths must be practical and sequential (e.g., foundational skills before advanced).
- Use clear, descriptive step names (e.g., "Python Basics" instead of "Python").
- Return an empty array if the goal is invalid or too vague.`
          },
          {
            role: 'user',
            content:  `Generate a learning path for: "${learningGoal}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const groqResponse = await response.json();
    const learningPath = JSON.parse(groqResponse.choices[0].message.content);

    // Store in Supabase if userId is provided
    if (userId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          learning_path: learningPath,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }
    }

    return new Response(
      JSON.stringify({ path: learningPath }),
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