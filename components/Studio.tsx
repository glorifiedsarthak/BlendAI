
import React, { useState } from 'react';
import { Project, Scene } from '../types';
import { generateVideoForScene, generateAudioForScene } from '../services/geminiService';

interface StudioProps {
  project: Project;
  onUpdateScene: (scene: Scene) => void;
}

const Studio: React.FC<StudioProps> = ({ project, onUpdateScene }) => {
  const [activeSceneId, setActiveSceneId] = useState(project.scenes[0].id);

  const activeScene = project.scenes.find(s => s.id === activeSceneId) || project.scenes[0];

  const handleGenerateVideo = async (scene: Scene) => {
    onUpdateScene({ ...scene, status: 'generating-video' });
    try {
      const url = await generateVideoForScene(scene.visualPrompt);
      onUpdateScene({ ...scene, videoUrl: url, status: 'completed' });
    } catch (err) {
      console.error(err);
      onUpdateScene({ ...scene, status: 'error' });
    }
  };

  const handleGenerateAudio = async (scene: Scene) => {
    onUpdateScene({ ...scene, status: 'generating-audio' });
    try {
      const url = await generateAudioForScene(scene.audioScript, scene.speaker);
      onUpdateScene({ ...scene, audioUrl: url, status: 'completed' });
    } catch (err) {
      console.error(err);
      onUpdateScene({ ...scene, status: 'error' });
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-8">
      {/* Sidebar - Scene List */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest px-2">Production Queue</h2>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
          {project.scenes.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => setActiveSceneId(scene.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                activeSceneId === scene.id
                  ? 'bg-zinc-800 border-blue-500/50 shadow-lg'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-500">SCENE {idx + 1}</span>
                {scene.videoUrl && scene.audioUrl && (
                  <i className="fas fa-check-circle text-emerald-500 text-xs"></i>
                )}
              </div>
              <h3 className={`font-semibold text-sm line-clamp-1 ${activeSceneId === scene.id ? 'text-white' : 'text-zinc-400'}`}>
                {scene.title}
              </h3>
            </button>
          ))}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col">
        <div className="aspect-video bg-black relative flex items-center justify-center group">
          {activeScene.videoUrl ? (
            <video 
              src={activeScene.videoUrl} 
              controls 
              className="w-full h-full object-cover"
              autoPlay
              loop
            />
          ) : (
            <div className="text-center space-y-4">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                activeScene.status === 'generating-video' ? 'bg-blue-600/20' : 'bg-zinc-900'
              }`}>
                {activeScene.status === 'generating-video' ? (
                  <i className="fas fa-clapperboard text-3xl text-blue-500 animate-pulse"></i>
                ) : (
                  <i className="fas fa-image text-3xl text-zinc-700"></i>
                )}
              </div>
              <p className="text-zinc-500 font-medium italic">
                {activeScene.status === 'generating-video' ? 'Synthesizing visual content...' : 'Visual pending generation'}
              </p>
              {activeScene.status === 'pending' && (
                <button
                  onClick={() => handleGenerateVideo(activeScene)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-bold transition-all"
                >
                  Generate Video
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scene Details */}
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-zinc-900/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{activeScene.title}</h2>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                activeScene.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {activeScene.status.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Visual Prompt (Blender Optimized)</h3>
              <p className="text-zinc-300 bg-black/40 p-5 rounded-2xl border border-zinc-800 leading-relaxed text-sm">
                {activeScene.visualPrompt}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Audio Script ({activeScene.speaker})</h3>
                {activeScene.audioUrl ? (
                  <audio controls src={activeScene.audioUrl} className="h-8 w-40" />
                ) : (
                  <button
                    onClick={() => handleGenerateAudio(activeScene)}
                    disabled={activeScene.status === 'generating-audio'}
                    className="text-xs px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all"
                  >
                    {activeScene.status === 'generating-audio' ? 'Generating...' : 'Generate Audio'}
                  </button>
                )}
              </div>
              <div className="p-5 rounded-2xl border border-zinc-800 bg-black/40 italic text-zinc-400 text-sm">
                "{activeScene.audioScript}"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;
