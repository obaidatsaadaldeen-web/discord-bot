const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const express = require('express');

// Express server to satisfy Render's web port requirement
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('POTATO is active!'));
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
const WELCOME_CHANNEL_ID = '1545473982382219264';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Welcome message event
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (channel) {
    channel.send(`WELCOME TO THE BEST POTATO SERVER EVER<@${member.id}>! OBEY THE RULES OR ELSE.... 🚫🔥`);
  }
});

// Commands
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase().trim();

  // 1. Ping Command
  if (content === 'ping') {
    return message.reply('Pong 🏓');
  }

  // 2. Foot Command
  if (content === 'foot') {
    return message.reply('ball');
  }

  // 3. Persona GIF Command
  if (content === 'persona' || content === 'persona') {
    return message.reply('https://giphy.com/gifs/p5-persona5-persona5strikers-FHorv1CAM7Sh1YEoR8');
  }

  // 4. Hello / Yo GIF Command
  if (content === 'hello' || content === 'yo') {
    return message.reply('https://giphy.com/gifs/cute-pokemon-AFdcYElkoNAUE');
  }

  // 5. Bye / Cya GIF Command
  if (content === 'bye' || content === 'bye' || content === 'cya' || content === 'cya') {
    return message.reply('https://giphy.com/gifs/bye-ichimaru-gin-upMEKtG4p7kuRmNOEL');
  }

  // 6. Dance GIF Command (!dance)
  if (content === 'dance') {
    return message.reply('https://giphy.com/gifs/game-persona-CRLU6jPUinG6Y');
  }

  // 7. Bruh Command (triggers on "bruh")
  if (content === 'bruh') {
    return message.reply('https://giphy.com/gifs/xd-taviitoobv-taviitoo-CMPorjplUbhr71PPA7');
  }

  // 8. AHHHHHHHHH Command (triggers on any variation of ahh)
  const ahhRegex = /^a+h+$/i;
  if (ahhRegex.test(message.content.trim())) {
    return message.reply('https://giphy.com/gifs/anime-angry-chie-XGerG7zaP3XEU1A7uX');
  }

  // 9. Aura Command (triggers when "aura" is said)
  if (content === 'aura') {
    return message.reply('https://giphy.com/gifs/iSbitVbJhda9KxSqkt');
  }

  // 10. Rules Reminder Command
  if (content === '!rules') {
    return message.reply(
      "📜 **SERVER RULES (OBEY OR GET BANNED):**\n" +
      "1. Be Respectful\n" +
      "2. No Toxic Behavior or Harassment\n" +
      "3. No Cheating, Hacking, or Exploits\n" +
      "4. No Spamming Chat or Voice\n" +
      "5. No Begging or RMT\n" +
      "6. Keep Topics in Right Channels\n" +
      "7. No Griefing or Teammate Sabotage\n" +
      "8. No Doxxing or Sharing Personal Info\n" +
      "9. No Political or Religious Arguments\n" +
      "10. Listen to Server Staff (me)\n" +
      "11. No Impersonating Admins or Mods\n" +
      "12. No Alt Accounts (No Ban Evasion)\n" +
      "13. No Malicious Links or Scams\n" +
      "14. **Whoever disobeys will be banned until they write an apology**\n" +
      "15. **If someone disobeys and someone knew and didn't tell, they get banned too! 🚫**\n" +
      "OBEY THE RULES OR ELSE.... Enjoy 🃏🔥"
    );
  }

  // 11. Kick Command (!kick @user)
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

  // 12. Ban Command (!ban @user)
  if (content.startsWith('!ban')) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("You don't have permission to ban members!");
    }
    const member = message.mentions.members.first();
    if (!member) return message.reply('Please mention a user to ban.');
    
    try {
      await member.ban();
      message.reply(`${member.user.tag} was banned from the server for disobeying the rules! 🚫`);
    } catch (err) {
      message.reply("Couldn't ban that user. Make sure my role is above theirs!");
    }
  }

  // 13. Unban Command (!unban USER_ID)
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
      message.reply(`Successfully unbanned user ID: \`${userId}\`. (Apology accepted!)`);
    } catch (err) {
      message.reply("Could not unban that user. Check if the User ID is correct or if they're actually banned.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
