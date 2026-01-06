
import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectExporterProps {
  project: Project;
}

const ProjectExporter: React.FC<ProjectExporterProps> = ({ project }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);

  const completedScenes = project.scenes.filter(s => s.videoUrl && s.audioUrl);
  const isReady = completedScenes.length === project.scenes.length;

  const handlePlayMovie = () => {
    setIsPlaying(true);
    setCurrentSceneIdx(0);
  };

  const handleNextScene = () => {
    if (currentSceneIdx < completedScenes.length - 1) {
      setCurrentSceneIdx(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">Theater Mode</h1>
        <p className="text-zinc-400">Review your final AI-generated production.</p>
      </div>

      {!isReady && (
        <div className="p-8 glass border-amber-500/20 text-center rounded-3xl mb-8">
          <i className="fas fa-exclamation-triangle text-amber-500 text-3xl mb-4"></i>
          <h2 className="text-xl font-bold mb-2">Production in Progress</h2>
          <p className="text-zinc-500 mb-6">You need to generate all visuals and audio clips in the Studio before viewing the final movie.</p>
          <div className="flex justify-center space-x-2">
            {project.scenes.map((s, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${s.videoUrl && s.audioUrl ? 'bg-emerald-500' : 'bg-zinc-800'}`}></div>
            ))}
          </div>
        </div>
      )}

      {isPlaying ? (
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border-4 border-blue-600/20 animate-glow">
          <video
            key={completedScenes[currentSceneIdx].id}
            src={completedScenes[currentSceneIdx].videoUrl}
            autoPlay
            onEnded={handleNextScene}
            className="w-full h-full object-cover"
          />
          <audio
            key={`audio-${completedScenes[currentSceneIdx].id}`}
            src={completedScenes[currentSceneIdx].audioUrl}
            autoPlay
          />
          <div className="absolute bottom-10 left-10 right-10 p-6 glass rounded-2xl animate-in fade-in slide-in-from-bottom-5 duration-700">
            <h3 className="text-blue-400 font-bold text-xs uppercase mb-1">SCENE {currentSceneIdx + 1}</h3>
            <p className="text-lg italic font-medium leading-relaxed">"{completedScenes[currentSceneIdx].audioScript}"</p>
          </div>
          <button 
            onClick={() => setIsPlaying(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-3xl space-y-6">
            <h2 className="text-2xl font-bold">Production Summary</h2>
            <ul className="space-y-4">
              <li className="flex items-center justify-between text-zinc-400">
                <span>Total Scenes:</span>
                <span className="text-white font-mono">{project.scenes.length}</span>
              </li>
              <li className="flex items-center justify-between text-zinc-400">
                <span>Visuals Ready:</span>
                <span className="text-white font-mono">{project.scenes.filter(s => s.videoUrl).length}</span>
              </li>
              <li className="flex items-center justify-between text-zinc-400">
                <span>Audio Ready:</span>
                <span className="text-white font-mono">{project.scenes.filter(s => s.audioUrl).length}</span>
              </li>
              <li className="flex items-center justify-between text-zinc-400">
                <span>Engine:</span>
                <span className="text-blue-400 font-bold text-xs uppercase">Veo 3.1 Pro</span>
              </li>
            </ul>
            <button
              onClick={handlePlayMovie}
              disabled={!isReady}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 transition-all ${
                isReady ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-play"></i>
              <span>Screen Movie</span>
            </button>
          </div>

          <div className="glass p-8 rounded-3xl flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 mb-2">
              <i className="fas fa-file-video text-3xl"></i>
            </div>
            <h2 className="text-xl font-bold">Final Export</h2>
            <p className="text-zinc-500 text-sm">Download your movie clips individually to assemble in your favorite editor, or share the project link.</p>
            <button className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold text-sm transition-all border border-zinc-700">
              Download All Clips (.zip)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectExporter;
