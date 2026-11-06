export interface VoicePersona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  baseVoice: 'Fenrir' | 'Charon' | 'Puck' | 'Zephyr' | 'Kore';
  gender: 'male';
  sampleText: string;
  defaultStyle: string;
  category: 'broadcast' | 'documentary' | 'interview' | 'podcast' | 'cinematic';
  accentSupport: string[];
  depthScore: number; // 1-100 baritone richness
}

export interface PerformanceStyle {
  id: string;
  name: string;
  description: string;
  promptDirective: string;
  suggestedEmotion: string;
  icon: string;
}

export interface VoiceSettings {
  pacing: number; // 0.8 to 1.3
  depth: number; // 50 to 100
  energy: 'calm' | 'balanced' | 'intense';
  formality: 'formal' | 'semi-formal' | 'casual';
  articulation: 'crisp' | 'natural' | 'soft';
  emotion: 'solemn' | 'enthusiastic' | 'neutral' | 'dramatic' | 'warm';
  includeBreaths: boolean;
  pauseLength: 'brief' | 'standard' | 'cinematic';
}

export interface DialogueLine {
  id: string;
  speaker: 'host' | 'guest';
  text: string;
  emotion?: string;
  styleNote?: string;
}

export interface GeneratedAudioItem {
  id: string;
  title: string;
  text: string;
  voiceName: string;
  styleName: string;
  audioBase64: string;
  createdAt: number;
  duration?: number;
  isInterview?: boolean;
  speakers?: string[];
}

export interface StudioProject {
  id: string;
  title: string;
  updatedAt: number;
  type: 'single' | 'interview';
  text?: string;
  voiceId?: string;
  styleId?: string;
  dialogue?: DialogueLine[];
  hostVoice?: string;
  guestVoice?: string;
}
