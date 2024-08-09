// db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

let db;

async function connectToDatabase() {
    if (db) return db;

    try {
        // Подключение к MongoDB без устаревших опций
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        db = client.db();
        return db;
    } catch (error) {
        console.error('Could not connect to MongoDB:', error);
        throw error;
    }
}

async function getDatabase() {
    if (!db) {
        await connectToDatabase();
    }
    return db;
}

module.exports = {
    connectToDatabase,
    getDatabase,
};





 