import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { question, lessonContent, lessonTitle } = await req.json();

    if (!question || !lessonContent) {
      return new Response(
        JSON.stringify({ error: 'Question and lesson content are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    // Call Groq API with LLaMA 3
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an AI teaching assistant for AeonWise, helping students learn programming. You are currently helping with a lesson titled "${lessonTitle}". 

Your role is to:
- Answer questions clearly and concisely
- Provide helpful explanations related to the lesson content
- Give practical examples when appropriate
- Encourage learning and problem-solving
- Keep responses focused on the lesson topic
- Use a friendly, supportive tone

Lesson content for context:
${lessonContent}

Provide helpful, accurate answers that support the student's learning journey.`
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
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const groqResponse = await response.json();
    const answer = groqResponse.choices[0].message.content;

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in course Q&A:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});