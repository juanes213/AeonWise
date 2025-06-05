import { HfInference } from 'npm:@huggingface/inference@2.6.4';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const hf = new HfInference(Deno.env.get('HF_API_KEY'));

interface SkillAnalysis {
  skill: string;
  yearsExperience: number;
  confidence: number;
}

function calculatePoints(analysis: SkillAnalysis[]): number {
  let totalPoints = 0;

  for (const skill of analysis) {
    // Base points for having the skill
    const basePoints = 50;
    
    // Points for years of experience (100 per year)
    const experiencePoints = skill.yearsExperience * 100;
    
    // Confidence multiplier (0.5 to 1.0)
    const confidenceMultiplier = 0.5 + (skill.confidence * 0.5);
    
    // Calculate total points for this skill
    const skillPoints = (basePoints + experiencePoints) * confidenceMultiplier;
    
    totalPoints += skillPoints;
  }

  // Cap total points at 1000
  return Math.min(totalPoints, 1000);
}

function calculateRank(points: number): string {
  if (points >= 801) return 'master';
  if (points >= 601) return 'expert';
  if (points >= 401) return 'journeyman';
  if (points >= 201) return 'apprentice';
  return 'novice';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { text, userId } = await req.json();

    if (!text || !userId) {
      return new Response(
        JSON.stringify({ error: 'Text and userId are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use BERT to analyze the text
    const response = await hf.textClassification({
      model: 'bert-base-uncased',
      inputs: text,
    });

    // Extract skills and experience using zero-shot classification
    const skillsResponse = await hf.zeroShotClassification({
      model: 'facebook/bart-large-mnli',
      inputs: text,
      parameters: {
        candidate_labels: [
          'programming',
          'design',
          'data science',
          'marketing',
          'business',
          'communication',
        ],
      },
    });

    // Analyze the text to identify skills and experience
    const analysis: SkillAnalysis[] = skillsResponse.labels.map((skill, index) => ({
      skill,
      yearsExperience: Math.floor(Math.random() * 10) + 1, // In a real app, this would be extracted from the text
      confidence: skillsResponse.scores[index],
    }));

    // Calculate points based on the analysis
    const points = calculatePoints(analysis);
    const rank = calculateRank(points);

    // Update the user's profile in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        points,
        skills: analysis.map(a => a.skill),
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        analysis,
        points,
        rank,
      }),
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