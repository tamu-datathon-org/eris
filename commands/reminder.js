const { MessageEmbed } = require('discord.js');
const dbUtil = require('../utils/dbUtil');
const dateUtil = require('../utils/dateUtil');

// ------------ globals -------------
const REMINDERS = new Map();

const parseArgs = async (args) => {
    const tm = args[1] ?? 5;
    let timeDomain = args[2] ?? 'm';
    console.log(timeDomain);
    const timeMagnitude = Math.floor(parseFloat(tm));
    if (!dateUtil.TIME_DOMAIN[timeDomain.toLowerCase()]) {
        timeDomain = (new RegExp(/min/ig)).test(timeDomain) ? 'm' : (new RegExp(/h[ou]*r/ig)).test(timeDomain) ?
            'h' : (new RegExp(/da?ys?/ig)).test(timeDomain) ? 'd' : 'm';
    }
    // add nlp soon to make the event easier to find
    return [args[0], timeMagnitude, timeDomain];
}

const removeReminderIfExists = async (client, sender, eventId) => {
    const oldTimeout = await REMINDERS.get(eventId);
    try {
        clearTimeout(oldTimeout);
        REMINDERS.delete(eventId);
        await dbUtil.removeReminder(client, sender, eventId);
    } catch (err) {
        // do nothing
    }
};

const sendReminder = async (msg, username, eventName, eventId, time, timeDomain) => {
    const embed = new MessageEmbed()
      .setTitle(`WAKE UP ${username}!`)
      .setColor(0x80FFD5)
      .setDescription(`${eventName} is ${timeDomain === 'm' ? `in ${time} mins` : timeDomain === 'h' ? `in ${time} hrs` : timeDomain === 'd' ? `in ${time} days` : 'soon'}!`);
    await msg.author.send(embed);
    const client = await dbUtil.connect();
    await removeReminderIfExists(client, username, eventId);
    await dbUtil.close(client);
};

const createReminder = async (msg, args, client) => {
    const _args = await parseArgs(args);
    if (!_args[0]) throw new Error(`you didn't enter an event!`);
    const timeBefore = parseInt(_args[1]) * dateUtil.TIME_DOMAIN[_args[2]];

    // get details
    const event = await dbUtil.getEvent(client, _args[0]);
    if (!event) throw new Error(`i can't find this event!`);
    const { time } = event;
    const _id = event._id.toString();
    const { name } = event;
    const { username } = msg.author;

    // validate the reminder
    if (!time) throw new Error('this event does have a set time yet, stay tuned!');
    if (time <= Date.now()) throw new Error(`${name} has passed!`);
    const tm = time - Date.now() - timeBefore;
    if (tm < 0) {
        const timeUntil = time - Date.now();
        const niceTimeUntil = await dateUtil.msToTimeDomain(timeUntil) || 'any second';
        throw new Error(`i can't set that reminder ...the ${name} is in ${niceTimeUntil}!`);
    }

    // actually add the reminder
    const _timeout = setTimeout(() => sendReminder(msg, username, name, _id, _args[1], _args[2]), tm);

    // respond timely
    await msg.channel.send(`reminder set for ${await dateUtil.msToTimeDomain(timeBefore)} before ${name}`);

    // manage storage
    await removeReminderIfExists(client, username, _id);
    REMINDERS.set(_id, _timeout);
    await dbUtil.addReminder(client, username, _id, timeBefore);
};

/**
 * creates a reminder for a client
 */
module.exports =  {
    name: '!remind',
    description: 'Creates reminders for our awesome TD events!',
    syntax: '!remind <event-name> <amount-of-time-before-the-event> <mins/hours/days>',
    createReminder,
    async execute(msg, args) {
        let client = null;
        try {
            client = await dbUtil.connect();
            await createReminder(msg, args, client);
            await dbUtil.close(client);
        } catch (err) {
            await msg.author.send(`sorry ${err.message}`);
            await dbUtil.close(client);
        }
    },
};
