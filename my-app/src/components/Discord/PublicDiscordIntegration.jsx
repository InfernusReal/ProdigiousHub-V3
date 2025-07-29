import React, { useState } from 'react';
import { 
  LinkIcon, 
  UserGroupIcon, 
  CogIcon, 
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const PublicDiscordIntegration = ({ project, user, discordStatus, isParticipant, onDiscordStatusChange }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectDiscord = () => {
    setIsConnecting(true);
    const token = localStorage.getItem('token');
    
    // Get current path to return to after Discord connection
    const returnUrl = window.location.pathname;
    
    // Redirect to Discord OAuth with token as query parameter
    window.location.href = `/api/auth/discord?token=${encodeURIComponent(token)}&returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  const disconnectDiscord = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/discord/disconnect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        onDiscordStatusChange({
          connected: false,
          discord_username: null
        });
      }
    } catch (error) {
      console.error('Error disconnecting Discord:', error);
    }
  };

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <LinkIcon className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Discord Integration Available
            </h4>
            <p className="text-xs text-blue-700">
              Sign up to connect Discord and join project channels automatically!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If Discord is set up for this project
  if (project.discord_channel_id && project.discord_role_id) {
    return (
      <div className="space-y-3">
        {/* Project Discord Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <LinkIcon className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800 mb-1">
                Discord Integration Active! 🎉
              </h4>
              <p className="text-xs text-green-700 mb-2">
                This project has a private Discord channel for team communication.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs text-green-600">
                <span className="flex items-center">📢 Channel: #{project.discord_channel_name || 'project-channel'}</span>
                <span className="flex items-center">👥 Role: @{project.discord_role_name || 'Project Team'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Discord Connection Status */}
        {discordStatus?.connected ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-green-800 truncate">
                      Connected as @{discordStatus.discord_username}
                    </p>
                    <p className="text-xs text-green-600">
                      {isParticipant 
                        ? "You have access to the project Discord channel!" 
                        : "Join this project to get access to the Discord channel!"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={disconnectDiscord}
                  className="text-xs text-red-600 hover:text-red-800 underline flex-shrink-0 self-start sm:self-center"
                >
                  Disconnect
                </button>
              </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <XMarkIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Connect Discord to Join Channel
                </h4>
                <p className="text-xs text-blue-700 mb-3">
                  Connect your Discord account to automatically join the project channel when you participate.
                </p>
                <button
                  onClick={connectDiscord}
                  disabled={isConnecting}
                  className="w-full bg-blue-600 text-white py-2 px-3 rounded text-xs hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <ArrowPathIcon className="w-3 h-3 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-3 h-3" />
                      <span>Connect Discord</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If no Discord setup yet, show connection option
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <LinkIcon className="w-5 h-5 text-gray-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-800 mb-1">
            Discord Integration
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            {discordStatus?.connected 
              ? `Connected as @${discordStatus.discord_username}. Waiting for project creator to set up Discord integration.`
              : "Connect your Discord account to join project channels when available."}
          </p>
          
          {!discordStatus?.connected && (
            <button
              onClick={connectDiscord}
              disabled={isConnecting}
              className="w-full bg-gray-600 text-white py-2 px-3 rounded text-xs hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <ArrowPathIcon className="w-3 h-3 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-3 h-3" />
                  <span>Connect Discord</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicDiscordIntegration;
