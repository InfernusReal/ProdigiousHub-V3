import React, { useState } from 'react';
import { 
  UserGroupIcon, 
  CogIcon, 
  ArrowPathIcon,
  LinkIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const ProjectDiscordSetup = ({ project, isCreator, userHasDiscord }) => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupResult, setSetupResult] = useState(null);

  const setupDiscordIntegration = async () => {
    if (!userHasDiscord) {
      alert('Please connect your Discord account first in your profile settings!');
      return;
    }

    setIsSettingUp(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${project.slug}/setup-discord`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setSetupResult({
          success: true,
          ...data.discord
        });
      } else {
        setSetupResult({
          success: false,
          error: data.message
        });
      }
    } catch (error) {
      console.error('Error setting up Discord:', error);
      setSetupResult({
        success: false,
        error: 'Failed to set up Discord integration'
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  // If Discord is already set up
  if (project.discord_channel_id && project.discord_role_id) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <LinkIcon className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-green-800 mb-1">
              Discord Integration Active! 🎉
            </h4>
            <p className="text-xs text-green-700 mb-2">
              Team members with Discord will automatically join the project channel.
            </p>
            <div className="flex items-center space-x-4 text-xs text-green-600">
              <span>📢 Channel: #{project.discord_channel_name || 'project-channel'}</span>
              <span>👥 Role: @{project.discord_role_name || 'Project Team'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is not the creator
  if (!isCreator) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <LinkIcon className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-blue-800">
              {userHasDiscord 
                ? "Ready for Discord! You'll automatically join the project channel when the creator sets up Discord integration." 
                : "Connect your Discord account in Settings to join project channels when available."}
            </p>
            {!userHasDiscord && (
              <button
                onClick={() => window.location.href = '/settings'}
                className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Go to Settings
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Setup result display
  if (setupResult) {
    if (setupResult.success) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <LinkIcon className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-1">
                Discord Integration Set Up Successfully! 🚀
              </h4>
              <div className="text-xs text-green-700 space-y-1">
                <p>📢 Channel: #{setupResult.channelName}</p>
                <p>👥 Role: @{setupResult.roleName}</p>
                <p>✅ {setupResult.participantsAdded} team members added</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <LinkIcon className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Setup Failed
              </h4>
              <p className="text-xs text-red-700">{setupResult.error}</p>
              <button
                onClick={() => setSetupResult(null)}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Creator setup interface
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <LinkIcon className="w-5 h-5 text-indigo-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-indigo-800 mb-1">
            Set Up Discord Integration
          </h4>
          <p className="text-xs text-indigo-700 mb-3">
            Create a private Discord channel for your team with automatic role management.
          </p>
          
          <div className="text-xs text-indigo-600 space-y-1 mb-3">
            <div className="flex items-center space-x-2">
              <CogIcon className="w-3 h-3" />
              <span>Automatic channel & role creation</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-3 h-3" />
              <span>Add all Discord-connected team members</span>
            </div>
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-3 h-3" />
              <span>Share project info automatically</span>
            </div>
          </div>

          <button
            onClick={setupDiscordIntegration}
            disabled={isSettingUp || !userHasDiscord}
            className="w-full bg-indigo-600 text-white py-2 px-3 rounded text-xs hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSettingUp ? (
              <>
                <ArrowPathIcon className="w-3 h-3 animate-spin" />
                <span>Setting up...</span>
              </>
            ) : !userHasDiscord ? (
              <span>Connect Discord first</span>
            ) : (
              <>
                <LinkIcon className="w-3 h-3" />
                <span>Set Up Discord</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDiscordSetup;
