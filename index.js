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

  if (!bot.commands.has(command)){
    return track(msg);
  };

  console.info(`Called command: ${command}`);
  try {
    bot.commands.get(command).execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
});
