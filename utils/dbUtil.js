const { MongoClient } = require('mongodb');

const uri = '';

const connect = async () => {
    try {
        return (new MongoClient(uri)).connect();
    } catch (err) {
        console.log('connection failed');
        throw new Error(`attempt to connect to database failed: ${err.message}`);
    }
};

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
    try {
        const result = await client.collection('erisreminder').insertOne({
            sender,
            eventId,
            timeBefore,
        });
        console.log(`${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`);
    } catch (err) {
        console.log(`sorry, could not add a reminder ${err.message}`);
    }
};

/**
 * deletes all erisreminder documents with the given eventId (if the event is canceled)
 * @param {MongoClient} client 
 * @param {string} eventId 
 */
const updateReminder = async (client, eventId) => {
    try {
        const result = await client.deleteMany({
            eventId,
        });
        console.log(`Deleted ${result.deletedCount} documents`);
    } catch (err) {
        console.log(`sorry, could not delete all reminders ${err.message}`);
    }
};

/**
 * insert one into eristracker
 * @param {MongoClient} client 
 * @param {string} sender 
 * @param {string} senderType 
 * @param {string} channel 
 */
const addTracker = async (client, sender, senderType, channel) => {
    try {
        const result = await client.collection('eristracker').insertOne({
            sender,
            eventId,
            timeBefore,
        });
        console.log(`${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`);
    } catch (err) {
        console.log(`sorry, could not add a reminder ${err.message}`);
    }
};

module.exports = {
    connect,
    close,
    addReminder,
    addTracker,
};
