import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { HfInference } from 'npm:@huggingface/inference@2.6.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

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
    const { userId, matchId, skillsShared } = await req.json();

    if (!userId || !matchId || !skillsShared) {
      return new Response(
        JSON.stringify({ error: 'User ID, match ID, and skills shared are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Award points for skill swap (50 points per skill, max 500)
    const swapPoints = Math.min(skillsShared * 50, 500);

    // Get user's current points and experience
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('points, skills, certifications')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Use Hugging Face for CV analysis
    const hf = new HfInference(Deno.env.get('HF_API_KEY'));
    const cvAnalysis = await hf.textClassification({
      model: 'bert-base-uncased',
      inputs: JSON.stringify({
        skills: userData.skills,
        certifications: userData.certifications
      })
    });

    // Calculate total points
    const analysis: ExperienceAnalysis = {
      yearsExperience: Math.floor(Math.random() * 10) + 1, // Mock value
      skills: userData.skills || [],
      certifications: userData.certifications || [],
      projects: [] // Could be added in future
    };

    const basePoints = calculatePoints(analysis);
    const totalPoints = basePoints + swapPoints;
    const newRank = calculateRank(totalPoints);

    // Update user's points and rank
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        points: totalPoints,
        rank: newRank,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Record the points earned
    const { error: pointsError } = await supabase
      .from('rank_points')
      .insert({
        user_id: userId,
        source: 'skill_swap',
        points: swapPoints,
        details: {
          matchId,
          skillsShared,
          basePoints,
          totalPoints,
          newRank
        }
      });

    if (pointsError) throw pointsError;

    return new Response(
      JSON.stringify({
        success: true,
        pointsEarned: swapPoints,
        totalPoints,
        newRank
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