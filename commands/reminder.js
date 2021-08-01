const { MessageEmbed } = require('discord.js');
const dbUtil = require('../utils/dbUtil');

// ------------ globals -------------
const REMINDERS = new Map();
const TIME_DOMAIN = {
    m: 60 * 1000,
    h: 36 * 100 * 1000,
    d: 864 * 100 * 1000,
};

const parseArgs = async (args) => {
    let timeDomain = args[2] ?? 'm';
    console.log(timeDomain);
    const timeMagnitude = Math.floor(parseFloat(args[1])) ?? 5;
    if (!TIME_DOMAIN[timeDomain.toLowerCase()]) {
        timeDomain = (new RegExp(/min/ig)).test(timeDomain) ? 'm' : (new RegExp(/h[ou]*r/ig)).test(timeDomain) ?
            'h' : (new RegExp(/da?ys?/ig)).test(timeDomain) ? 'd' : 'm';
    }
    // add nlp soon to make the event easier to find
    return [args[0], timeMagnitude, timeDomain];
}

const removeReminderIfExists = async (client, sender, eventId) => {
    const oldTimeout = await REMINDERS.get(eventId);
    if (oldTimeout) {
        clearTimeout(oldTimeout);
        await dbUtil.removeReminder(client, sender, eventId);
    }
};

const sendReminder = async (msg, username, eventName, eventId, time, timeDomain) => {
    const embed = new MessageEmbed()
      .setTitle(`WAKE UP ${username}!`)
      .setColor(0xff0000)
      .setDescription(`${eventName} is ${timeDomain === 'm' ? `in ${time} minutes` : timeDomain === 'h' ? `in ${time} hours` : timeDomain === 'd' ? `in ${time} days` : 'soon'}!`);
    await msg.channel.send(embed);
    await msg.reply('howdy!');
    const client = await dbUtil.connect();
    await removeReminderIfExists(client, username, eventId);
    await dbUtil.close(client);
};

const createReminder = async (msg, _args, client) => {
    const timeBefore = parseInt(_args[1]) * TIME_DOMAIN[_args[2]];

    // get details
    const event = await dbUtil.getEvent(client, _args[0]);
    if (!event) throw new Error(`i can't find this event!`);
    const { time } = event;
    const _id = event._id.toString();
    const { name } = event;
    const { username } = msg.author;

    // validate the reminder
    if (!time) throw new Error('this event does have a set time yet, stay tuned!');
    if (time <= Date.now()) throw new Error('this event has passed!');
    const tm = time - Date.now() - timeBefore;
    if (tm < 0) {
        const timeUntil = time - Date.now();
        const niceTimeUntil = Math.floor(timeUntil / TIME_DOMAIN.d) ?
            `in ${Math.floor(timeUntil / TIME_DOMAIN.d)} days!` : Math.floor(timeUntil / TIME_DOMAIN.h) ?
                `in ${Math.floor(timeUntil / TIME_DOMAIN.h)} hours!` : Math.floor(timeUntil / TIME_DOMAIN.m) ?
                    `in ${Math.floor(timeUntil / TIME_DOMAIN.m)} minutes!` : 'starting any second!';
        throw new Error(`the event is ${niceTimeUntil}`);
    }

    // actually add the reminder
    const _timeout = setTimeout(() => sendReminder(msg, username, name, _id, _args[1], _args[2]), tm);

    // response timely
    await msg.reply(`reminder set for ${name}`);

    // manage storage
    await removeReminderIfExists(client, username, _id);
    REMINDERS.set(_id, _timeout);
    await dbUtil.addReminder(client, username, _id, timeBefore);
};

/**
 * creates a reminder for a client
 * default format: !remind <event-name> <time-magnitude> <time-domain>
 */
module.exports =  {
    name: '!remind',
    description: 'Creates a reminder for awesome TD events!',
    async execute(msg, args) {
        let client = null;
        try {
            const _args = await parseArgs(args);
            console.log(_args);
            client = await dbUtil.connect();
            if (_args.length < 3) throw new Error(`you didn't enter the right number of arguments!`);
            await createReminder(msg, _args, client);
            await dbUtil.close(client);
        } catch (err) {
            await msg.reply(`sorry ${err.message}`);
            await dbUtil.close(client);
        }
    },
};
