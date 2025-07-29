import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const ProjectDiscordSetup = ({ project, onSetupComplete }) => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupResult, setSetupResult] = useState(null);
  const [error, setError] = useState(null);

  const setupDiscordIntegration = async () => {
    setIsSettingUp(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/projects/${project.slug}/setup-discord`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSetupResult(response.data);
      if (onSetupComplete) {
        onSetupComplete(response.data);
      }
    } catch (error) {
      console.error('Error setting up Discord integration:', error);
      setError(error.response?.data?.message || 'Failed to set up Discord integration');
    } finally {
      setIsSettingUp(false);
    }
  };

  // If Discord is already set up
  if (project.discord_channel_id && project.discord_role_id) {
    return (
      <motion.div 
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-green-900 dark:text-green-100">
              🎉 Discord Integration Active!
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your project has a private Discord channel for team collaboration.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // If setup was just completed
  if (setupResult) {
    return (
      <motion.div 
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              ✨ Discord Integration Set Up Successfully!
            </h4>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <p>📺 <strong>Channel:</strong> #{setupResult.discord.channelName}</p>
              <p>🏷️ <strong>Role:</strong> {setupResult.discord.roleName}</p>
              <p>👥 <strong>Participants Added:</strong> {setupResult.discord.participantsAdded}</p>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-3">
              Team members with connected Discord accounts have been automatically added to the private channel!
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-[#5865F2] rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Discord Team Collaboration
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Set up a private Discord channel for your project team. All participants with connected Discord accounts will be automatically added.
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              Creates private channel and role
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              Adds all team members automatically
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              Shares project details in Discord
            </div>
          </div>

          <motion.button
            onClick={setupDiscordIntegration}
            disabled={isSettingUp}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSettingUp ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Setting up Discord...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Set Up Discord Integration
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectDiscordSetup;
