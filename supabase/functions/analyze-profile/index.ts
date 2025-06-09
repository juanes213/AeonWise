import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

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

function extractSkillsFromText(text: string): string[] {
  const skillKeywords = [
    // Programming Languages
    'javascript', 'python', 'java', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    // Web Technologies
    'html', 'css', 'react', 'vue', 'angular', 'node.js', 'express', 'django', 'flask', 'laravel',
    // Databases
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'ci/cd',
    // Data & AI
    'machine learning', 'data science', 'tensorflow', 'pytorch', 'pandas', 'numpy',
    // Design & Marketing
    'photoshop', 'illustrator', 'figma', 'ui/ux', 'graphic design', 'marketing', 'seo',
    // Business
    'project management', 'agile', 'scrum', 'leadership', 'communication'
  ];

  const lowerText = text.toLowerCase();
  const foundSkills: string[] = [];

  skillKeywords.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  return [...new Set(foundSkills)]; // Remove duplicates
}

function extractExperienceYears(text: string): number {
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi,
    /(\d+)\+?\s*years?\s*in/gi,
    /experience\s*:\s*(\d+)\+?\s*years?/gi,
    /(\d+)\+?\s*years?\s*working/gi
  ];

  let maxYears = 0;
  
  experiencePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const years = parseInt(match[1]);
      if (years > maxYears && years <= 50) { // Cap at 50 years for realism
        maxYears = years;
      }
    }
  });

  return maxYears;
}

function extractCertifications(text: string): string[] {
  const certPatterns = [
    /certified?\s+([a-z\s]+)/gi,
    /certification\s+in\s+([a-z\s]+)/gi,
    /(aws|azure|google|microsoft|cisco|oracle)\s+certified/gi,
    /(pmp|cissp|cisa|cism|comptia)/gi
  ];

  const certifications: string[] = [];
  
  certPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        certifications.push(match[1].trim());
      } else {
        certifications.push(match[0].trim());
      }
    }
  });

  return [...new Set(certifications)];
}

function extractProjects(text: string): string[] {
  const projectPatterns = [
    /project\s*:\s*([^\n\r.]+)/gi,
    /developed\s+([^\n\r.]+)/gi,
    /built\s+([^\n\r.]+)/gi,
    /created\s+([^\n\r.]+)/gi
  ];

  const projects: string[] = [];
  
  projectPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 10 && match[1].length < 100) {
        projects.push(match[1].trim());
      }
    }
  });

  return [...new Set(projects)].slice(0, 10); // Limit to 10 projects
}

function analyzeTextLocally(text: string): ExperienceAnalysis {
  return {
    yearsExperience: extractExperienceYears(text),
    skills: extractSkillsFromText(text),
    certifications: extractCertifications(text),
    projects: extractProjects(text)
  };
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

    // Use local text analysis as fallback
    const analysis: ExperienceAnalysis = analyzeTextLocally(text);

    // Calculate points and rank
    const points = calculatePoints(analysis);
    const rank = calculateRank(points);

    // Update the user's profile in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current user data first
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('skills, points')
      .eq('id', userId)
      .single();

    // Merge existing skills with new ones
    const existingSkills = currentProfile?.skills || [];
    const mergedSkills = [...new Set([...existingSkills, ...analysis.skills])];

    // Add points to existing total
    const currentPoints = currentProfile?.points || 0;
    const newTotalPoints = currentPoints + points;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        points: newTotalPoints,
        skills: mergedSkills,
        last_activity: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // Record points in rank_points
    const { error: pointsError } = await supabase
      .from('rank_points')
      .insert({
        user_id: userId,
        source: 'cv_analysis',
        points,
        details: {
          yearsExperience: analysis.yearsExperience,
          skillCount: analysis.skills.length,
          certCount: analysis.certifications.length,
          projectCount: analysis.projects.length,
          method: 'local_analysis'
        },
      });

    if (pointsError) {
      throw pointsError;
    }

    return new Response(
      JSON.stringify({
        analysis,
        points,
        rank: calculateRank(newTotalPoints),
        totalPoints: newTotalPoints,
        method: 'local_analysis'
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