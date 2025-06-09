import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, user-id',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface ExperienceAnalysis {
  yearsExperience: number;
  skills: string[];
  certifications: string[];
  projects: string[];
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);
    if (response.ok) return response;
    if (response.status === 429) {
      await new Promise(resolve => setTimeout(resolve, backoff * (2 ** i)));
      continue;
    }
    throw new Error(`Hugging Face API error: ${response.statusText}`);
  }
  throw new Error('Max retries reached');
}

async function extractSkillsFromText(text: string): Promise<string[]> {
  const hfApiKey = Deno.env.get('HF_API_KEY');
  if (!hfApiKey) throw new Error('Missing Hugging Face API key');

  const response = await fetchWithRetry('https://api-inference.huggingface.co/models/dslim/bert-base-NER', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hfApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: text })
  });

  const entities = await response.json();
  const skills: Set<string> = new Set();

  // Define skill keywords from CV context
  const skillKeywords = [
    'python', 'r', 'typescript', 'javascript', 'sql', 'react', 'tailwind css', 'vite', 'supabase', 'postgresql',
    'mongodb', 'power bi', 'tableau', 'dash', 'r shiny', 'docker', 'git', 'jupyter notebook',
    'machine learning', 'nlp', 'generative ai', 'computer vision', 'transformers', 'gpt', 'bert',
    'pandas', 'numpy', 'tensorflow', 'pytorch', 'xgboost', 'lgbm', 'random forest', 'gradient boosting'
  ].map(s => s.toLowerCase());

  // Extract skills from NER entities and match with keywords
  let currentSkill = '';
  for (const entity of entities) {
    if (entity.entity_group === 'MISC' || entity.entity_group === 'ORG') {
      currentSkill += (currentSkill ? ' ' : '') + entity.word.toLowerCase();
      if (skillKeywords.includes(currentSkill)) {
        skills.add(currentSkill.charAt(0).toUpperCase() + currentSkill.slice(1));
        currentSkill = '';
      }
    } else {
      if (currentSkill && skillKeywords.includes(currentSkill)) {
        skills.add(currentSkill.charAt(0).toUpperCase() + currentSkill.slice(1));
      }
      currentSkill = '';
    }
  }

  // Fallback: Check CV's Technical Skills section directly
  const skillsSectionMatch = text.match(/Technical Skills([\s\S]*?)(?:Languages|Certifications|Projects|$)/i);
  if (skillsSectionMatch) {
    const skillsText = skillsSectionMatch[1].toLowerCase();
    skillKeywords.forEach(skill => {
      if (skillsText.includes(skill)) {
        skills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });
  }

  return [...skills];
}

function extractExperienceYears(text: string): number {
  const datePatterns = [
    /(\w+\s+\d{4})\s*-\s*(\w+\s+\d{4}|Present)/gi
  ];

  let totalMonths = 0;
  const matches = text.matchAll(datePatterns);
  const currentDate = new Date('2025-06-09'); // Hackathon date

  for (const match of matches) {
    const startDate = new Date(match[1]);
    const endDate = match[2].toLowerCase() === 'present' ? currentDate : new Date(match[2]);
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
      totalMonths += months;
    }
  }

  return Math.floor(totalMonths / 12); // Convert to years
}

function extractCertificationsAndProjects(text: string): { certifications: string[], projects: string[] } {
  const certifications: string[] = [];
  const projects: string[] = [];

  // Extract certifications
  const certSectionMatch = text.match(/Certifications?([\s\S]*?)(?:Projects?|Education|Experience|$)/i);
  if (certSectionMatch) {
    const certText = certSectionMatch[1];
    const certLines = certText.split('\n').filter(line => line.trim().length > 0);
    certifications.push(...certLines.map(line => line.trim()));
  }

  // Extract projects
  const projectSectionMatch = text.match(/Projects?([\s\S]*?)(?:Certifications?|Education|Experience|$)/i);
  if (projectSectionMatch) {
    const projectText = projectSectionMatch[1];
    const projectLines = projectText.split('\n').filter(line => line.trim().length > 0);
    projects.push(...projectLines.map(line => line.trim()));
  }

  return { certifications, projects };
}

function calculatePoints(analysis: ExperienceAnalysis): number {
  let points = 0;
  
  // Points for experience (10 points per year)
  points += analysis.yearsExperience * 10;
  
  // Points for skills (5 points per skill)
  points += analysis.skills.length * 5;
  
  // Points for certifications (15 points per certification)
  points += analysis.certifications.length * 15;
  
  // Points for projects (10 points per project)
  points += analysis.projects.length * 10;
  
  return points;
}

function calculateRank(points: number): string {
  if (points >= 500) return 'Cosmic Master';
  if (points >= 400) return 'Stellar Expert';
  if (points >= 300) return 'Galactic Specialist';
  if (points >= 200) return 'Planetary Professional';
  if (points >= 100) return 'Orbital Apprentice';
  return 'Space Cadet';
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { cvText, userId } = await req.json();

    if (!cvText || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: cvText and userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract information from CV
    const skills = await extractSkillsFromText(cvText);
    const yearsExperience = extractExperienceYears(cvText);
    const { certifications, projects } = extractCertificationsAndProjects(cvText);

    const analysis: ExperienceAnalysis = {
      yearsExperience,
      skills,
      certifications,
      projects
    };

    // Calculate points and rank
    const points = calculatePoints(analysis);
    const rank = calculateRank(points);

    // Update user profile with extracted skills and calculated points
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        skills: analysis.skills,
        points: points,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    // Record rank points entry
    const { error: rankPointsError } = await supabase
      .from('rank_points')
      .insert({
        user_id: userId,
        source: 'cv_analysis',
        points: points,
        details: {
          analysis,
          rank
        }
      });

    if (rankPointsError) {
      console.error('Failed to record rank points:', rankPointsError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        points,
        rank,
        message: 'CV analysis completed successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-profile function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});