// Create a new file: src/components/SignalInterference.jsx
import React, { useEffect, useState } from 'react';
import AudioManager from '../utils/AudioManager';

const SignalInterference = ({ level = 0, terminalType = 'normal' }) => {
  const [interferenceActive, setInterferenceActive] = useState(false);
  const [staticOpacity, setStaticOpacity] = useState(0);

  useEffect(() => {
    if (level > 0.3) {
      const interval = setInterval(() => {
        if (Math.random() < level) {
          setInterferenceActive(true);
          setStaticOpacity(Math.random() * 0.3 + 0.1);
          
          // Play interference sound
          AudioManager.playEffect('glitch', 0.3);
          
          // Random screen effects
          const effects = [
            () => {
              document.body.style.filter = `brightness(${0.3 + Math.random() * 0.7}) contrast(${1 + Math.random() * 0.5})`;
            },
            () => {
              document.body.style.filter = `hue-rotate(${Math.random() * 30}deg) saturate(${0.5 + Math.random()})`;
            },
            () => {
              document.body.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
            }
          ];
          
          const effect = effects[Math.floor(Math.random() * effects.length)];
          effect();
          
          setTimeout(() => {
            document.body.style.filter = 'none';
            document.body.style.transform = 'none';
            setInterferenceActive(false);
            setStaticOpacity(0);
          }, 100 + Math.random() * 200);
        }
      }, 1000 + Math.random() * 4000);
      
      return () => clearInterval(interval);
    }
  }, [level]);

  // Change ambient sound based on interference level
  useEffect(() => {
    if (level > 0.7) {
      AudioManager.playAmbient('interference', 0.4);
    } else if (level > 0.5) {
      AudioManager.playAmbient('corrupted', 0.3);
    } else if (level > 0.3) {
      AudioManager.playAmbient('damaged', 0.25);
    } else if (terminalType === 'secure') {
      AudioManager.playAmbient('secure', 0.2);
    } else {
      AudioManager.playAmbient('normal', 0.15);
    }

    return () => {
      AudioManager.stopAmbient();
    };
  }, [level, terminalType]);

  if (!interferenceActive) return null;

  return (
    <>
      {/* Static overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          opacity: staticOpacity,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Scan lines */}
      {level > 0.5 && (
        <div 
          className="pointer-events-none fixed inset-0 z-40"
          style={{
            background: 'repeating-linear-gradient(0deg, rgba(0,255,0,0.03) 0px, transparent 1px, transparent 2px, rgba(0,255,0,0.03) 3px)',
            animation: 'scanlines 8s linear infinite'
          }}
        />
      )}
      
      {/* Signal strength indicator */}
      <div className="fixed top-4 right-4 z-50 text-green-400 font-mono text-xs bg-black bg-opacity-80 p-2 border border-green-400">
        <div className="flex items-center gap-2">
          <span>SIGNAL:</span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className={`w-1 h-3 ${
                  i < Math.floor((1 - level) * 5) 
                    ? 'bg-green-400' 
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <span>{Math.floor((1 - level) * 100)}%</span>
        </div>
      </div>
    </>
  );
};

export default SignalInterference;