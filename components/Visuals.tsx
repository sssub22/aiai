import React from 'react';
import { PetStage } from '../types';
import { Egg, Bird, Sparkles, User, Trophy, ShieldCheck, Star, BookOpen } from 'lucide-react';

interface PetVisualProps {
  stage: PetStage;
  type: string;
  className?: string;
}

export const PetVisual: React.FC<PetVisualProps> = ({ stage, type, className = "" }) => {
  const getSize = () => {
    switch (stage) {
      case PetStage.EGG: return "w-24 h-24";
      case PetStage.CRACKED_EGG: return "w-28 h-28";
      case PetStage.BABY: return "w-32 h-32";
      case PetStage.YOUNG: return "w-36 h-36";
      case PetStage.ADULT: return "w-40 h-40";
      default: return "w-24 h-24";
    }
  };

  const getEmoji = () => {
    switch (stage) {
      case PetStage.EGG:
        return <Egg className={`${getSize()} text-orange-200 fill-orange-100 animate-pulse`} />;
      case PetStage.CRACKED_EGG:
        return (
            <div className="relative">
                <Egg className={`${getSize()} text-orange-300 fill-orange-100`} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-gray-800 rotate-45 transform scale-75 opacity-20"></div>
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-gray-800 -rotate-45 transform scale-50 opacity-20"></div>
            </div>
        );
      case PetStage.BABY:
        return <div className="text-8xl animate-bounce">🐣</div>;
      case PetStage.YOUNG:
        return <div className="text-9xl animate-bounce">🐥</div>;
      case PetStage.ADULT:
        return <div className="text-9xl animate-bounce">🦉</div>; 
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white to-orange-50 rounded-full shadow-2xl border-8 border-orange-100 ${className}`}>
      {getEmoji()}
      <div className="mt-4 text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
        Lv.{stage} {stage === PetStage.ADULT ? '성체' : '성장중'}
      </div>
    </div>
  );
};

export const XPBar: React.FC<{ current: number; max: number; label: string; colorClass?: string }> = ({ current, max, label, colorClass = "from-orange-400 to-orange-600" }) => {
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-bold text-gray-600">{label}</span>
        <span className="text-xs font-bold text-gray-600">{current} / {max} XP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-100">
        <div 
          className={`bg-gradient-to-r ${colorClass} h-4 rounded-full transition-all duration-500 ease-out shadow-inner`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
