require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
require('discord-buttons')(bot);
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const track = require('./tracking');
const dbUtil = require('./utils/dbUtil');
const orgUtil = require('./utils/organizerUtil');

// cache for organizer help requests
const HELP_CACHE = new Map();
const auditHelpCache = () => {
  HELP_CACHE.forEach((req) => {
    if (Date.now() - req.value.time.getTime() > 60 * 1000) HELP_CACHE.delete(req.key); // 10 minutes
  })
};

// set the custom commands
Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

// set the bot token
const TOKEN = 'ODcwNDM3MTc5NzExNjk2OTI3.YQMvyw.m8QPE1ouZGjxqCjiZNL6ovMmNxo'; // process.env.DISCORD_BOT_TOKEN;
bot.login(TOKEN);

// wait until the bot is ready
bot.on('ready', async () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  setInterval(() => auditHelpCache, 60 * 1000);
});

// handle the dropdown menu selections
bot.on('clickMenu', async (m) => {
  const idPrefix = m.id.split('-')[0];
  if (m.id.split('__')[0] === 'todayId') {
      await m.reply.think();
      m.author = m.clicker.user;
      const _client = await dbUtil.connect();
      await botCommands.Remind.createReminder(m, [m.values[0].split('__')[0]], _client);
      await dbUtil.close(_client);
      await m.reply.edit('done!');
  } else if (idPrefix === 'topicId') {
      await m.reply.think();
      const { username } = m.clicker.user;
      const req = HELP_CACHE.get(username);
      const topicId = m.values[0].split('__')[0];
      if (req) {
        req.topicId = topicId;
        req.time = new Date();
      } else {
        HELP_CACHE.set(username, { username: username, topicId: topicId, time: new Date() });
      }
      await m.reply.delete();
  } else if (idPrefix === 'organizerId') {
      await m.reply.think();
      const { username } = m.clicker.user;
      const req = HELP_CACHE.get(username);
      const organizer = m.values[0].split('__')[0];
      if (req) {
        req.organizer = organizer;
        req.time = new Date();
      } else {
        HELP_CACHE.set(username, { username: username, organizer: organizer, time: new Date() });
      }
      await m.reply.delete();
  }
});

bot.on('clickButton', async (b) => {
  const idPrefix = b.id.split('-')[0];
  if (idPrefix === 'btnOrganizerQueue') {
    const { username } = b.clicker.user;
    const req = HELP_CACHE.get(username);
    if (!req || !req.topicId) {
      return b.reply.send(`You didn't provide a topic!`);
    }
    req.time = new Date();
    const guild = bot.guilds.cache.find(i => i.name === orgUtil.guildName);
    const helpChannel = guild.channels.cache.find(i => i.name === orgUtil.helpChannel);
    if (!helpChannel) {
      return b.reply.send(`sorry ${orgUtil.helpChannel} has not been created`);
    }
    const client = await dbUtil.connect();
    const count = await dbUtil.helpQueueCount(client);
    // this apprently has to be timely
    await b.reply.send(`You joined the queue! ${req.organizer ?? 'An organizer'} will contact you shortly\`\`\`Line position: ${count}\`\`\``);
    await dbUtil.addHelpRequest(client, req.username, req.topicId, req.time, req.organizer);
    await dbUtil.close(client);
    await botCommands.Organizer.sendHelpRequestToOrganizers(helpChannel, req.username, req.topicId, req.time, req.organizer, count);
    HELP_CACHE.delete(username);
    console.log(JSON.stringify(HELP_CACHE));
  } else if (idPrefix === orgUtil.helpRequestInProgressPrefix) {
    await botCommands.Organizer.helpRequestInProgress(b);
  } else if (idPrefix === orgUtil.helpRequestCancelIdPrefix) {
    await botCommands.Organizer.cancelHelpRequest(b);
  }
});

bot.on('message', msg => {
  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase();

  if (!bot.commands.has(command)) {
    if (command === '!help') {
      const embed = new Discord.MessageEmbed()
        .setTitle(`Help`)
        .setColor(0xB88DFF)
        .setDescription('see what eris can do for you');
      Object.keys(botCommands).map(key => {
        embed.addField(botCommands[key].name, `${botCommands[key].description} \`\`\`${botCommands[key].syntax}\`\`\``);
      });
      msg.author.send(embed);
    }
    return track(msg);
  };

  try {
    bot.commands.get(command).execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.author.send('there was an error trying to execute that command!');
  }
});
