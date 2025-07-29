import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { 
  calculateLevel, 
  getLevelProgress, 
  getLevelTitle, 
  getLevelColor,
  getXPForNextLevel 
} from '../../utils/levelSystem';

const LevelDisplay = ({ 
  xp, 
  showProgress = true, 
  showTitle = true, 
  size = 'medium',
  showXP = true 
}) => {
  const level = calculateLevel(xp);
  const levelProgress = getLevelProgress(xp);
  const levelTitle = getLevelTitle(level);
  const levelColor = getLevelColor(level);
  const xpForNext = getXPForNextLevel(xp);

  const sizeClasses = {
    small: {
      container: 'text-xs',
      badge: 'w-6 h-6 text-xs',
      progress: 'h-1',
      text: 'text-xs'
    },
    medium: {
      container: 'text-sm',
      badge: 'w-8 h-8 text-sm',
      progress: 'h-2',
      text: 'text-sm'
    },
    large: {
      container: 'text-base',
      badge: 'w-12 h-12 text-lg',
      progress: 'h-3',
      text: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center gap-3 ${classes.container}`}>
      {/* Level Badge */}
      <div className={`${classes.badge} rounded-full bg-gradient-to-r ${levelColor} flex items-center justify-center text-white font-bold shadow-lg`}>
        {level}
      </div>

      <div className="flex-1">
        {/* Level Title */}
        {showTitle && (
          <div className={`font-semibold text-white ${classes.text}`}>
            Level {level} {levelTitle}
          </div>
        )}

        {/* XP Display */}
        {showXP && (
          <div className={`text-purple-300 ${classes.text}`}>
            {xp.toLocaleString()} XP
            {level < 100 && (
              <span className="ml-2 text-purple-400">
                ({xpForNext.toLocaleString()} to next)
              </span>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {showProgress && level < 100 && (
          <div className="mt-2">
            <div className={`w-full bg-gray-700/80 rounded-full ${classes.progress} overflow-hidden`}>
              <motion.div
                className={`${classes.progress} bg-gradient-to-r ${levelColor} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress.percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className={`flex justify-between mt-1 ${classes.text} text-purple-300`}>
              <span>{levelProgress.progressXP.toLocaleString()}</span>
              <span>{levelProgress.levelTotalXP.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Max Level Indicator */}
        {level >= 100 && showProgress && (
          <div className={`text-yellow-400 font-semibold ${classes.text} flex items-center gap-1 mt-1`}>
            <TrophyIcon className="w-4 h-4" />
            MAX LEVEL REACHED!
          </div>
        )}
      </div>
    </div>
  );
};

// Compact version for navbar/small spaces
export const CompactLevelDisplay = ({ xp, showXP = true }) => {
  const level = calculateLevel(xp);
  const levelColor = getLevelColor(level);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${levelColor} flex items-center justify-center text-white text-xs font-bold`}>
        {level}
      </div>
      {showXP && (
        <span className="text-white">
          {xp.toLocaleString()} XP
        </span>
      )}
    </div>
  );
};

// Level up notification component
export const LevelUpNotification = ({ oldLevel, newLevel, onClose }) => {
  const newLevelTitle = getLevelTitle(newLevel);
  const levelColor = getLevelColor(newLevel);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl shadow-2xl border border-white/20 backdrop-blur-sm">
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="mx-auto mb-4"
          >
            <StarIcon className="w-12 h-12 text-yellow-300" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-white mb-2">LEVEL UP!</h3>
          
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getLevelColor(oldLevel)} flex items-center justify-center text-white font-bold`}>
              {oldLevel}
            </div>
            <span className="text-white text-xl">→</span>
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${levelColor} flex items-center justify-center text-white font-bold`}>
              {newLevel}
            </div>
          </div>
          
          <p className="text-white font-semibold">
            You are now Level {newLevel} {newLevelTitle}!
          </p>
          
          <button
            onClick={onClose}
            className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Awesome!
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LevelDisplay;
