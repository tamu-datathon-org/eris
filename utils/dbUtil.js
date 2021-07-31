const { MongoClient } = require('mongodb');

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
    const result = await client.db(DB_NAME).collection('erisreminder').insertOne({
        sender,
        eventId,
        timeBefore,
    });
};

/**
 * deletes all erisreminder documents with the given eventId & sender (if the event is changed or something)
 * @param {MongoClient} client 
 * @param {string} sender
 * @param {string} eventId 
 */
const removeReminder = async (client, sender, eventId) => {
    const result = await client.db(DB_NAME).collection('erisreminder').deleteMany({
        sender,
        eventId,
    });
};

const getEvent = async (client, name) => {
    const result = await client.db(DB_NAME).collection('events').findOne({
        name,
    });
    return result;
}

/**
 * insert one into eristracker
 * @param {MongoClient} client 
 * @param {string} sender 
 * @param {string} senderType 
 * @param {string} channel 
 */
const addTracker = async (client, sender, senderType, channel) => {
    const result = await client.db(DB_NAME).collection('eristracker').insertOne({
        sender,
        senderType,
        channel,
    });
};

module.exports = {
    connect,
    close,
    addReminder,
    removeReminder,
    addTracker,
    getEvent,
};
