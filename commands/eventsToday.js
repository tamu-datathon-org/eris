const { MessageEmbed } = require('discord.js');
const dbUtil = require('../utils/dbUtil');

const sendEventsToday = async (msg, client) => {

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
            await getEventsToday(msg, client);
            await dbUtil.close(client);
        } catch (err) {
            await msg.reply(`sorry ${err.message}`);
            await dbUtil.close(client);
        }
    },
};