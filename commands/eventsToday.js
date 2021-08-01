const { MessageEmbed } = require('discord.js');
const dbUtil = require('../utils/dbUtil');
const dateUtil = require('../utils/dateUtil');

const sendEventsToday = async (msg, client) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const events = await dbUtil.getEventsInDateRange(client, today, tomorrow);
    const embed = new MessageEmbed()
      .setTitle(`Today's Events`)
      .setColor(0xff0000);
    if (events.length > 0) {
        await Promise.all(await events.map(async (event) => {
            if (event.time) embed.addField(event.name, `${event.description}\`\`\`${await dateUtil.formatDate(new Date(event.time))}\`\`\``);
        }));
    } else {
        embed.addDescription('there are no events today :(');
    }
    await msg.channel.send(embed);
};

/**
 * let clients see the events today
 */
module.exports =  {
    name: '!events-today',
    description: 'See all the TD events happening today',
    syntax: '!events-today',
    async execute(msg, args) {
        let client = null;
        try {
            client = await dbUtil.connect();
            await sendEventsToday(msg, client);
            await dbUtil.close(client);
        } catch (err) {
            await msg.reply(`sorry ${err.message}`);
            await dbUtil.close(client);
        }
    },
};