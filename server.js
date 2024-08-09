// server.js
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const { getDatabase, connectToDatabase } = require('./db');
const { ObjectId } = require('mongodb');
require('dotenv').config();

console.log('Starting server...');

const app = express();
app.use(express.json());

const upload = multer({
    dest: 'public/images/',
    limits: { fileSize: 10 * 1024 * 1024 }, // Ограничение размера файла до 10MB
});

const { TELEGRAM_TOKEN, TELEGRAM_CHANNEL_ID, PORT = 8080 } = process.env;

if (!TELEGRAM_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.error('TELEGRAM_TOKEN and TELEGRAM_CHANNEL_ID must be set in the .env file');
    process.exit(1);
}

// Проверка подключения к MongoDB
async function startServer() {
    try {
        const client = await connectToDatabase();
        console.log("MongoDB connection established successfully");

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1); // Завершение процесса, если подключение не удалось
    }
}

app.post('/api/order', async (req, res) => {
    const order = req.body;

    if (!order || !order.items || !order.name || !order.address || !order.phone) {
        return res.status(400).json({ error: 'Missing required order fields' });
    }

    console.log('Received order:', order);

    try {
        const db = await getDatabase();
        const result = await db.collection('orders').insertOne(order);

        if (result.insertedCount === 0) {
            throw new Error('Failed to insert order into the database');
        }

        console.log("Order inserted:", result.insertedId);

        await sendTelegramMessage(order);
        res.json({ message: "Заказ получен и сообщение отправлено в Telegram" });
    } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).json({ error: "Failed to process order" });
    }
});

async function sendTelegramMessage(order) {
    console.log("Sending photos to Telegram...");

    for (const item of order.items) {
        const caption = item.title;
        const photoPath = path.join(__dirname, 'public', 'images', path.basename(item.image));
        
        if (!fs.existsSync(photoPath)) {
            console.error(`Photo not found: ${photoPath}`);
            continue;
        }
        
        console.log(`Sending photo path: ${photoPath} with caption: ${caption}`);
        await sendTelegramPhoto(photoPath, caption);
    }

    const orderDetails = order.items.map(item => (
        `${item.title} - ${item.details} - ${item.price} - Количество: ${item.quantity}`
    )).join('\n');

    const message = `Новый заказ на суши:\n\nИмя: ${order.name}\nАдрес: ${order.address}\nТелефон: ${order.phone}\nДополнительная информация: ${order.additionalInfo || 'Отсутствует'}\nДетали заказа:\n${orderDetails}`;

    const textURL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const textPayload = { chat_id: TELEGRAM_CHANNEL_ID, text: message };

    try {
        const textResp = await axios.post(textURL, textPayload);
        console.log("Text message response:", textResp.data);
    } catch (error) {
        console.error("Error sending text message:", error);
        throw error;
    }
}

async function sendTelegramPhoto(photoPath, caption) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;

    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHANNEL_ID);
    formData.append('caption', caption);
    formData.append('photo', fs.createReadStream(photoPath));

    try {
        const response = await axios.post(url, formData, {
            headers: formData.getHeaders()
        });
        console.log("Photo response:", response.data);
    } catch (error) {
        console.error("Error sending photo:", error);
        throw error;
    }
}

app.post('/api/cart/add', async (req, res) => {
    const item = req.body;

    if (!item || !item.title || !item.price || !item.quantity) {
        return res.status(400).json({ error: 'Missing required item fields' });
    }

    try {
        const db = await getDatabase();
        await db.collection('cart').insertOne(item);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/cart/items', async (req, res) => {
    try {
        const db = await getDatabase();
        const items = await db.collection('cart').find().toArray();
        console.log("Fetched items:", items);
        res.json(items);
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/api/cart/items/:id', async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid item ID' });
    }

    try {
        const db = await getDatabase();
        await db.collection('cart').deleteOne({ _id: new ObjectId(id) });
        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting item from cart:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/cart/clear', async (req, res) => {
    try {
        const db = await getDatabase();
        await db.collection('cart').deleteMany({});
        res.sendStatus(200);
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const db = await getDatabase();
        const orders = await db.collection('orders').find().toArray();
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.use(express.static('public'));

startServer();



















