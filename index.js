const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const express = require('express');

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

const WELCOME_CHANNEL_ID = '123456789012345678';

client.once('ready', () => {
  console.log(`SUCCESS: Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (channel) {
    channel.send(`WELCOME TO MY GAMING SOCIETY 🎮 <@${member.id}>!`);
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase().trim();

  if (content === '!ping') return message.reply('Pong! 🏓');
  if (content === '!foot') return message.reply('ball');
  if (content === '!persona' || content === 'persona') return message.reply('https://giphy.com/gifs/p5-persona5-persona5strikers-FHorv1CAM7Sh1YEoR8');
  if (content === '!hello') return message.reply('https://giphy.com/gifs/cute-pokemon-AFdcYElkoNAUE');
  if (content === '!bye' || content === 'bye' || content === 'cya' || content === '!cya') return message.reply('https://giphy.com/gifs/bye-ichimaru-gin-upMEKtG4p7kuRmNOEL');

  if (content.startsWith('!kick')) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply("No permission!");
    const member = message.mentions.members.first();
    if (!member) return message.reply('Mention a user.');
    try { await member.kick(); message.reply(`${member.user.tag} kicked.`); } catch { message.reply("Could not kick."); }
  }

  if (content.startsWith('!ban')) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply("No permission!");
    const member = message.mentions.members.first();
    if (!member) return message.reply('Mention a user.');
    try { await member.ban(); message.reply(`${member.user.tag} banned.`); } catch { message.reply("Could not ban."); }
  }

  if (content.startsWith('!unban')) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply("No permission!");
    const userId = message.content.split(' ')[1];
    if (!userId) return message.reply('Provide User ID.');
    try { await message.guild.members.unban(userId); message.reply(`Unbanned \`${userId}\`.`); } catch { message.reply("Could not unban."); }
  }
});

// LOGIN WITH DEBUG LOGGING
console.log("Attempting Discord login...");
if (!process.env.DISCORD_TOKEN) {
  console.log("ERROR: DISCORD_TOKEN is missing or undefined in environment variables!");
} else {
  client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error("LOGIN FAILED WITH ERROR:", err.message);
  });
}
