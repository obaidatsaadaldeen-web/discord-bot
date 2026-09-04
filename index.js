const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const http = require('http');

// Web server to keep Render's free Web Service running
http.createServer((req, res) => {
  res.write("Bot is online!");
  res.end();
}).listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

// Replace with your actual Channel ID
const WELCOME_CHANNEL_ID = '1545473982382219264'; 

client.once('ready', () => {
  console.log(`✅ Success! ${client.user.tag} is ONLINE!`);
});

// Automated Welcome Message Event
client.on('guildMemberAdd', (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  channel.send(`🔥 ${member} **WELCOME TO MY GAMING SOCIETY 🎮**`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Ping Command
  if (message.content === '!ping') {
    message.reply('Pong! 🏓');
  }

  // Kick Command: !kick @user Reason
  if (message.content.startsWith('!kick')) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply("❌ You don't have permission to use this command!");
    }

    const targetUser = message.mentions.members.first();
    if (!targetUser) {
      return message.reply("⚠️ Please mention a valid user to kick. Example: `!kick @user reason`");
    }

    if (!targetUser.kickable) {
      return message.reply("❌ I cannot kick this user! Check if their role is higher than mine.");
    }

    const args = message.content.split(' ').slice(2);
    const reason = args.join(' ') || 'No reason provided';

    try {
      await targetUser.kick(reason);
      message.reply(`boot Successfully kicked **${targetUser.user.tag}** for: *${reason}*`);
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to kick the user due to an error.");
    }
  }

  // Ban Command: !ban @user Reason
  if (message.content.startsWith('!ban')) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("❌ You don't have permission to use this command!");
    }

    const targetUser = message.mentions.members.first();
    if (!targetUser) {
      return message.reply("⚠️ Please mention a valid user to ban. Example: `!ban @user reason`");
    }

    if (!targetUser.bannable) {
      return message.reply("❌ I cannot ban this user! Check if their role is higher than mine.");
    }

    const args = message.content.split(' ').slice(2);
    const reason = args.join(' ') || 'No reason provided';

    try {
      await targetUser.ban({ reason: reason });
      message.reply(`🔨 Successfully banned **${targetUser.user.tag}** for: *${reason}*`);
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to ban the user due to an error.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
