'use strict';

// Импорт необходимых модулей
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const mongoose = require('mongoose');
const http = require('http'); // Для WebSocket-сервера
const { Server } = require('socket.io'); // WebSocket библиотека
const TelegramBot = require('node-telegram-bot-api'); // Telegram Bot API
require('dotenv').config(); // Для работы с переменными окружения

console.log('Starting server...');

// Создаем приложение Express
const app = express();
const server = http.createServer(app); // Создаем HTTP сервер для работы с WebSocket
const io = new Server(server); // Инициализируем WebSocket сервер

// Миддлвары
app.use(express.json());
const upload = multer({ dest: 'public/images/' });

// Инициализация переменных окружения
const {
    TELEGRAM_TOKEN,
    TELEGRAM_CHANNEL_ID,
    TELEGRAM_TOKEN_2,
    TELEGRAM_CHANNEL_ID_2,
    TELEGRAM_TOKEN_3,
    TELEGRAM_CHANNEL_ID_3,
    MONGODB_URI,
    PORT = 8080
} = process.env;

if (
    !TELEGRAM_TOKEN || !TELEGRAM_CHANNEL_ID ||
    !TELEGRAM_TOKEN_2 || !TELEGRAM_CHANNEL_ID_2 ||
    !TELEGRAM_TOKEN_3 || !TELEGRAM_CHANNEL_ID_3 ||
    !MONGODB_URI
) {
    console.error('Все необходимые переменные окружения должны быть указаны в .env файле');
    process.exit(1);
}

// Инициализация ботов Telegram
const bot3 = new TelegramBot(TELEGRAM_TOKEN_3, { polling: true });

// Подключение к MongoDB (без устаревших опций)
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch(error => {
        console.error('Could not connect to MongoDB:', error);
        process.exit(1);
    });

// Определение схем для MongoDB
const messageSchema = new mongoose.Schema({
    text: { type: String },
    imageUrl: { type: String },
    likes: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

const cardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    details: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true }
}, { timestamps: true });
const Card = mongoose.model('Card', cardSchema);

const orderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    additionalInfo: { type: String },
    items: [{
        title: String,
        details: String,
        price: String,
        image: String,
        quantity: Number
    }],
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Маршрут для получения всех сообщений
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error('Ошибка получения сообщений:', error);
        res.status(500).json({ error: 'Не удалось получить сообщения' });
    }
});

// Маршрут для добавления лайка
app.post('/api/messages/:id/like', async (req, res) => {
    const { id } = req.params;
    try {
        const message = await Message.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
        if (message) {
            io.emit('like update', { id: message._id, likes: message.likes });
            res.json({ likes: message.likes });
        } else {
            res.status(404).json({ error: 'Сообщение не найдено' });
        }
    } catch (error) {
        console.error('Ошибка при добавлении лайка:', error);
        res.status(500).json({ error: 'Не удалось поставить лайк' });
    }
});

// Функция для отправки заказов в Telegram
app.post('/api/order', async (req, res) => {
    const order = req.body;
    console.log('Received order:', JSON.stringify(order, null, 2));

    try {
        await sendTelegramMessage(order);
        res.json({ message: "Заказ получен и сообщение отправлено в Telegram" });
    } catch (error) {
        console.error("Error sending order to Telegram:", error);
        res.status(500).json({ error: "Failed to send order" });
    }
});

// Функция для отправки заказов и фото боту
async function sendTelegramMessage(order) {
    console.log("Начало отправки фотографий и сообщений...");

    for (const item of order.items) {
        const caption = item.title;
        const photoPath = path.join(__dirname, 'public', 'images', path.basename(item.image));

        if (!fs.existsSync(photoPath)) {
            console.error(`Фото не найдено: ${photoPath}`);
            continue;
        }

        await sendTelegramPhotoToFirstBot(photoPath, caption);
    }

    const orderDetails = order.items.map(item => (
        `${item.title} - ${item.details} - ${item.price} - Количество: ${item.quantity}`
    )).join('\n');

    const message = `Новый заказ на суши:\nИмя: ${order.name}\nАдрес: ${order.address}\nТелефон: ${order.phone}\nДополнительная информация: ${order.additionalInfo || 'Отсутствует'}\nДетали заказа:\n${orderDetails}`;

    try {
        const newOrder = new Order({ name: order.name, address: order.address, phone: order.phone, additionalInfo: order.additionalInfo, items: order.items, message });
        await newOrder.save();
        console.log("Заказ сохранен в MongoDB:", newOrder);
    } catch (error) {
        console.error("Ошибка сохранения заказа в MongoDB:", error);
    }

    await sendTextMessage(TELEGRAM_TOKEN, TELEGRAM_CHANNEL_ID, message);
}

// Функция для отправки фото
async function sendTelegramPhotoToFirstBot(photoPath, caption) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;

    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHANNEL_ID);
    formData.append('caption', caption);
    formData.append('photo', fs.createReadStream(photoPath));

    try {
        const response = await axios.post(url, formData, { headers: formData.getHeaders() });
        console.log("Ответ от бота 1 по фото:", response.data);
    } catch (error) {
        console.error("Ошибка отправки фото через бота 1:", error);
        throw error;
    }
}

// Функция для отправки текстовых сообщений
async function sendTextMessage(token, chatId, message) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload = { chat_id: chatId, text: message };

    try {
        const response = await axios.post(url, payload);
        console.log(`Ответ от бота:`, response.data);
    } catch (error) {
        console.error("Ошибка отправки текстового сообщения:", error);
        throw error;
    }
}

// WebSocket логика
io.on('connection', async (socket) => {
    console.log('Новое подключение WebSocket');
    const messages = await Message.find().sort({ timestamp: 1 });
    socket.emit('chat history', messages);

    socket.on('disconnect', () => {
        console.log('Отключение WebSocket');
    });
});

// Маршруты для работы с корзиной
app.post('/api/cart/add', async (req, res) => {
    const { title, details, price, image, quantity } = req.body;
    try {
        const card = new Card({ title, details, price, image, quantity });
        await card.save();
        res.status(200).json({ message: 'Card added to cart successfully', id: card._id });
    } catch (error) {
        console.error('Ошибка добавления карточки в корзину:', error);
        res.status(500).json({ error: 'Не удалось добавить карточку в корзину' });
    }
});

app.get('/api/cart/items', async (req, res) => {
    try {
        const items = await Card.find();
        res.json(items);
    } catch (error) {
        console.error('Ошибка получения карточек корзины:', error);
        res.status(500).json({ error: 'Не удалось получить карточки корзины' });
    }
});

app.delete('/api/cart/items/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Card.deleteOne({ _id: id });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: `Карточка с id ${id} успешно удалена` });
        } else {
            res.status(404).json({ error: 'Карточка не найдена' });
        }
    } catch (error) {
        console.error('Ошибка удаления карточки из корзины:', error);
        res.status(500).json({ error: 'Не удалось удалить карточку из корзины' });
    }
});

app.post('/api/cart/clear', async (req, res) => {
    try {
        await Card.deleteMany({});
        res.status(200).json({ message: 'Корзина успешно очищена' });
    } catch (error) {
        console.error('Ошибка очистки корзины:', error);
        res.status(500).json({ error: 'Не удалось очистить корзину' });
    }
});

// Статические файлы
app.use(express.static('public'));

// Запуск сервера
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
}); 

 