const { MessageEmbed } = require('discord.js');
const dbUtil = require('../utils/dbUtil');
const dateUtil = require('../utils/dateUtil');

const sendReminders = async (msg, client) => {
    const { username } = msg.author;
    const reminders = await dbUtil.getAllRemindersOfUser(client, username);
    if (!reminders) throw new Error(`you don't have any reminders yet!`);
    const embed = new MessageEmbed()
      .setTitle(`Your Reminders`)
      .setColor(0x00C3C3);
    if (reminders.length > 0) {
        await Promise.all(await reminders.map(async (reminder) => {
            const event_doc = reminder.event_docs[0];
            const niceTimeBefore = await dateUtil.msToTimeDomain(reminder.timeBefore);
            if (niceTimeBefore && event_doc) embed.addField(event_doc.name, `\`\`\`${niceTimeBefore} before\`\`\` ${await dateUtil.formatDate(new Date(event_doc.time))}`);
        }));
    } else {
        embed.addField('you have no reminder yet!', 'set some with my !remind feature');
    }
    await msg.author.send(embed);
};

/**
 * let clients see their reminders
 */
module.exports =  {
    name: '!my-reminders',
    description: 'View your reminders for our awesome TD events!',
    syntax: '!my-reminders',
    async execute(msg, args) {
        let client = null;
        try {
            client = await dbUtil.connect();
            await sendReminders(msg, client);
            await dbUtil.close(client);
        } catch (err) {
            await msg.author.send(`sorry ${err.message}`);
            await dbUtil.close(client);
        }
    },
};