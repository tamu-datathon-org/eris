const { MessageEmbed } = require('discord.js');
const dbUtil = require('../utils/dbUtil');

module.exports =  {
    name: '!remind',
    description: 'Creates a reminder for awesome TD events!',
    async execute(msg, args) {
        console.log(args);
        // 1. natural language process the room name
        // 2. setTimeout for client
        // 3. add reminder to mongodb
        const client = await dbUtil.connect();
        console.log('database login successful');
        await client.close();
        // 4. send back confirmation message
        await msg.reply(`reminding you 5 minutes before the event!`);
    },
};
