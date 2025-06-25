# AeonWise Learning Platform

A cosmic-themed interactive learning platform with AI-powered features, gamification, and mentorship.

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ElevenLabs API (for audio narration)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Groq AI API (for Q&A system)
VITE_GROQ_API_KEY=your_groq_api_key
```

## Recent Fixes Applied

### 1. Background Integration
- Fixed StarfieldBackground z-index from `z-[-1]` to `z-0` to ensure proper layering
- Background now displays correctly on all pages

### 2. Points System
- Enhanced UserContext updateProfile function to properly save points to database
- Added better error handling and logging for debugging
- Points are now correctly calculated and persisted

### 3. Mock Mentor Profiles
- Replaced database queries with comprehensive mock data for hackathon demo
- Added 6 diverse mentor profiles across different categories
- Each mentor has realistic credentials, pricing, and availability

### 4. API Integration
- All APIs are configured to use Supabase secrets
- Environment variables are properly structured for Vite
- Audio and AI services are ready for integration

## Features

- Interactive Python course with Monaco Editor
- AI-powered Q&A system
- Audio narration (ElevenLabs integration)
- Gamification with cosmic-themed ranking system
- Comprehensive user profiles with work experience, projects, certifications
- Mentorship marketplace with mock profiles
- Responsive cosmic UI with starfield background
