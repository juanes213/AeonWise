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
            content: `You are an AI assistant for AeonWise, a skill-sharing platform. Extract teachable skills and learning goals from the input text, and generate a logical learning path for each goal. Return a JSON object with three keys: "teach" (array of skills the user can teach), "learn" (array of skills the user wants to learn), and "path" (array of steps for the first learning goal). Validate inputs to ensure clarity and specificity. Handle ambiguous inputs by selecting the most relevant skills or goals.

Example:
- Input: "I know Python, want to learn web development"
- Output: { "teach": ["Python"], "learn": ["Web Development"], "path": ["HTML", "CSS", "JavaScript"] }

Rules:
- Skills and goals must be specific (e.g., "coding" → "Python" if context suggests it).
- If input is vague (e.g., "I’m good at tech"), infer likely skills (e.g., ["Technology"]) and note ambiguity.
- Learning paths should be concise (3-5 steps) and practical.
- Return valid JSON, even for invalid inputs (use empty arrays if no skills/goals are detected).
- Flag ambiguous inputs with a "notes" key in the output.`
          },
          {
            role: 'user',
            content: `Extract skills, goals, and generate a learning path for: "${userInput}"`
          }
        ],
        temperature: 0.5,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const groqResponse = await response.json();
    const result = JSON.parse(groqResponse.choices[0].message.content);

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
        throw updateError;
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