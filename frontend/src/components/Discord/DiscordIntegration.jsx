import React, { useState, useEffect } from 'react';
import { 
  CheckIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  LinkIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const DiscordIntegration = () => {
  const [discordStatus, setDiscordStatus] = useState({
    connected: false,
    discord_username: null,
    loading: true
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Check Discord connection status on component mount
  useEffect(() => {
    checkDiscordStatus();
  }, []);

  const checkDiscordStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/discord/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDiscordStatus({
          connected: data.connected,
          discord_username: data.discord_username,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error checking Discord status:', error);
      setDiscordStatus(prev => ({ ...prev, loading: false }));
    }
  };

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
        setDiscordStatus({
          connected: false,
          discord_username: null,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error disconnecting Discord:', error);
    }
  };

  if (discordStatus.loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <ArrowPathIcon className="w-5 h-5 text-indigo-600 animate-spin" />
          <span className="text-gray-600">Loading Discord status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
            <UserIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Discord Integration</h3>
            <p className="text-sm text-gray-600">
              Connect your Discord account for seamless project collaboration
            </p>
          </div>
        </div>
        
        {discordStatus.connected ? (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Connected</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-gray-400">
            <XMarkIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Not Connected</span>
          </div>
        )}
      </div>

      {discordStatus.connected ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Connected as @{discordStatus.discord_username}
                </p>
                <p className="text-xs text-green-600">
                  You'll automatically join Discord channels for your projects!
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={disconnectDiscord}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Disconnect Discord
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              🚀 Unlock Discord Collaboration
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Automatic Discord server invites</li>
              <li>• Private project channels</li>
              <li>• Real-time team communication</li>
              <li>• Project info shared automatically</li>
            </ul>
          </div>
          
          <button
            onClick={connectDiscord}
            disabled={isConnecting}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4" />
                <span>Connect Discord</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscordIntegration;
