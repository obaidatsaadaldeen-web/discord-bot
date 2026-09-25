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

// Configuration for Rule Enforcement
const BANNED_DOMAINS = ['grabify.link', 'iplogger.org', 'free-nitro-gift.com', 'steamcommunitv.com']; // Rule 13: Scams
const PHONE_REGEX = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;                                                  // Rule 8: Doxxing (Phone numbers)
const IPV4_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;                                                     // Rule 8: Doxxing (IP addresses)

// Map to track user message rate for Rule 4 (Spamming)
const userMessageMap = new Map();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// --------------------------------------------------------------------------
// WELCOME MESSAGE & RULE 12 (Auto-ban Alt Accounts created less than 2 days ago)
// --------------------------------------------------------------------------
client.on('guildMemberAdd', async member => {
  // 1. Check for Alt Accounts (Rule 12)
  const accountAgeDays = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
  if (accountAgeDays < 2) {
    try {
      await member.ban({ reason: `Auto-Ban: Rule 12 Violation - Alt Account (${accountAgeDays.toFixed(1)} days old)` });
      console.log(`Auto-banned alt account: ${member.user.tag}`);
      return; // Do not send welcome message if banned
    } catch (err) {
      console.error(`Could not auto-ban alt account ${member.user.tag}:`, err);
    }
  }

  // 2. Welcome Message
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (channel) {
    channel.send(`WELCOME TO MY GAMING SOCIETY 🎮 <@${member.id}>!`);
  }
});

// --------------------------------------------------------------------------
// MESSAGE EVENTS (Auto-Moderation + Commands)
// --------------------------------------------------------------------------
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  // Bypass auto-moderation for Server Administrators
  const isAdmin = message.member?.permissions.has(PermissionFlagsBits.Administrator);

  if (!isAdmin) {
    const rawContent = message.content;
    const content = rawContent.toLowerCase();

    // --- AUTO-BAN RULE 13: Malicious Links / Scams ---
    const hasMaliciousLink = BANNED_DOMAINS.some(domain => content.includes(domain));
    if (hasMaliciousLink) {
      await message.delete().catch(() => {});
      await message.guild.members.ban(message.author.id, { reason: 'Auto-Ban: Rule 13 Violation (Malicious Links/Scams)' }).catch(() => {});
      return message.channel.send(`🚫 <@${message.author.id}> was automatically banned for violating **Rule 13 (No Malicious Links or Scams)**.`);
    }

    // --- AUTO-BAN RULE 8: Doxxing (Sharing Phone Numbers or IP Addresses) ---
    if (PHONE_REGEX.test(rawContent) || IPV4_REGEX.test(rawContent)) {
      await message.delete().catch(() => {});
      await message.guild.members.ban(message.author.id, { reason: 'Auto-Ban: Rule 8 Violation (Doxxing / Sharing Personal Info)' }).catch(() => {});
      return message.channel.send(`🚫 <@${message.author.id}> was automatically banned for violating **Rule 8 (No Doxxing or Sharing Personal Info)**.`);
    }

    // --- AUTO-BAN RULE 4: Mass Spamming (>10 messages within 10 seconds) ---
    const now = Date.now();
    const userId = message.author.id;

    if (!userMessageMap.has(userId)) {
      userMessageMap.set(userId, []);
    }

    const timestamps = userMessageMap.get(userId);
    timestamps.push(now);

    // Keep timestamps from the last 10 seconds (10000 milliseconds)
    const recentTimestamps = timestamps.filter(time => now - time < 10000);
    userMessageMap.set(userId, recentTimestamps);

    if (recentTimestamps.length > 10) {
      userMessageMap.delete(userId);
      await message.guild.members.ban(message.author.id, { reason: 'Auto-Ban: Rule 4 Violation (Mass Spamming)' }).catch(() => {});
      return message.channel.send(`🚫 <@${message.author.id}> was automatically banned for violating **Rule 4 (No Spamming)**.`);
    }
  }

  // --------------------------------------------------------------------------
  // BOT COMMANDS
  // --------------------------------------------------------------------------
  const content = message.content.toLowerCase().trim();

  // 1. Ping Command
  if (content === '!ping') {
    return message.reply('Pong! 🏓');
  }

  // 2. Foot Command
  if (content === '!foot') {
    return message.reply('ball');
  }

  // 3. Persona GIF Command
  if (content === '!persona' || content === 'persona') {
    return message.reply('https://giphy.com/gifs/p5-persona5-persona5strikers-FHorv1CAM7Sh1YEoR8');
  }

  // 4. Hello GIF Command
  if (content === '!hello') {
    return message.reply('https://giphy.com/gifs/cute-pokemon-AFdcYElkoNAUE');
  }

  // 5. Bye / Cya GIF Command
  if (content === '!bye' || content === 'bye' || content === 'cya' || content === '!cya') {
    return message.reply('https://giphy.com/gifs/bye-ichimaru-gin-upMEKtG4p7kuRmNOEL');
  }

  // 6. Kick Command (!kick @user)
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

  // 7. Ban Command (!ban @user)
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

  // 8. Unban Command (!unban USER_ID)
  if (content.startsWith('!unban')) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("You don't have permission to unban members!");
    }

    const args = message.content.split(' ');
    const userId = args[1];

    if (!userId) {
      return message.reply('Please provide the User ID to unban (e.g. `!unban 123456789012345678`).');
    }

    try {
      await message.guild.members.unban(userId);
      message.reply(`Successfully unbanned user ID: \`${userId}\`.`);
    } catch (err) {
      message.reply("Could not unban that user. Check if the User ID is correct or if they're actually banned.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
