
import React, { useState } from 'react';

interface ScriptEditorProps {
  onStart: (prompt: string) => void;
  isLoading: boolean;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({ onStart, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const suggestions = [
    "A cyberpunk detective walking through a neon-lit rainstorm in Tokyo.",
    "A majestic dragon awakening from a volcanic sleep in a hyper-realistic fantasy world.",
    "Astronauts discovering an ancient monolithic structure on Mars with cinematic lighting.",
    "A whimsical forest where trees are made of crystal and glowing mushrooms light the path."
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onStart(prompt);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
          Imagine Your Masterpiece.
        </h1>
        <p className="text-zinc-400 text-xl">
          Enter a prompt and let AI create a cinematic sequence with 3D-quality visuals and voiceovers.
        </p>
      </div>

      <div className="glass p-8 rounded-3xl shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2 uppercase tracking-widest">
              Movie Pitch
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your movie idea..."
              className="w-full h-48 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none placeholder:text-zinc-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center space-x-3 transition-all ${
              isLoading || !prompt.trim()
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/20'
            }`}
          >
            {isLoading ? (
              <>
                <i className="fas fa-circle-notch animate-spin"></i>
                <span>Directing Scenes...</span>
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                <span>Generate Script</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-10">
          <p className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-widest">Inspirations</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setPrompt(s)}
                className="text-left p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 hover:border-zinc-700 transition-all text-sm text-zinc-400 italic"
              >
                "{s}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptEditor;
