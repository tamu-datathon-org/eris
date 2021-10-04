import fetch from 'node-fetch';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB;

const collectionNameList = [ 'reminder', 'events', 'messages', 'helpqueue' ];

export const connect = async () => mongoInit();

/**
 * Creates a MongoDB client and creates collections if they don't already exist
 * @returns {MongoClient}
 */
export const mongoInit = async () => {
    const client = await (new MongoClient(uri)).connect();
    const db = client.db(DB_NAME);
    const collectionList = await db.listCollections().toArray();
    const collectionNames = new Set(collectionList.map(coll => coll.name));
    collectionNameList.forEach(collName => {
        if (!collectionNames.has(collName)) {
            db.createCollection(collName);
        }
    })
    return client;
}

export const close = async (client) => {
    if (client) await client.close();
};

/**
 * insert one into reminder
 * @param {MongoClient} client 
 * @param {string} sender 
 * @param {string} eventId 
 * @param {Date} timeBefore 
 */
export const addReminder = async (client, sender, eventId, timeBefore) => {
    await client.db(DB_NAME).collection('reminder').insertOne({
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
export const getAllRemindersOfUser = async (client, sender) => {
    const cursor = await client.db(DB_NAME).collection('reminder').aggregate([
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
 * deletes all reminder documents with the given eventId & sender (if the event is changed or something)
 * @param {MongoClient} client 
 * @param {string} sender
 * @param {string} eventId 
 */
export const removeReminder = async (client, sender, eventId) => {
    await client.db(DB_NAME).collection('reminder').deleteMany({
        sender,
        eventId: new ObjectId(eventId),
    });
};

/**
 * query an event
 * @param {string} name 
 * @returns {Object}
 */
export const getEvent = async (name) => {
    // currently name has to be the md file name, but based on the usage it should be the event's name, need api for that
    // const resultResponse = await fetch(`/events/api/json/${name}`);
    const resultResponse = await fetch(`https://tamudatathon.com/events/api/json/${name}`);
    const result = await resultResponse.json();
    console.log(result);
    return result;
}

/**
 * get all the events between 2 date objects
 * @param {MongoClient} client 
 * @param {Date} lower 
 * @param {Date} upper 
 * @returns {Array}
 */
export const getEventsInDateRange = async (client, lower, upper) => {
    const result = await client.db(DB_NAME).collection('events').find({
        time: {
            $gte: lower,
            $lt: upper,
        }
    });
    return result.toArray();
}

/**
 * insert one into messages
 * @param {MongoClient} client 
 * @param {string} sender 
 * @param {string} senderType 
 * @param {string} channel 
 */
export const addMessage = async (client, sender, senderType, channel, content) => {
    await client.db(DB_NAME).collection('messages').insertOne({
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
export const addHelpRequest = async (client, sender, topicId, time, organizer = null) => {
    await client.db(DB_NAME).collection('helpqueue').insertOne({
        sender,
        topicId,
        time,
        organizer,
    });
};

export const removeHelpRequest = async (client, sender, time) => {
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
export const queryHelpQueue = async (client) => {
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
export const helpQueueCount = async (client) => client.db(DB_NAME).collection('helpqueue').find().count();