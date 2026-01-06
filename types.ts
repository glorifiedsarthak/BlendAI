
export enum ProjectStep {
  SCRIPTING = 'scripting',
  STUDIO = 'studio',
  EXPORT = 'export'
}

export interface Scene {
  id: string;
  title: string;
  visualPrompt: string;
  audioScript: string;
  speaker: 'Joe' | 'Jane';
  videoUrl?: string;
  audioUrl?: string;
  status: 'pending' | 'generating-video' | 'generating-audio' | 'completed' | 'error';
  progress?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  scenes: Scene[];
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Global window extensions for AI Studio API Key selection
declare global {
  /**
   * The AIStudio interface is expected by the environment for API key selection.
   * Defining it here as an interface allows it to merge with any existing global definitions.
   */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    /**
     * The aistudio property must match the environmental 'AIStudio' type to resolve redeclaration conflicts.
     */
    aistudio: AIStudio;
    webkitAudioContext: typeof AudioContext;
  }
}
