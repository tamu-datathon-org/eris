const { MongoClient, ObjectId } = require('mongodb');

const uri = '';
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

module.exports = {
    connect,
    close,
    addReminder,
    getAllRemindersOfUser,
    removeReminder,
    addTracker,
    getEvent,
    getEventsInDateRange,
};
