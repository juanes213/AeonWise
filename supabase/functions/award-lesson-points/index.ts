import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { userId, courseId, lessonId, skill } = await req.json();

    if (!userId || !courseId || !lessonId) {
      return new Response(
        JSON.stringify({ error: 'User ID, course ID, and lesson ID are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Award points for lesson completion (50 points per lesson)
    const pointsAwarded = 50;

    // Get user's current points and skills
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('points, skills')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const currentPoints = userData.points || 0;
    const currentSkills = userData.skills || [];
    const newPoints = currentPoints + pointsAwarded;

    // Add skill if not already present
    const updatedSkills = currentSkills.includes(skill) 
      ? currentSkills 
      : [...currentSkills, skill];

    // Calculate new rank
    const calculateRank = (points: number): string => {
      if (points >= 1601) return 'cosmic_sage';
      if (points >= 1201) return 'galactic_guide';
      if (points >= 801) return 'comet_crafter';
      if (points >= 501) return 'astral_apprentice';
      if (points >= 251) return 'nebula_novice';
      return 'starspark';
    };

    const newRank = calculateRank(newPoints);

    // Update user's points and skills
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        points: newPoints,
        skills: updatedSkills,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Record the points earned
    const { error: pointsError } = await supabase
      .from('rank_points')
      .insert({
        user_id: userId,
        source: 'lesson_completion',
        points: pointsAwarded,
        details: {
          courseId,
          lessonId,
          skill,
          newPoints,
          newRank
        }
      });

    if (pointsError) throw pointsError;

    return new Response(
      JSON.stringify({
        success: true,
        pointsAwarded,
        totalPoints: newPoints,
        newRank,
        skillAdded: !currentSkills.includes(skill)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error awarding lesson points:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});