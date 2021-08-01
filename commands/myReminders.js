const { MessageEmbed } = require('discord.js');
const dbUtil = require('../utils/dbUtil');

const TIME_DOMAIN = {
    m: 60 * 1000,
    h: 36 * 100 * 1000,
    d: 864 * 100 * 1000,
};

const formatDate = async (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return (`${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}  ${strTime}`);
};

const sendReminders = async (msg, client) => {
    const { username } = msg.author;
    const reminders = await dbUtil.getAllRemindersOfUser(client, username);
    if (!reminders) throw new Error(`you don't have any reminders yet!`);
    let reply = '';
    await Promise.all(await reminders.map(async (reminder) => {
        const timeBefore = { reminder };
        const event_doc = reminder.event_docs[0];
        const formalTimeBefore = Math.floor(timeBefore / TIME_DOMAIN.d) ?
            `${Math.floor(timeBefore / TIME_DOMAIN.d)} days` : Math.floor(timeBefore / TIME_DOMAIN.h) ?
                `in ${Math.floor(timeBefore / TIME_DOMAIN.h)} hours` : Math.floor(timeBefore / TIME_DOMAIN.m) ?
                    `in ${Math.floor(timeBefore / TIME_DOMAIN.m)} minutes` : null;
        if (formalTimeBefore) reply += `${event_doc.name} | remind me ${formalTimeBefore} before ${await formatDate(new Date(event_doc.time))}\n`;
    }));
    const embed = new MessageEmbed()
      .setTitle(`Your Reminders`)
      .setColor(0xff0000)
      .setDescription(reply.length > 0 ? reply : `you don't have any reminders yet!`);
    await msg.channel.send(embed);
};

/**
 * let clients see their reminders
 * default format: !my-reminders
 */
module.exports =  {
    name: '!my-reminders',
    description: 'See all your reminders for our awesome TD events!',
    async execute(msg, args) {
        let client = null;
        try {
            client = await dbUtil.connect();
            await sendReminders(msg, client);
            await dbUtil.close(client);
        } catch (err) {
            await msg.reply(`sorry ${err.message}`);
            await dbUtil.close(client);
        }
    },
};