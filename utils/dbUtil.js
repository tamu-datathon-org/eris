const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://gatekeeper:iQZXQo5nqySyA6su@cluster0.xizka.mongodb.net/<dbname>?retryWrites=true&w=majority'; // '';
const DB_NAME = '<dbname>';

const connect = async () => (new MongoClient(uri)).connect();

const close = async (client) => {
    if (client) await client.close();
};

/**
 * insert one into erisreminder
 * @param {MongoClient} client 
 * @param {string} sender 
 * @param {string} eventId 
 * @param {Date} timeBefore 
 */
const addReminder = async (client, sender, eventId, timeBefore) => {
    await client.db(DB_NAME).collection('erisreminder').insertOne({
        sender,
        eventId: new ObjectId(eventId),
        timeBefore,
    });
};

/**
 * query the reminders a certain user has made
 * @param {MongoClient} client 
 * @param {string} sender 
 * @returns {Array}
 */
const getAllRemindersOfUser = async (client, sender) => {
    const cursor = await client.db(DB_NAME).collection('erisreminder').aggregate([
        { $match: { sender } },
        { $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event_docs',
        } },
    ]);
    return cursor.toArray();
};

/**
 * deletes all erisreminder documents with the given eventId & sender (if the event is changed or something)
 * @param {MongoClient} client 
 * @param {string} sender
 * @param {string} eventId 
 */
const removeReminder = async (client, sender, eventId) => {
    await client.db(DB_NAME).collection('erisreminder').deleteMany({
        sender,
        eventId: new ObjectId(eventId),
    });
};

/**
 * query an event
 * @param {MongoClient} client 
 * @param {string} name 
 * @returns {Object}
 */
const getEvent = async (client, name) => {
    const result = await client.db(DB_NAME).collection('events').findOne({
        name,
    });
    return result;
}

/**
 * get all the events between 2 date objects
 * @param {MongoClient} client 
 * @param {Date} lower 
 * @param {Date} upper 
 * @returns {Array}
 */
const getEventsInDateRange = async (client, lower, upper) => {
    const result = await client.db(DB_NAME).collection('events').find({
        time: {
            $gte: lower,
            $lt: upper,
        }
    });
    return result.toArray();
}

/**
 * insert one into eristracker
 * @param {MongoClient} client 
 * @param {string} sender 
 * @param {string} senderType 
 * @param {string} channel 
 */
const addTracker = async (client, sender, senderType, channel, content) => {
    await client.db(DB_NAME).collection('eristracker').insertOne({
        sender,
        senderType,
        channel,
        content,
    });
};

/**
 * puts a help request into helpqueue
 * @param {MongoClient} client 
 * @param {string} sender 
 * @param {string} topicId 
 * @param {Date} time 
 * @param {string} organizer 
 */
const addHelpRequest = async (client, sender, topicId, time, organizer = null) => {
    await client.db(DB_NAME).collection('helpqueue').insertOne({
        sender,
        topicId,
        time,
        organizer,
    });
};

const removeHelpRequest = async (client, sender, time) => {
    await client.db(DB_NAME).collection('helpqueue').deleteOne({
        sender,
        time,
    });
};

/**
 * gets the top 5 oldest requests in helpqueue
 * @param {MongoClient} client 
 * @returns {Array}
 */
const queryHelpQueue = async (client) => {
    const result = await client.db(DB_NAME).collection('helpqueue').aggregate([
        { $sort : { time : 1 } },
        { $limit: 5 },
    ])
    return result.toArray();
};

/**
 * get the number of help requests waiting
 * @param {MongoClient} client 
 * @returns {Integer}
 */
const helpQueueCount = async (client) => client.db(DB_NAME).collection('helpqueue').find().count();

module.exports = {
    connect,
    close,
    addReminder,
    getAllRemindersOfUser,
    removeReminder,
    addTracker,
    getEvent,
    getEventsInDateRange,
    addHelpRequest,
    queryHelpQueue,
    helpQueueCount,
    removeHelpRequest,
};
