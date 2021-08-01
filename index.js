require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const track = require('./tracking')

Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
bot.login(TOKEN);

bot.on('ready', async () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase();

  if (!bot.commands.has(command)) {
    if (command === '!help') {
      let botInfo = '';
      Object.keys(botCommands).map(key => {
          botInfo += `name: ${botCommands[key].name} | description: ${botCommands[key].description}
              syntax: ${botCommands[key].syntax}\n`;
      });
      const embed = new Discord.MessageEmbed()
          .setTitle(`Help`)
          .setColor(0xff0000)
          .setDescription(botInfo.length > 0 ? botInfo : `we need to add some bot features...`);
      msg.channel.send(embed);
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
