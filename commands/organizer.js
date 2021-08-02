const { MessageMenu, MessageMenuOption, MessageButton, MessageActionRow } = require('discord-buttons');
const orgUtil = require('../utils/organizerUtil');
const dbUtil = require('../utils/dbUtil');
const dateUtil = require('../utils/dateUtil');

const getFiveHelpRequests = async (msg, client) => {
    const requestsWaiting = await dbUtil.queryHelpQueue(client);
    const helpChannel = await msg.guild.channels.cache.find(i => i.name === orgUtil.channel);
    await Promise.all(requestsWaiting.map(async (req) => {
        const btnAnswer = new MessageButton()
          .setStyle('blurple')
          .setLabel('Contact') 
          .setID(`${req.sender}${orgUtil.helpRequestContactIdSuffix}`);
        const btnCancel = new MessageButton()
          .setStyle('red')
          .setLabel('Cancel Request')
          .setID(`${req.sender}${orgUtil.helpRequestCancelIdSuffix}`);
        const row = new MessageActionRow()
          .addComponents([btnAnswer, btnCancel]);
        const topicDesc = (orgUtil.topics.find(i => i.id = req.topicId)).desc;
        await helpChannel.send(`
            Topic \`\`\`yaml${topicDesc}\`\`\`Scheduled At \`\`\`${await dateUtil.formatDate(new Date(req.time))}\`\`\`User \`\`\`fix${req.sender}\`\`\`For ${req.organizer ?? 'anyone'}
            `, row);
    }));
};

const sendHelpRequestToOrganizers = async (msg, sender, topicId, time, organizer = null) => {
    const helpChannel = await msg.guild.channels.cache.find(i => i.name === orgUtil.channel);
    const btnAnswer = new MessageButton()
      .setStyle('blurple')
      .setLabel('Contact') 
      .setID(`${sender}${orgUtil.helpRequestContactIdSuffix}`);
    const btnCancel = new MessageButton()
      .setStyle('red')
      .setLabel('Cancel Request')
      .setID(`${sender}${orgUtil.helpRequestCancelIdSuffix}`);
    const row = new MessageActionRow()
      .addComponents([btnAnswer, btnCancel]);
    const topicDesc = (orgUtil.topics.find(i => i.id = topicId)).desc;
    await helpChannel.send(`
        Topic \`\`\`${topicDesc}\`\`\`Scheduled At \`\`\`${await dateUtil.formatDate(new Date(time))}\`\`\`User \`\`\`${sender}\`\`\`For \`\`\`${organizer ?? 'anyone'}\`\`\`
        `, row);
};

const sendHelpForm = async (msg) => {
    const btn = new MessageButton()
      .setStyle('blurple')
      .setLabel('Join') 
      .setID(`btnOrganizerQueue-${Date.now()}`);
    const topicMenu = new MessageMenu()
      .setID('topicId')
      .setPlaceholder('topic...')
      .setMaxValues(1)
      .setMinValues(1)
    const organizerMenu = new MessageMenu()
      .setID('organizerId')
      .setPlaceholder('organizer... (optional)')
      .setMaxValues(1)
      .setMinValues(0)
    if ((orgUtil.organizers?.length === 0) || (orgUtil.topics?.length === 0)) {
        return msg.channel.send('sorry, this feature is not supported right now');
    }
    orgUtil.organizers.forEach((o) => {
        const option = new MessageMenuOption()
          .setLabel(o.name)
          .setValue(o.name)
        organizerMenu.addOption(option);
    });
    orgUtil.topics.forEach((t) => {
        const option = new MessageMenuOption()
          .setLabel(t.emoji)
          .setValue(t.id)
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
    async execute(msg, args) {
        try {
            await sendHelpForm(msg);
        } catch (err) {
            await msg.channel.send(`sorry ${err.message}`);
        }
    },
};