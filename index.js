const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const express = require('express');

// Express server to satisfy Render's web port requirement
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('AIZEN THE GOAT is active!'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Welcome channel ID
const WELCOME_CHANNEL_ID = '123456789012345678';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Welcome message event
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (channel) {
    channel.send(`WELCOME TO MY GAMING SOCIETY 🎮 <@${member.id}>!`);
  }
});

// Commands
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase().trim();

  // 1. Ping Command
  if (content === '!ping') {
    return message.reply('Pong! 🏓');
  }

  // 2. Foot -> Ball -> Persona GIF Flow
  if (content === '!foot') {
    await message.reply('ball');

    // Listens for "persona" in the channel for 60 seconds
    const filter = response => response.content.toLowerCase().includes('persona');
    const collector = message.channel.createMessageCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', m => {
      m.reply('https://giphy.com/gifs/p5-persona5-persona5strikers-FHorv1CAM7Sh1YEoR8');
    });
  }

  // 3. Kick Command (!kick @user)
  if (content.startsWith('!kick')) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply("You don't have permission to kick members!");
    }
    const member = message.mentions.members.first();
    if (!member) return message.reply('Please mention a user to kick.');
    
    try {
      await member.kick();
      message.reply(`${member.user.tag} was kicked from the server.`);
    } catch (err) {
      message.reply("Couldn't kick that user. Make sure my role is above theirs!");
    }
  }

  // 4. Ban Command (!ban @user)
  if (content.startsWith('!ban')) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("You don't have permission to ban members!");
    }
    const member = message.mentions.members.first();
    if (!member) return message.reply('Please mention a user to ban.');
    
    try {
      await member.ban();
      message.reply(`${member.user.tag} was banned from the server.`);
    } catch (err) {
      message.reply("Couldn't ban that user. Make sure my role is above theirs!");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
