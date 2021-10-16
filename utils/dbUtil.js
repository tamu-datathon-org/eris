import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';
import { MongoClient, ObjectId } from 'mongodb';
import moment from 'moment';

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
    const client2 = await connect();
    try {
        await client2.db(DB_NAME).collection('reminder').insertOne({
            sender,
            eventId,
            timeBefore,
        });
    } catch (error) {
        console.log(error);
    }
};

/**
 * query the reminders a certain user has made
 * @param {MongoClient} client 
 * @param {string} sender 
 * @returns {Array}
 */
export const getAllRemindersOfUser = async (client, sender) => {
    const cursor = await client.db(DB_NAME).collection('reminder').aggregate([
        { $match: { sender } }
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
    const resultResponse = await fetch(`https://tamudatathon.com/events/api/json/`);
    const events = await resultResponse.json();
    const filteredEvents = events.filter(e => e.name == name);
    return filteredEvents[0];
}

/**
 * query an event using its ID
 * @param {string} id 
 * @returns {Object}
 */
 export const getEventFromId = async (id) => {
    const resultResponse = await fetch(`https://tamudatathon.com/events/api/json/${id}`);
    const event = await resultResponse.json();
    return event;
}

/**
 * get all the events between 2 date objects
 * @param {MongoClient} client 
 * @param {Date} lower 
 * @param {Date} upper 
 * @returns {Array}
 */
export const getEventsInDateRange = async (client, lower, upper) => {
    const eventsRes = await fetch('https://tamudatathon.com/events/api/json');
    const events = await eventsRes.json();
    const filteredEvents = events.filter((e) => {
        const tdStartDay = new Date('October 15, 2021 00:00:00-500');
        const momentTest = moment(e.startTime, 'YYYY-MM-DD hh:mm A');
        const eventStartTime = momentTest.isValid() ? momentTest.toDate() : new Date(e.startTime);
        return eventStartTime > tdStartDay;
      });
    return filteredEvents;
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