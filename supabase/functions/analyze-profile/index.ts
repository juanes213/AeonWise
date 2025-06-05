import { HfInference } from 'npm:@huggingface/inference@2.6.4';
import { Anthropic } from 'npm:@anthropic-ai/sdk@0.17.1';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const hf = new HfInference(Deno.env.get('HF_API_KEY'));
const anthropic = new Anthropic({
  apiKey: Deno.env.get('CLAUDE_API_KEY'),
});

interface ExperienceAnalysis {
  yearsExperience: number;
  skills: string[];
  certifications: string[];
  projects: string[];
}

function calculatePoints(analysis: ExperienceAnalysis): number {
  let totalPoints = 0;

  // Experience points (75 per year)
  totalPoints += analysis.yearsExperience * 75;

  // Skill points (40 per skill)
  totalPoints += analysis.skills.length * 40;

  // Certification points (80 per cert)
  totalPoints += analysis.certifications.length * 80;

  // Project points (60 per project)
  totalPoints += analysis.projects.length * 60;

  // Cap initial points at 1800
  return Math.min(totalPoints, 1800);
}

function calculateRank(points: number): string {
  if (points >= 1601) return 'cosmic_sage';
  if (points >= 1201) return 'galactic_guide';
  if (points >= 801) return 'comet_crafter';
  if (points >= 501) return 'astral_apprentice';
  if (points >= 251) return 'nebula_novice';
  return 'starspark';
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

    // Use Claude to analyze experience and extract structured data
    const systemPrompt = `Analyze the user's CV or experience description and extract:
    1. Total years of experience
    2. List of technical skills
    3. List of certifications
    4. List of significant projects
    
    Format as JSON with these fields:
    {
      "yearsExperience": number,
      "skills": string[],
      "certifications": string[],
      "projects": string[]
    }
    
    Rules:
    - Validate claims (e.g., flag unrealistic experience like 50 years)
    - Only include relevant technical skills
    - Verify certification names are real
    - Count only substantial projects`;

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }]
    });

    const analysis: ExperienceAnalysis = JSON.parse(message.content[0].text);

    // Use BERT to verify skills
    const skillVerification = await Promise.all(
      analysis.skills.map(async (skill) => {
        const response = await hf.textClassification({
          model: 'bert-base-uncased',
          inputs: `Skill: ${skill}`,
        });
        return {
          skill,
          confidence: response[0].score,
        };
      })
    );

    // Filter out skills with low confidence
    analysis.skills = skillVerification
      .filter((result) => result.confidence > 0.7)
      .map((result) => result.skill);

    // Calculate points and rank
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
        skills: analysis.skills,
        last_activity: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // Record initial points in rank_points
    const { error: pointsError } = await supabase
      .from('rank_points')
      .insert({
        user_id: userId,
        source: 'initial_analysis',
        points,
        details: {
          yearsExperience: analysis.yearsExperience,
          skillCount: analysis.skills.length,
          certCount: analysis.certifications.length,
          projectCount: analysis.projects.length,
        },
      });

    if (pointsError) {
      throw pointsError;
    }

    return new Response(
      JSON.stringify({
        analysis,
        points,
        rank,
        skillVerification,
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