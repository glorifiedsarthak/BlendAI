
import React from 'react';
import { ProjectStep } from '../types';

interface HeaderProps {
  step: ProjectStep;
  setStep: (step: ProjectStep) => void;
}

const Header: React.FC<HeaderProps> = ({ step, setStep }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setStep(ProjectStep.SCRIPTING)}>
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <i className="fas fa-film text-white"></i>
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">CineNode Studio</span>
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-4">
          <NavItem 
            active={step === ProjectStep.SCRIPTING} 
            icon="fa-pen-nib" 
            label="Script" 
            onClick={() => setStep(ProjectStep.SCRIPTING)} 
          />
          <NavItem 
            active={step === ProjectStep.STUDIO} 
            icon="fa-clapperboard" 
            label="Studio" 
            onClick={() => setStep(ProjectStep.STUDIO)} 
          />
          <NavItem 
            active={step === ProjectStep.EXPORT} 
            icon="fa-file-export" 
            label="Export" 
            onClick={() => setStep(ProjectStep.EXPORT)} 
          />
        </nav>

        <div className="hidden sm:flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-zinc-400 font-medium uppercase tracking-widest">Engine Live</span>
        </div>
      </div>
    </header>
  );
};

const NavItem: React.FC<{ active: boolean; icon: string; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
      active 
        ? 'bg-zinc-800 text-blue-400 font-semibold' 
        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
    }`}
  >
    <i className={`fas ${icon} text-sm`}></i>
    <span className="text-sm">{label}</span>
  </button>
);

export default Header;
