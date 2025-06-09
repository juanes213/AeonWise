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
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }), 
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
            content: `You are an AI assistant for AeonWise, a skill-sharing platform. Extract teachable skills and learning goals from the input text, and generate a logical learning path for each goal. Return a JSON object with three keys: "teach" (array of skills the user can teach), "learn" (array of skills the user wants to learn), and "path" (array of steps for the first learning goal). 

IMPORTANT RULES:
- Clean up skills by removing phrases like "I know", "I can", "I am good at"
- Extract only the core skill names (e.g., "I know Python" → "Python")
- For learning goals, remove phrases like "I want to learn", "I need to learn"
- Skills and goals must be specific and concise
- Return valid JSON, even for invalid inputs (use empty arrays if no skills/goals are detected)

Example:
- Input: "I know Python, machine learning, I want to learn web development"
- Output: { "teach": ["Python", "Machine Learning"], "learn": ["Web Development"], "path": ["HTML", "CSS", "JavaScript", "React"] }`
          },
          {
            role: 'user',
            content: `Extract skills, goals, and generate a learning path for: "${text}"`
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
    let result;
    
    try {
      result = JSON.parse(groqResponse.choices[0].message.content);
    } catch (parseError) {
      // Fallback parsing if JSON is malformed
      const content = groqResponse.choices[0].message.content;
      result = {
        teach: [],
        learn: [],
        path: []
      };
      
      // Simple regex extraction as fallback
      const teachMatch = content.match(/"teach":\s*\[(.*?)\]/);
      const learnMatch = content.match(/"learn":\s*\[(.*?)\]/);
      
      if (teachMatch) {
        result.teach = teachMatch[1].split(',').map((s: string) => s.trim().replace(/"/g, ''));
      }
      if (learnMatch) {
        result.learn = learnMatch[1].split(',').map((s: string) => s.trim().replace(/"/g, ''));
      }
    }

    // Store in Supabase if user_id is provided
    if (req.headers.get('user-id')) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          skills: result.teach,
          learning_goals: result.learn,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.headers.get('user-id'));

      if (updateError) {
        console.error('Error updating profile:', updateError);
      }
    }

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