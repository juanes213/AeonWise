interface AudioSettings {
  voice: string;
  speed: number;
  stability: number;
  clarity: number;
}

interface AudioCache {
  [key: string]: string; // URL to cached audio
}

class AudioService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private cache: AudioCache = {};
  private currentAudio: HTMLAudioElement | null = null;
  private settings: AudioSettings = {
    voice: 'EXAVITQu4vr4xnSDxMaL', // Bella - clear, educational voice
    speed: 1.0,
    stability: 0.75,
    clarity: 0.75
  };

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  }

  // Check if the service is properly configured
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  // Get configuration status message
  getConfigurationMessage(): string {
    if (!this.apiKey || this.apiKey.trim().length === 0) {
      return 'Audio features require an ElevenLabs API key. Please add VITE_ELEVENLABS_API_KEY to your environment variables.';
    }
    return 'Audio service is ready';
  }

  // Format content for better audio narration
  private formatContentForAudio(content: string): string {
    return content
      // Add pauses after headings
      .replace(/^(#{1,6})\s+(.+)$/gm, '$2. ')
      // Add pauses after bullet points
      .replace(/^\s*[-*+]\s+(.+)$/gm, '$1. ')
      // Add pauses after numbered lists
      .replace(/^\s*\d+\.\s+(.+)$/gm, '$1. ')
      // Clean up code blocks for audio
      .replace(/```[\s\S]*?```/g, ' Code example. ')
      .replace(/`([^`]+)`/g, '$1')
      // Add pronunciation guides for technical terms
      .replace(/\bPython\b/g, 'Python programming language')
      .replace(/\bAPI\b/g, 'A P I')
      .replace(/\bHTML\b/g, 'H T M L')
      .replace(/\bCSS\b/g, 'C S S')
      .replace(/\bJSON\b/g, 'J S O N')
      .replace(/\bSQL\b/g, 'S Q L')
      // Clean up markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      // Add natural pauses
      .replace(/\.\s+/g, '. ')
      .replace(/:\s+/g, ': ')
      .replace(/;\s+/g, '; ')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Generate comprehensive lesson audio content
  private generateLessonScript(lesson: any): string {
    const sections = [];

    // Introduction
    sections.push(`Welcome to lesson ${lesson.title}.`);
    
    // Learning objectives
    if (lesson.objectives && lesson.objectives.length > 0) {
      sections.push('In this lesson, you will learn the following objectives:');
      lesson.objectives.forEach((objective: string, index: number) => {
        sections.push(`Objective ${index + 1}: ${objective}.`);
      });
    }

    // Key points
    if (lesson.keyPoints && lesson.keyPoints.length > 0) {
      sections.push('Here are the key points we will cover:');
      lesson.keyPoints.forEach((point: string, index: number) => {
        sections.push(`Key point ${index + 1}: ${point}.`);
      });
    }

    // Main content - handle both old and new lesson structures
    if (lesson.content) {
      sections.push('Now, let us begin with the main lesson content.');
      sections.push(this.formatContentForAudio(lesson.content));
    } else if (lesson.sections && lesson.sections.length > 0) {
      sections.push('Now, let us begin with the main lesson content.');
      lesson.sections.forEach((section: any) => {
        sections.push(`Section: ${section.heading}.`);
        sections.push(this.formatContentForAudio(section.body));
      });
    }

    // Exercise introduction
    if (lesson.exercise) {
      sections.push('Now it is time for the practical exercise.');
      sections.push(`Exercise: ${lesson.exercise.description}`);
      
      // Hints
      if (lesson.exercise.hints && lesson.exercise.hints.length > 0) {
        sections.push('Here are some hints to help you:');
        lesson.exercise.hints.forEach((hint: string, index: number) => {
          sections.push(`Hint ${index + 1}: ${hint}.`);
        });
      }
    }

    // Conclusion
    sections.push(`This concludes the lesson on ${lesson.title}. Great job on completing this section!`);

    return sections.join(' ');
  }

  // Generate audio using ElevenLabs API
  async generateAudio(text: string, options?: Partial<AudioSettings>): Promise<string | null> {
    if (!this.isConfigured()) {
      throw new Error('ElevenLabs API key not configured. Please add VITE_ELEVENLABS_API_KEY to your environment variables.');
    }

    const cacheKey = this.getCacheKey(text, options);
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const settings = { ...this.settings, ...options };
      
      const response = await fetch(`${this.baseUrl}/text-to-speech/${settings.voice}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text.substring(0, 5000), // Limit text length to avoid API limits
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: settings.stability,
            similarity_boost: settings.clarity,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error (${response.status}):`, errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid ElevenLabs API key. Please check your VITE_ELEVENLABS_API_KEY environment variable.');
        } else if (response.status === 429) {
          throw new Error('ElevenLabs API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
        }
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the audio URL
      this.cache[cacheKey] = audioUrl;
      
      return audioUrl;
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    }
  }

  // Generate audio for complete lesson
  async generateLessonAudio(lesson: any): Promise<string | null> {
    const script = this.generateLessonScript(lesson);
    return this.generateAudio(script);
  }

  // Generate audio for specific content sections
  async generateSectionAudio(content: string, type: 'objective' | 'keypoint' | 'content' | 'exercise' | 'hint'): Promise<string | null> {
    let formattedContent = '';
    
    switch (type) {
      case 'objective':
        formattedContent = `Learning objective: ${content}`;
        break;
      case 'keypoint':
        formattedContent = `Key point: ${content}`;
        break;
      case 'exercise':
        formattedContent = `Exercise: ${content}`;
        break;
      case 'hint':
        formattedContent = `Hint: ${content}`;
        break;
      default:
        formattedContent = this.formatContentForAudio(content);
    }

    return this.generateAudio(formattedContent);
  }

  // Play audio with controls
  async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      // Fixed: Use proper Audio constructor
      const audio = new Audio(audioUrl);
      audio.playbackRate = this.settings.speed;
      
      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        this.currentAudio = null;
        reject(new Error('Audio playback failed'));
      };

      audio.onloadeddata = () => {
        audio.play().then(() => {
          this.currentAudio = audio;
        }).catch(reject);
      };

      // Start loading the audio
      audio.load();
    });
  }

  // Control playback
  pauseAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }

  resumeAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.play().catch(error => {
        console.error('Error resuming audio:', error);
      });
    }
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  // Update settings
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    if (this.currentAudio) {
      this.currentAudio.playbackRate = this.settings.speed;
    }
  }

  // Get available voices - Fixed to handle API errors gracefully
  async getAvailableVoices(): Promise<any[]> {
    if (!this.isConfigured()) {
      console.warn('ElevenLabs API key not configured');
      return this.getDefaultVoices();
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch voices: ${response.status}`);
        
        if (response.status === 401) {
          console.error('ElevenLabs API key is invalid or expired. Please check your VITE_ELEVENLABS_API_KEY environment variable.');
        }
        
        // Return default voices on error instead of throwing
        return this.getDefaultVoices();
      }

      const data = await response.json();
      return data.voices || this.getDefaultVoices();
    } catch (error) {
      console.error('Error fetching voices:', error);
      return this.getDefaultVoices();
    }
  }

  // Provide default voices when API is unavailable
  private getDefaultVoices(): any[] {
    return [
      {
        voice_id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Bella',
        labels: { accent: 'American' }
      },
      {
        voice_id: 'UgBBYS2sOqTuMpoF3BR0',
        name: 'Sarah',
        labels: { accent: 'British' }
      },
      {
        voice_id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Adam',
        labels: { accent: 'American' }
      }
    ];
  }

  // Utility methods
  private getCacheKey(text: string, options?: Partial<AudioSettings>): string {
    const settings = { ...this.settings, ...options };
    return btoa(encodeURIComponent(text.substring(0, 100) + JSON.stringify(settings)));
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  getCurrentTime(): number {
    return this.currentAudio?.currentTime || 0;
  }

  getDuration(): number {
    return this.currentAudio?.duration || 0;
  }

  setCurrentTime(time: number): void {
    if (this.currentAudio) {
      this.currentAudio.currentTime = time;
    }
  }

  // Clean up resources
  cleanup(): void {
    this.stopAudio();
    Object.values(this.cache).forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.cache = {};
  }
}

export const audioService = new AudioService();
export type { AudioSettings };