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

const channel = 'help-queue'; // 'Organizers';

const helpRequestContactIdSuffix = 'btn_contact_sender';

const helpRequestCancelIdSuffix = 'btn_contact_sender';

module.exports = {
    topics,
    organizers,
    channel,
    helpRequestCancelIdSuffix,
    helpRequestContactIdSuffix,
};
