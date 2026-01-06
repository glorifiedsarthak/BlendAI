
import React, { useState, useEffect, useCallback } from 'react';
import { ProjectStep, Scene, Project } from './types';
import { generateScript, generateVideoForScene, generateAudioForScene } from './services/geminiService';
import Header from './components/Header';
import ScriptEditor from './components/ScriptEditor';
import Studio from './components/Studio';
import ProjectExporter from './components/ProjectExporter';

const App: React.FC = () => {
  const [step, setStep] = useState<ProjectStep>(ProjectStep.SCRIPTING);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true); // Assume success per instructions
    }
  };

  const handleStartProject = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const scenes = await generateScript(prompt);
      setProject({
        id: `proj-${Date.now()}`,
        title: prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''),
        description: prompt,
        scenes
      });
      setStep(ProjectStep.STUDIO);
    } catch (err: any) {
      setError(err.message || 'Failed to generate script');
    } finally {
      setIsLoading(false);
    }
  };

  const updateScene = (updatedScene: Scene) => {
    if (!project) return;
    setProject({
      ...project,
      scenes: project.scenes.map(s => s.id === updatedScene.id ? updatedScene : s)
    });
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
        <div className="max-w-md w-full glass p-10 rounded-3xl text-center space-y-6 animate-glow border-blue-500/30">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fas fa-clapperboard text-4xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CineNode Studio</h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            To generate high-quality 3D cinematic videos, you need to select a paid Google Cloud project key.
          </p>
          <div className="space-y-4 pt-4">
            <button
              onClick={handleSelectKey}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 transition-all rounded-xl font-semibold text-lg"
            >
              Select API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm text-zinc-500 hover:text-blue-400 transition-colors"
            >
              How to enable billing? <i className="fas fa-external-link-alt ml-1 text-xs"></i>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header step={step} setStep={setStep} />
      
      <main className="flex-1 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-zinc-300 font-medium">Directing your AI team...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="m-4 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        <div className="h-full container mx-auto px-4 py-8">
          {step === ProjectStep.SCRIPTING && (
            <ScriptEditor onStart={handleStartProject} isLoading={isLoading} />
          )}
          
          {step === ProjectStep.STUDIO && project && (
            <Studio project={project} onUpdateScene={updateScene} />
          )}

          {step === ProjectStep.EXPORT && project && (
            <ProjectExporter project={project} />
          )}
        </div>
      </main>

      <footer className="py-4 border-t border-zinc-800 text-center text-zinc-500 text-sm">
        CineNode AI Studio &copy; {new Date().getFullYear()} — Powered by Gemini & Veo
      </footer>
    </div>
  );
};

export default App;
