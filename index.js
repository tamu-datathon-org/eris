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
      const embed = new Discord.MessageEmbed()
        .setTitle(`Help`)
        .setColor(0xff0000);
      Object.keys(botCommands).map(key => {
        embed.addField(botCommands[key].name, `${botCommands[key].description} \`\`\`${botCommands[key].syntax}\`\`\``);
      });
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
