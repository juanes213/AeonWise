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

  // Fallback: Check CV’s Technical Skills section directly
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

function extract