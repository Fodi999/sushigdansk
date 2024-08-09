//db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

let client;

async function connectToDatabase() {
    if (!client) {
        try {
            client = new MongoClient(uri);  // Убраны устаревшие опции
            await client.connect();
            console.log("Connected to MongoDB");
        } catch (err) {
            console.error("Failed to connect to MongoDB", err);
            throw err; // Проброс ошибки для дальнейшей обработки
        }
    }
    return client;
}

async function getDatabase() {
    const client = await connectToDatabase();
    return client.db('sushigdansk');
}

module.exports = {
    connectToDatabase,
    getDatabase,
};




 