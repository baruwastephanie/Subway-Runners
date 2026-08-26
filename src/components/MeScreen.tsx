import React, { useState } from 'react';
import { Home, Key, Star } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Player from './Player';

interface MeScreenProps {
  totalCoins: number;
  totalKeys: number;
  unlockedCharacters: string[];
  activeCharacterId: string;
  onUnlock: (id: string, cost: number, currency: 'coins' | 'keys') => boolean;
  onSelect: (id: string) => void;
  onBack: () => void;
}

export default function MeScreen({ 
  totalCoins, 
  totalKeys, 
  unlockedCharacters, 
  activeCharacterId, 
  onUnlock, 
  onSelect, 
  onBack 
}: MeScreenProps) {
  const [viewedCharacterId, setViewedCharacterId] = useState(activeCharacterId);
  const [errorMsg, setErrorMsg] = useState('');

  const viewedCharacter = CHARACTERS.find(c => c.id === viewedCharacterId) || CHARACTERS[0];
  const isUnlocked = unlockedCharacters.includes(viewedCharacter.id);
  const isSelected = activeCharacterId === viewedCharacter.id;

  const handleAction = () => {
    if (isSelected) return;
    
    if (isUnlocked) {
      onSelect(viewedCharacter.id);
    } else {
      const success = onUnlock(viewedCharacter.id, viewedCharacter.cost, viewedCharacter.currency);
      if (!success) {
        setErrorMsg('INSUFFICIENT BALANCE');
      } else {
        onSelect(viewedCharacter.id);
      }
    }
  };

  // Mock player state to keep Player component happy
  const mockPlayerState = React.useRef({
    lane: 0,
    y: 0,
    isSliding: false,
    isJumping: false,
    box: new THREE.Box3()
  });
  const mockPlayerRef = React.useRef<THREE.Group>(null);

  return (
    <div className="absolute inset-0 z-[150] bg-slate-100 flex flex-col touch-none overflow-hidden">
      
      {/* Insufficient Balance Error */}
      {errorMsg && (
        <div 
          className="absolute inset-0 z-[200] bg-black/60 flex items-center justify-center pointer-events-auto"
          onClick={() => setErrorMsg('')}
        >
          <div className="bg-red-500 text-white font-black text-2xl px-8 py-4 rounded-3xl shadow-2xl border-4 border-white animate-bounce">
            {errorMsg}
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <button 
          onClick={onBack}
          className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl flex items-center justify-center border-2 border-slate-400 transition-colors shadow-sm"
        >
          <Home className="w-8 h-8 text-slate-700" />
        </button>

        {/* Balances */}
        <div className="flex gap-2">
          {/* Keys */}
          <div className="flex items-center gap-1 bg-sky-900/80 backdrop-blur rounded-full px-3 py-1.5 border border-sky-400 shadow-sm">
            <Key className="w-4 h-4 text-sky-300" />
            <span className="text-white font-black text-sm">{totalKeys}</span>
          </div>
          {/* Coins */}
          <div className="flex items-center gap-1 bg-slate-800/80 backdrop-blur rounded-full px-3 py-1.5 border-2 border-white/20 shadow-sm">
            <span className="text-white font-black text-sm">{totalCoins}</span>
            <div className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center">
              <div className="w-2 h-2 bg-yellow-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Viewer Area */}
      <div className="h-[55%] relative bg-gradient-to-b from-sky-200 to-slate-100 flex flex-col items-center justify-end pb-4 border-b-2 border-slate-200 shadow-sm">
        <div className="absolute inset-0 top-16">
          <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Player 
              playerRef={mockPlayerRef} 
              playerState={mockPlayerState} 
              isPaused={false} 
              laneWidth={0} 
              speed={0} 
              characterId={viewedCharacter.id} 
            />
          </Canvas>
        </div>

        {/* Character Title */}
        <div className="z-10 flex flex-col items-center mb-2 pointer-events-none absolute top-20">
          <h2 className="text-4xl font-black text-slate-800 tracking-wide drop-shadow-md" style={{ WebkitTextStroke: '1px white' }}>
            {viewedCharacter.name}
          </h2>
        </div>
        
        {/* Action Button */}
        <div className="z-10 w-64 mt-auto">
          <button
            onClick={handleAction}
            disabled={isSelected}
            className={`w-full py-4 rounded-2xl font-black text-2xl text-white shadow-lg transition-all active:translate-y-[4px] flex items-center justify-center gap-2
              ${isSelected ? 'bg-slate-400 shadow-[0_4px_0_rgb(148,163,184)]' : 
                isUnlocked ? 'bg-blue-500 hover:bg-blue-400 shadow-[0_4px_0_rgb(29,78,216)]' : 
                'bg-green-500 hover:bg-green-400 shadow-[0_4px_0_rgb(21,128,61)]'
              }
            `}
          >
            {isSelected ? (
              'Selected'
            ) : isUnlocked ? (
              'Select'
            ) : (
              <>
                Unlock 
                {viewedCharacter.currency === 'keys' ? (
                  <Key className="w-6 h-6 text-sky-200" />
                ) : (
                  <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center shrink-0">
                    <div className="w-3 h-3 bg-yellow-200 rounded-full"></div>
                  </div>
                )}
                {viewedCharacter.cost}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Area */}
      <div className="flex-1 bg-slate-200 p-4 overflow-y-auto">
        <div className="bg-slate-300 rounded-t-2xl flex">
          <div className="flex-1 text-center py-2 bg-blue-600 text-white font-black rounded-t-2xl text-sm">
            Characters
          </div>
        </div>
        <div className="bg-white p-4 rounded-b-2xl min-h-[300px] shadow-inner grid grid-cols-4 gap-3 place-content-start">
          {CHARACTERS.map(char => {
            const isCharUnlocked = unlockedCharacters.includes(char.id);
            const isSelectedThumbnail = viewedCharacterId === char.id;
            const isEquipped = activeCharacterId === char.id;
            
            return (
              <div 
                key={char.id}
                onClick={() => setViewedCharacterId(char.id)}
                className={`relative aspect-square rounded-2xl cursor-pointer transition-transform hover:scale-105 border-4 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-50 to-slate-200
                  ${isSelectedThumbnail ? 'border-sky-400' : 'border-transparent shadow-md'}
                `}
              >
                {/* Visual Avatar representation */}
                <div 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm mb-1"
                  style={{ backgroundColor: char.colors.primary }}
                >
                  <div className="w-full h-1/2 rounded-t-full opacity-50" style={{ backgroundColor: char.colors.skin }}></div>
                </div>
                
                <span className="font-bold text-[10px] text-slate-700 truncate w-full text-center px-1">
                  {char.name}
                </span>

                {!isCharUnlocked && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    {char.currency === 'keys' ? (
                      <Key className="w-6 h-6 text-white drop-shadow-md" />
                    ) : (
                      <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-md" />
                    )}
                  </div>
                )}

                {isEquipped && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
