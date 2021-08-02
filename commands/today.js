const { MessageEmbed } = require('discord.js');
const { MessageMenu, MessageMenuOption } = require('discord-buttons');
const dbUtil = require('../utils/dbUtil');
const dateUtil = require('../utils/dateUtil');
const reminder = require('./reminder');

const sendEventsToday = async (msg, client) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const events = await dbUtil.getEventsInDateRange(client, today, tomorrow);
    const embed = new MessageEmbed()
      .setTitle(`Today's Events`)
      .setColor(0x80D5FF);
    if (events.length > 0) {
        const menu = new MessageMenu()
          // .setID(`todayId-${Date.now()}`)
          .setID('todayId')
          .setPlaceholder('remind me 5 mins before...');
        await Promise.all(events.map(async (event) => {
            embed.addField(event.name, `${event.description}\`\`\`${await dateUtil.formatDate(new Date(event.time))}\`\`\``);
            const menuOption = new MessageMenuOption()
                .setLabel(event.name)
                .setEmoji('⏰')
                // .setValue(`${event.name}__${Date.now()}`)
                .setValue(event.name);
            menu.addOption(menuOption);
        }));
        /*
        msg.client.on('clickMenu', async (m) => {
            if (m.id.split('-')[0] === 'todayId') {
                // await m.reply.think();
                const _client = await dbUtil.connect();
                await reminder.createReminder(msg, [m.values[0].split('__')[0]], _client);
                await dbUtil.close(_client);
                try {
                    await m.reply.edit('done!');
                } catch (err) {
                    await m.reply.send('done!');
                }
            }
        });
        */
        await msg.reply(embed, menu);
    } else {
        await msg.reply('there are no events today :(');
    }
};

/**
 * let clients see the events today
 */
module.exports =  {
    name: '!today',
    description: 'See all the TD events happening today',
    syntax: '!today',
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