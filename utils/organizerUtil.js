const topics = [
    {
        emoji: '🌐',
        desc: 'general',
        id: 'GEN',
    }, {
        emoji: '💻',
        desc: 'IT assistance',
        id: 'IT',
    }, {
        emoji: '🏆',
        desc: 'challenges questions',
        id: 'CQ',
    }, {
        emoji: '🎟️',
        desc: 'event questions',
        id: 'EQ',
    }, {
        emoji: '📝',
        desc: 'project specific questions',
        id: 'PQ',
    },
]

const organizers = [
    {
        name: 'George',
    }, {
        name: 'Greg',
    }, {
        name: 'Rish',
    }, {
        name: 'Aditya',
    }, {
        name: 'Dan',
    }, {
        name: 'Jack',
    }, {
        name: 'Samarth',
    },
];

const guildName = `testgreg's server`;

const helpChannel = 'help-queue';

const helpRequestInProgressPrefix = 'btn_contact_sender';

const helpRequestCancelIdPrefix = 'btn_cancel_sender';

module.exports = {
    topics,
    organizers,
    helpChannel,
    helpRequestCancelIdPrefix,
    helpRequestInProgressPrefix,
    guildName,
};
