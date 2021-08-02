require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
require('discord-buttons')(bot);
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const track = require('./tracking');
const dbUtil = require('./utils/dbUtil');

const HELP_CACHE = new Map();

Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
bot.login(TOKEN);

bot.on('ready', async () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('clickMenu', async (m) => {
  if (m.id === 'todayId') {
      await m.reply.think();
      m.author = m.clicker.user;
      const _client = await dbUtil.connect();
      await botCommands.Remind.createReminder(m, [m.values[0].split('__')[0]], _client);
      await dbUtil.close(_client);
      await m.reply.edit('done!');
  } else if (m.id === 'topicId') {
      await m.reply.think();
      const { username } = m.clicker.user;
      if (HELP_CACHE.has(username)) (HELP_CACHE.get(username)).topicId = m.values[0];
      else HELP_CACHE.set(username, { username: username, topicId: m.values[0] });
      await m.reply.delete();
  } else if (m.id === 'organizerId') {
      await m.reply.think();
      const { username } = m.clicker.user;
      if (HELP_CACHE.has(username)) (HELP_CACHE.get(username)).organizer = m.values[0];
      else HELP_CACHE.set(username, { username: username, topicId: m.values[0] });
      await m.reply.delete();
  }
});

bot.on('clickButton', async (b) => {
  if (b.id.split('-')[0] === 'btnOrganizerQueue') {
    const { username } = b.clicker.user;
    const req = HELP_CACHE.get(username);
    if (!req || !req.topicId) {
      return b.reply.send(`You didn't provide a topic!`);
    }
    req.time = new Date();
    const client = await dbUtil.connect();
    await dbUtil.addHelpRequest(client, req.username, req.topicId, req.time, req.organizer);
    const count = await dbUtil.helpQueueCount(client);
    await dbUtil.close(client);
    await botCommands.Organizer.sendHelpRequestToOrganizers(b, req.username, req.topicId, req.time, req.organizer);
    await b.reply.send(`You joined the queue! An organizer will contact you shortly\`\`\`Line position: ${count}\`\`\``);
    HELP_CACHE.delete(username);
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
      msg.reply(embed);
    }
    return track(msg);
  };

  try {
    bot.commands.get(command).execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
});
