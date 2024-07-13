const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

console.log('Starting server...');

const app = express();
app.use(express.json());
const upload = multer({ dest: 'public/images/' });

const { TELEGRAM_TOKEN, TELEGRAM_CHANNEL_ID, PORT = 8080 } = process.env;

if (!TELEGRAM_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.error('TELEGRAM_TOKEN and TELEGRAM_CHANNEL_ID must be set in the .env file');
    process.exit(1);
}

app.post('/api/order', async (req, res) => {
    const order = req.body;

    try {
        await sendTelegramMessage(order);
        res.json({ message: "Заказ получен и сообщение отправлено в Telegram" });
    } catch (error) {
        console.error("Error sending order to Telegram:", error);
        res.status(500).json({ error: "Failed to send order" });
    }
});

async function sendTelegramMessage(order) {
    console.log("Sending photos to Telegram...");

    for (const item of order.items) {
        const caption = item.title;
        const photoPath = path.join(__dirname, 'public', 'images', path.basename(item.image));
        console.log(`Sending photo path: ${photoPath} with caption: ${caption}`);
        await sendTelegramPhoto(photoPath, caption);
    }

    const orderDetails = order.items.map(item => (
        `${item.title} - ${item.details} - ${item.price} - Количество: ${item.quantity}`
    )).join('\n');

    const message = `Новый заказ на суши:\n\nИмя: ${order.name}\nАдрес: ${order.address}\nТелефон: ${order.phone}\nДетали заказа:\n${orderDetails}`;

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

const cartItems = [];
const mutex = new (require('async-mutex').Mutex)();

app.post('/api/cart/add', async (req, res) => {
    const item = req.body;

    await mutex.runExclusive(() => {
        cartItems.push(item);
    });

    res.sendStatus(200);
});

app.get('/api/cart/items', async (req, res) => {
    await mutex.runExclusive(() => {
        res.json(cartItems);
    });
});

app.delete('/api/cart/items/:index', async (req, res) => {
    const index = parseInt(req.params.index);

    if (isNaN(index) || index < 0 || index >= cartItems.length) {
        return res.status(400).json({ error: "Invalid item index" });
    }

    await mutex.runExclusive(() => {
        cartItems.splice(index, 1);
    });

    res.sendStatus(200);
});

app.post('/api/cart/clear', async (req, res) => {
    await mutex.runExclusive(() => {
        cartItems.length = 0;
    });

    res.sendStatus(200);
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});


