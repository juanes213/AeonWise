import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX,
  Settings, Loader2, Headphones, Clock, Mic, Download
} from 'lucide-react';
import { audioService, AudioSettings } from '../../services/audioService';

interface AudioPlayerProps {
  lesson: any;
  onAudioStateChange?: (isPlaying: boolean) => void;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  lesson,
  onAudioStateChange,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [settings, setSettings] = useState<AudioSettings>({
    voice: 'EXAVITQu4vr4xnSDxMaL',
    speed: 1.0,
    stability: 0.75,
    clarity: 0.75
  });

  const progressRef = useRef<HTMLDivElement>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadAvailableVoices();
    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
      audioService.cleanup();
    };
  }, []);

  useEffect(() => {
    onAudioStateChange?.(isPlaying);
  }, [isPlaying, onAudioStateChange]);

  useEffect(() => {
    if (isPlaying) {
      timeUpdateInterval.current = setInterval(() => {
        setCurrentTime(audioService.getCurrentTime());
        setDuration(audioService.getDuration());
      }, 1000);
    } else {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    }

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, [isPlaying]);

  const loadAvailableVoices = async () => {
    const voices = await audioService.getAvailableVoices();
    setAvailableVoices(voices);
  };

  const generateAndPlayAudio = async () => {
    setIsLoading(true);
    try {
      const url = await audioService.generateLessonAudio(lesson);
      if (url) {
        setAudioUrl(url);
        await audioService.playAudio(url);
        setIsPlaying(true);
      } else {
        throw new Error('Failed to generate audio');
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (isLoading) return;

    if (!audioUrl) {
      await generateAndPlayAudio();
      return;
    }

    if (isPlaying) {
      audioService.pauseAudio();
      setIsPlaying(false);
    } else {
      audioService.resumeAudio();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    audioService.stopAudio();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audioService.setCurrentTime(newTime);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Note: Volume control would need to be implemented in audioService
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Note: Mute functionality would need to be implemented in audioService
  };

  const updateAudioSettings = (newSettings: Partial<AudioSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    audioService.updateSettings(updatedSettings);
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `${lesson.title}-audio.mp3`;
      a.click();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`cosmos-card p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Headphones className="h-5 w-5 text-cosmic-gold-400" />
          <div>
            <h3 className="font-display text-lg">Audio Narration</h3>
            <p className="text-sm text-gray-400">Listen to the complete lesson</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {audioUrl && (
            <button
              onClick={downloadAudio}
              className="p-2 text-gray-400 hover:text-cosmic-blue-400 transition-colors"
              title="Download Audio"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Audio Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            ref={progressRef}
            className="w-full h-2 bg-cosmic-black/50 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-cosmic-purple-500 to-cosmic-gold-500 rounded-full"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => audioService.setCurrentTime(Math.max(0, currentTime - 10))}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={!audioUrl}
            title="Skip back 10 seconds"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            onClick={handlePlayPause}
            disabled={isLoading}
            className="p-4 bg-cosmic-purple-600 hover:bg-cosmic-purple-700 rounded-full text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>

          <button
            onClick={handleStop}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={!audioUrl}
            title="Stop"
          >
            <Square className="h-5 w-5" />
          </button>

          <button
            onClick={() => audioService.setCurrentTime(Math.min(duration, currentTime + 10))}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={!audioUrl}
            title="Skip forward 10 seconds"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleMute}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-cosmic-black/50 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <span className="text-xs text-gray-400 w-8">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

        {/* Audio Info */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>~{Math.ceil(lesson.estimatedTime * 1.5)} min audio</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mic className="h-3 w-3" />
              <span>AI Narrated</span>
            </div>
          </div>
          <div className="text-cosmic-gold-400">
            Speed: {settings.speed}x
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-cosmic-purple-700/30"
          >
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Audio Settings</h4>
              
              {/* Voice Selection */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Voice</label>
                <select
                  value={settings.voice}
                  onChange={(e) => updateAudioSettings({ voice: e.target.value })}
                  className="w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-3 py-1 text-sm text-white"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name} ({voice.labels?.accent || 'Unknown'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed Control */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Speed: {settings.speed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.speed}
                  onChange={(e) => updateAudioSettings({ speed: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-cosmic-black/50 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Stability Control */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Voice Stability: {Math.round(settings.stability * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.stability}
                  onChange={(e) => updateAudioSettings({ stability: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-cosmic-black/50 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Clarity Control */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Voice Clarity: {Math.round(settings.clarity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.clarity}
                  onChange={(e) => updateAudioSettings({ clarity: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-cosmic-black/50 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};