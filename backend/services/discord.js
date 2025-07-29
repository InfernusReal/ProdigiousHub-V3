const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Bot login
const initializeDiscordBot = async () => {
  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    console.log('🤖 Discord bot logged in successfully!');
  } catch (error) {
    console.error('❌ Discord bot login failed:', error);
  }
};

// Get Discord user info via OAuth
const getDiscordUser = async (accessToken) => {
  try {
    const response = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Discord user:', error);
    throw error;
  }
};

// Add user to Discord server
const addUserToServer = async (accessToken, userId) => {
  try {
    const response = await axios.put(
      `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${userId}`,
      {
        access_token: accessToken
      },
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding user to server:', error);
    throw error;
  }
};

// Create project role
const createProjectRole = async (projectTitle, projectId) => {
  try {
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    if (!guild) throw new Error('Guild not found');

    const roleName = `Project-${projectId}`;
    const role = await guild.roles.create({
      name: roleName,
      color: '#FF6B6B', // Nice red color
      hoist: false, // Don't display separately
      mentionable: true,
      reason: `Role for project: ${projectTitle}`
    });

    console.log(`✅ Created role: ${roleName}`);
    return role;
  } catch (error) {
    console.error('Error creating project role:', error);
    throw error;
  }
};

// Create project channel
const createProjectChannel = async (projectTitle, projectId, role) => {
  try {
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    if (!guild) throw new Error('Guild not found');

    const channelName = `project-${projectId}-${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    const channel = await guild.channels.create({
      name: channelName,
      type: 0, // Text channel
      topic: `Private channel for project: ${projectTitle}`,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: role.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        }
      ]
    });

    console.log(`✅ Created channel: ${channelName}`);
    return channel;
  } catch (error) {
    console.error('Error creating project channel:', error);
    throw error;
  }
};

// Add user to project role
const addUserToProjectRole = async (userId, roleId) => {
  try {
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    if (!guild) throw new Error('Guild not found');

    const member = await guild.members.fetch(userId);
    if (!member) throw new Error('Member not found');

    await member.roles.add(roleId);
    console.log(`✅ Added user ${userId} to role ${roleId}`);
    return true;
  } catch (error) {
    console.error('Error adding user to role:', error);
    throw error;
  }
};

// Send project info to channel
const sendProjectInfoToChannel = async (channelId, projectData, participants) => {
  try {
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    if (!guild) throw new Error('Guild not found');

    const channel = guild.channels.cache.get(channelId);
    if (!channel) throw new Error('Channel not found');

    const participantMentions = participants.map(p => `<@${p.discord_id}>`).join(', ');

    const embed = {
      title: `🚀 ${projectData.title}`,
      description: projectData.description,
      color: 0xFF6B6B,
      fields: [
        {
          name: '💰 XP Reward',
          value: `${projectData.xp_reward} XP`,
          inline: true
        },
        {
          name: '📈 Difficulty',
          value: projectData.difficulty,
          inline: true
        },
        {
          name: '👥 Participants',
          value: participantMentions || 'Just you for now!',
          inline: false
        }
      ],
      footer: {
        text: 'ProdigyHub Project Collaboration'
      },
      timestamp: new Date().toISOString()
    };

    await channel.send({
      content: `🎉 Welcome to your project collaboration space! ${participantMentions}`,
      embeds: [embed]
    });

    console.log(`✅ Sent project info to channel ${channelId}`);
    return true;
  } catch (error) {
    console.error('Error sending project info:', error);
    throw error;
  }
};

// Setup complete project workflow
const setupProjectDiscordIntegration = async (projectData, participants) => {
  try {
    console.log(`🔧 Setting up Discord integration for project: ${projectData.title}`);

    // 1. Create project role
    const role = await createProjectRole(projectData.title, projectData.id);

    // 2. Create project channel
    const channel = await createProjectChannel(projectData.title, projectData.id, role);

    // 3. Add all participants to role
    for (const participant of participants) {
      if (participant.discord_id) {
        await addUserToProjectRole(participant.discord_id, role.id);
      }
    }

    // 4. Send project info to channel
    await sendProjectInfoToChannel(channel.id, projectData, participants);

    return {
      roleId: role.id,
      channelId: channel.id,
      channelName: channel.name,
      roleName: role.name
    };
  } catch (error) {
    console.error('Error setting up Discord integration:', error);
    throw error;
  }
};

module.exports = {
  client,
  initializeDiscordBot,
  getDiscordUser,
  addUserToServer,
  createProjectRole,
  createProjectChannel,
  addUserToProjectRole,
  sendProjectInfoToChannel,
  setupProjectDiscordIntegration
};
