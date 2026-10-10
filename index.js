require('dotenv').config();
const fs = require('fs');
const {
  Client, GatewayIntentBits, Partials, EmbedBuilder, REST, Routes,
  SlashCommandBuilder, PermissionFlagsBits
} = require('discord.js');

const TOKEN = process.env.TOKEN;
if (!TOKEN) { console.error('❌ Missing TOKEN'); process.exit(1); }

const DATA_FILE = './data.json';
let data = { xp: {}, warns: {}, customCommands: {}, birthdays: {} };
try { data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) {}
function saveData() { try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); } catch (e) {} }

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
});

// WELCOME
client.on('guildMemberAdd', async (member) => {
  const chan = member.guild.systemChannel || member.guild.channels.cache.find(c => c.name === 'welcome' && c.isTextBased());
  if (!chan) return;
  const embed = new EmbedBuilder()
    .setColor(0xfbbf24)
    .setTitle(`🥔 A wild ${member.user.username} appeared!`)
    .setDescription(`Welcome to the potato patch. Check rules and say hi!`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setFooter({ text: `You're potato #${member.guild.memberCount}` })
    .setTimestamp();
  chan.send({ content: `<@${member.id}>`, embeds: [embed] });
});

// CHAT
const GREETINGS = ["hey {user}! potato here 🥔","yo {user}, potato checking in","sup {user} 🥔💜","hi hi {user}! potato says hi","ayy {user}, potato is here","hello {user}, i am potato 🥔","{user}! you rang the potato"];
const HOW_ARE_YOU = ["peeling great, you? 🥔","crispy and ready, you?","just chillin in the dirt, you?","boiling with energy, you?","starchy and stable, you?"];
const LAUGH = ["lmao 🥔","😂😂 potato energy","bruh 💀","mashed 💀","nugget moment","spud-tacular 😂"];
const THANKS = ["np! 🥔","anytime 💜","ofc potato","you got it","peel welcome!","no problemo 🥔"];
const COMPLIMENT = ["stop it you 😳🥔","aww thanks 🥰","you're too kind","🤭","the potato is flattered"];
const INSULT = ["that hurt my potato feelings 🥲","rude 🥔😤","ok and?","i'm just a potato, chill","nobody asked 🥔"];
const QUESTIONS = ["idk, what do you think?","hmm good question","42","no clue honestly","ask the potato later","potato pondering..."];
const GIFS = [
  'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
  'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
  'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif',
  'https://media.giphy.com/media/26u4cqi2xJUq8LdK8/giphy.gif'
];
function pick(a){return a[Math.floor(Math.random()*a.length)]}

function addXp(gid,uid,amt){
  const k=`${gid}-${uid}`;
  if(!data.xp[k])data.xp[k]={xp:0,level:1};
  data.xp[k].xp+=amt;
  const need=data.xp[k].level*100;
  if(data.xp[k].xp>=need){data.xp[k].xp-=need;data.xp[k].level++;return data.xp[k].level}
  return null;
}

client.on('messageCreate',async(msg)=>{
  if(msg.author.bot)return;
  if(!msg.guild)return;
  const lvl=addXp(msg.guild.id,msg.author.id,Math.floor(Math.random()*15)+5);
  saveData();
  if(lvl)msg.channel.send(`🥔 ${msg.author} is now **potato level ${lvl}**!`);
  const text=msg.content.toLowerCase().trim();
  const user=msg.author.username;
  if(text.length>200)return;
  if(data.customCommands[text])return msg.reply(data.customCommands[text]);
  if(/\b(hi|hey|hello|yo|sup|wassup|whats up|howdy)\b/.test(text))return msg.reply(pick(GREETINGS).replace('{user}',user));
  if(/(how are you|how're you|hru|how u doing)/.test(text))return msg.reply(pick(HOW_ARE_YOU));
  if(/\b(lmao|lmfao|haha|lol|rofl)\b/.test(text))return msg.reply(pick(LAUGH));
  if(/\b(thanks|thank you|ty|thx)\b/.test(text))return msg.reply(pick(THANKS));
  if(/\b(you'?re (cute|nice|kind|smart|the best)|love you|ily)\b/.test(text))return msg.reply(pick(COMPLIMENT));
  if(/\b(stupid|dumb|useless|idiot)\b/.test(text))return msg.reply(pick(INSULT));
  if(msg.mentions.has(client.user))return msg.reply(pick(["you called the potato? 👀","what's up? 🥔","yo, need something?","potato is here 🥔"]));
  if(/(send gif|gif me|meme)/.test(text))return msg.channel.send(pick(GIFS));
  if(/good morning/.test(text))return msg.reply('gm ☀️ from potato');
  if(/good night|gn\b/.test(text))return msg.reply('gn 🌙 potato is sleepy');
  if(/good afternoon/.test(text))return msg.reply('good afternoon 🌤');
  if(/potato/.test(text))return msg.reply(pick(["🥔🥔🥔","potato approves","one of us","POTATO POWER 🥔","boil em mash em stick em in a stew"]));
  if(/\?\s*$/.test(text)&&text.length<60)return msg.reply(pick(QUESTIONS));
});

// COMMANDS
const commands=[
  new SlashCommandBuilder().setName('rules').setDescription('Post server rules'),
  new SlashCommandBuilder().setName('help').setDescription('Show commands'),
  new SlashCommandBuilder().setName('joke').setDescription('Tell a joke'),
  new SlashCommandBuilder().setName('8ball').setDescription('Magic 8ball').addStringOption(o=>o.setName('question').setDescription('Ask').setRequired(true)),
  new SlashCommandBuilder().setName('rank').setDescription('Show your potato rank'),
  new SlashCommandBuilder().setName('leaderboard').setDescription('Top 10 potatoes'),
  new SlashCommandBuilder().setName('kick').setDescription('Kick member').addUserOption(o=>o.setName('user').setDescription('Who').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  new SlashCommandBuilder().setName('ban').setDescription('Ban member').addUserOption(o=>o.setName('user').setDescription('Who').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  new SlashCommandBuilder().setName('warn').setDescription('Warn member').addUserOption(o=>o.setName('user').setDescription('Who').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Why')).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName('warns').setDescription('List warns').addUserOption(o=>o.setName('user').setDescription('Who').setRequired(true)),
  new SlashCommandBuilder().setName('addcmd').setDescription('Add custom command').addStringOption(o=>o.setName('trigger').setDescription('Word').setRequired(true)).addStringOption(o=>o.setName('reply').setDescription('Response').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder().setName('birthday').setDescription('Set birthday').addStringOption(o=>o.setName('date').setDescription('MM/DD').setRequired(true))
];

client.on('interactionCreate',async(i)=>{
  if(!i.isChatInputCommand())return;
  const c=i.commandName;
  if(c==='rules'){
    const e=new EmbedBuilder().setColor(0xfbbf24).setTitle('📜 Potato Server Rules').setDescription('Follow these please:')
      .addFields(
        {name:'1. Be respectful 🥔',value:'No hate speech or harassment.'},
        {name:'2. No spam',value:'No flooding channels or DM ads.'},
        {name:'3. Keep it SFW',value:'No NSFW in general.'},
        {name:'4. No advertising',value:'Ask a mod first.'},
        {name:'5. Follow Discord ToS',value:'https://discord.com/terms'}
      ).setFooter({text:'Break rules = warn → mute → ban'}).setTimestamp();
    return i.reply({embeds:[e]});
  }
  if(c==='help')return i.reply({content:'📖 **Potato Commands**\n`/rules /help /joke /8ball /rank /leaderboard /birthday`\nMod: `/kick /ban /warn /warns /addcmd`\nOr just say hi 💜🥔',ephemeral:true});
  if(c==='joke'){
    const jokes=[
      "why do programmers prefer dark mode? light attracts bugs 🐛",
      "what do you call a sad potato? a meh-tato 🥔",
      "my code doesn't have bugs, it has random features",
      "why did the potato go to the gym? to get mashed 💪",
      "there are 10 types of people: those who get binary and those who don't"
    ];
    return i.reply(pick(jokes));
  }
  if(c==='8ball'){
    const q=i.options.getString('question');
    return i.reply(`🎱 *${q}*\n${pick(["yes 💯","no ❌","maybe 🤔","definitely","ask again later","don't count on it","potato says yes 🥔"])}`);
  }
  if(c==='rank'){
    const k=`${i.guild.id}-${i.user.id}`;
    const u=data.xp[k]||{xp:0,level:1};
    return i.reply(`🥔 **${i.user.username}** — Potato Level **${u.level}** (${u.xp}/${u.level*100} XP)`);
  }
  if(c==='leaderboard'){
    const g=Object.entries(data.xp).filter(([k])=>k.startsWith(i.guild.id+'-')).sort((a,b)=>(b[1].level*100+b[1].xp)-(a[1].level*100+a[1].xp)).slice(0,10);
    let out='🏆 **Top Potatoes**\n';
    g.forEach((x,idx)=>{out+=`**${idx+1}.** <@${x[0].split('-')[1]}> — Level ${x[1].level}\n`});
    return i.reply(out||'No potatoes yet 🥔');
  }
  if(c==='kick'){
    const u=i.options.getUser('user');
    const m=await i.guild.members.fetch(u.id).catch(()=>null);
    if(!m)return i.reply({content:'not found',ephemeral:true});
    await m.kick().catch(()=>null);
    return i.reply(`👢 Kicked ${u.username} 🥔`);
  }
  if(c==='ban'){
    const u=i.options.getUser('user');
    const m=await i.guild.members.fetch(u.id).catch(()=>null);
    if(!m)return i.reply({content:'not found',ephemeral:true});
    await m.ban().catch(()=>null);
    return i.reply(`🔨 Banned ${u.username} 🥔`);
  }
  if(c==='warn'){
    const u=i.options.getUser('user');
    const r=i.options.getString('reason')||'no reason';
    const k=`${i.guild.id}-${u.id}`;
    if(!data.warns[k])data.warns[k]=[];
    data.warns[k].push({by:i.user.id,reason:r,at:Date.now()});
    saveData();
    return i.reply(`⚠️ Warned ${u.username}: ${r}`);
  }
  if(c==='warns'){
    const u=i.options.getUser('user');
    const k=`${i.guild.id}-${u.id}`;
    const w=data.warns[k]||[];
    if(!w.length)return i.reply(`${u.username} has no warns 🥔`);
    let out=`⚠️ **Warns for ${u.username}**\n`;
    w.forEach((x,idx)=>{out+=`**${idx+1}.** ${x.reason}\n`});
    return i.reply(out);
  }
  if(c==='addcmd'){
    const t=i.options.getString('trigger').toLowerCase();
    const r=i.options.getString('reply');
    data.customCommands[t]=r;saveData();
    return i.reply(`✅ Added \`${t}\` → ${r}`);
  }
  if(c==='birthday'){
    const d=i.options.getString('date');
    data.birthdays[i.user.id]=d;saveData();
    return i.reply(`🎂 Birthday set: ${d}`);
  }
});

// READY
client.once('ready',async()=>{
  console.log(`🥔 POTATO is online as ${client.user.tag}`);
  const rest=new REST({version:'10'}).setToken(TOKEN);
  const body=commands.map(c=>c.toJSON());
  for(const g of client.guilds.cache.values()){
    try{await rest.put(Routes.applicationGuildCommands(client.user.id,g.id),{body});console.log(`✅ Commands in ${g.name}`)}
    catch(e){console.error(e)}
  }
});
client.on('error',console.error);
process.on('unhandledRejection',console.error);
client.login(TOKEN);