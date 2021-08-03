const { MessageMenu, MessageMenuOption, MessageButton, MessageActionRow } = require('discord-buttons');
const orgUtil = require('../utils/organizerUtil');
const dbUtil = require('../utils/dbUtil');
const dateUtil = require('../utils/dateUtil');

const helpRequestInProgress = async (btn) => {
    await btn.message.react('🔨');
    await btn.reply.send(`${btn.clicker.user.username} helping...`);
};

const cancelHelpRequest = async (btn) => {
    const args = btn.id.split('-');
    args.shift();
    const client = await dbUtil.connect();
    const time = new Date(parseInt(args.shift()));
    const sender = args.join('-');
    await dbUtil.removeHelpRequest(client, sender, time);
    await dbUtil.close(client);
    await btn.reply.send('request removed');
    await btn.message.delete();
};

const sendHelpRequestToOrganizers = async (msg, sender, topicId, time, organizer = null) => {
    const helpChannel = await msg.guild.channels.cache.find(i => i.name === orgUtil.channel);
    const btnAnswer = new MessageButton()
      .setStyle('blurple')
      .setLabel('I Will Contact') 
      .setID(`${orgUtil.helpRequestInProgressPrefix}-${time.getTime()}-${sender}`);
    const btnCancel = new MessageButton()
      .setStyle('red')
      .setLabel('Resolved')
      .setID(`${orgUtil.helpRequestCancelIdPrefix}-${time.getTime()}-${sender}`);
    const row = new MessageActionRow()
      .addComponents([btnAnswer, btnCancel]);
    console.log(topicId);
    const topicDesc = (orgUtil.topics.find(i => i.id === topicId)).desc;
    await helpChannel.send(`
        Topic \`\`\`${topicDesc}\`\`\`Scheduled At \`\`\`${await dateUtil.formatDate(time)}\`\`\`User \`\`\`${sender}\`\`\`For \`\`\`${organizer ?? 'anyone'}\`\`\`
        `, row);
};

const sendHelpForm = async (msg) => {
    const btn = new MessageButton()
      .setStyle('blurple')
      .setLabel('Join') 
      .setID(`btnOrganizerQueue-${Date.now()}`);
    const topicMenu = new MessageMenu()
      .setID(`topicId-${Date.now()}`)
      .setPlaceholder('topic...')
      .setMaxValues(1)
      .setMinValues(1)
    const organizerMenu = new MessageMenu()
      .setID(`organizerId-${Date.now()}`)
      .setPlaceholder('organizer... (optional)')
      .setMaxValues(1)
      .setMinValues(0)
    if ((orgUtil.organizers?.length === 0) || (orgUtil.topics?.length === 0)) {
        return msg.channel.send('sorry, this feature is not supported right now');
    }
    orgUtil.organizers.forEach((o) => {
        const option = new MessageMenuOption()
          .setLabel(o.name)
          .setValue(`${o.name}__${Date.now()}`);
        organizerMenu.addOption(option);
    });
    orgUtil.topics.forEach((t) => {
        const option = new MessageMenuOption()
          .setLabel(t.emoji)
          .setValue(`${t.id}__${Date.now()}`)
          .setDescription(t.desc);
        topicMenu.addOption(option);
    });
    await msg.channel.send('What topic would you like to discuss?', topicMenu);
    await msg.channel.send('Is there a certain organizer you would like to speak with? (optional)', organizerMenu);
    await msg.channel.send('Join the Queue!', btn);
};

/**
 * let clients set up a meeting with an organizer for help or advice
 */
module.exports =  {
    name: '!organizer',
    description: 'Get help or advice from a TD organizer',
    syntax: '!organizer',
    getFiveHelpRequests,
    sendHelpRequestToOrganizers,
    cancelHelpRequest,
    helpRequestInProgress,
    async execute(msg, args) {
        try {
            if (msg.channel.name === orgUtil.channel) throw new Error(`we keepin it clean in the help-queue!`);
            await sendHelpForm(msg);
        } catch (err) {
            await msg.channel.send(`sorry ${err.message}`);
        }
    },
};