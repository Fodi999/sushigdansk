//server.js
// Импорт необходимых модулей
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const mongoose = require('mongoose');
const http = require('http');  // Для WebSocket-сервера
const { Server } = require('socket.io');  // WebSocket библиотека
const TelegramBot = require('node-telegram-bot-api'); // Telegram Bot API
require('dotenv').config();  // Для работы с переменными окружения

console.log('Starting server...');

// Создаем приложение Express
const app = express();
const server = http.createServer(app);  // Создаем HTTP сервер для работы с WebSocket
const io = new Server(server);  // Инициализируем WebSocket сервер

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

if (!TELEGRAM_TOKEN || !TELEGRAM_CHANNEL_ID || !TELEGRAM_TOKEN_2 || !TELEGRAM_CHANNEL_ID_2 || !TELEGRAM_TOKEN_3 || !TELEGRAM_CHANNEL_ID_3 || !MONGODB_URI) {
    console.error('Все необходимые переменные окружения должны быть указаны в .env файле');
    process.exit(1);
}

// Инициализация ботов Telegram
const bot3 = new TelegramBot(TELEGRAM_TOKEN_3, { polling: true });  // Для работы с третьим ботом

// Подключение к MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB with Mongoose');
    })
    .catch((error) => {
        console.error('Could not connect to MongoDB:', error);
        process.exit(1);
    });

// Определение схемы для сообщений
const messageSchema = new mongoose.Schema({
    text: { type: String },
    imageUrl: { type: String },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Определение схемы и модели для карточек товаров
const cardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    details: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true },
}, { timestamps: true });

const Card = mongoose.model('Card', cardSchema);

// Определение схемы и модели для заказов
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

// Маршрут для получения всех сообщений из базы данных
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.json(messages);  // Отправка сообщений в формате JSON
    } catch (error) {
        console.error('Ошибка получения сообщений:', error);
        res.status(500).json({ error: 'Не удалось получить сообщения' });
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

// Функция для отправки заказов и фото первому и второму ботам
async function sendTelegramMessage(order) {
    console.log("Начало отправки фотографий и сообщений...");

    // Отправка фотографий первому боту
    for (const item of order.items) {
        const caption = item.title;
        const photoPath = path.join(__dirname, 'public', 'images', path.basename(item.image));

        if (!fs.existsSync(photoPath)) {
            console.error(`Фото не найдено: ${photoPath}`);
            continue;
        }

        console.log(`Отправка фото: ${photoPath} с подписью: ${caption} через бота 1`);
        await sendTelegramPhotoToFirstBot(photoPath, caption);
    }

    const orderDetails = order.items.map(item => (
        `${item.title} - ${item.details} - ${item.price} - Количество: ${item.quantity}`
    )).join('\n');

    const message = `Новый заказ на суши:\n\nИмя: ${order.name}\nАдрес: ${order.address}\nТелефон: ${order.phone}\nДополнительная информация: ${order.additionalInfo || 'Отсутствует'}\nДетали заказа:\n${orderDetails}`;

    // Сохранение заказа в MongoDB
    try {
        const newOrder = new Order({
            name: order.name,
            address: order.address,
            phone: order.phone,
            additionalInfo: order.additionalInfo,
            items: order.items,
            message: message
        });

        await newOrder.save();
        console.log("Заказ сохранен в MongoDB:", newOrder);
    } catch (error) {
        console.error("Ошибка сохранения заказа в MongoDB:", error);
    }

    // Отправка текстового сообщения первому боту
    console.log(`Отправка сообщения первому боту: ${message}`);
    await sendTextMessage(TELEGRAM_TOKEN, TELEGRAM_CHANNEL_ID, message);

    // Создание файла с данными заказа и отправка его второму боту
    const filePath = path.join(__dirname, `order_${Date.now()}.txt`);
    const fileContent = `Имя: ${order.name}\nАдрес: ${order.address}\nТелефон: ${order.phone}\nДополнительная информация: ${order.additionalInfo || 'Отсутствует'}`;

    try {
        fs.writeFileSync(filePath, fileContent);
        console.log("Файл заказа создан:", filePath);
    } catch (error) {
        console.error("Ошибка создания файла заказа:", error);
        throw error;
    }

    console.log(`Отправка файла второму боту: ${filePath}`);
    await sendDocumentMessage(TELEGRAM_TOKEN_2, TELEGRAM_CHANNEL_ID_2, filePath);

    // Удаление файла после отправки
    fs.unlinkSync(filePath);
    console.log("Файл заказа удален:", filePath);
}

// Функция для отправки фотографий первому боту
async function sendTelegramPhotoToFirstBot(photoPath, caption) {
    const url1 = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;

    const formData1 = new FormData();
    formData1.append('chat_id', TELEGRAM_CHANNEL_ID);
    formData1.append('caption', caption);
    formData1.append('photo', fs.createReadStream(photoPath));

    try {
        const response1 = await axios.post(url1, formData1, {
            headers: formData1.getHeaders()
        });
        console.log("Ответ от бота 1 по фото:", response1.data);
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

// Функция для отправки документов (файлов)
async function sendDocumentMessage(token, chatId, filePath) {
    const url = `https://api.telegram.org/bot${token}/sendDocument`;
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', fs.createReadStream(filePath));

    try {
        const response = await axios.post(url, formData, {
            headers: formData.getHeaders()
        });
        console.log("Файл отправлен:", response.data);
    } catch (error) {
        console.error("Ошибка отправки файла:", error);
        throw error;
    }
}

// Обработчик для вебхука от третьего бота (бот 3)
bot3.on('message', async (msg) => {
    let messageData = {
        text: msg.caption || msg.text || '',  // Текст из caption (если это фото) или текст сообщения
        imageUrl: ''
    };

    // Проверяем наличие фото в сообщении
    if (msg.photo && msg.photo.length > 0) {
        const fileId = msg.photo[msg.photo.length - 1].file_id;  // Получаем самое большое изображение
        try {
            // Получаем информацию о файле с помощью API Telegram
            const file = await bot3.getFile(fileId);
            messageData.imageUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN_3}/${file.file_path}`;
        } catch (error) {
            console.error('Ошибка получения URL изображения:', error);
        }
    }

    // Проверка на наличие контента
    if (!messageData.text && !messageData.imageUrl) {
        console.log('Сообщение не содержит контента.');
        return;
    }

    try {
        // Сохраняем сообщение в MongoDB
        const newMessage = new Message({
            text: messageData.text,
            imageUrl: messageData.imageUrl
        });
        await newMessage.save();

        // Передаем сообщение на сайт через WebSocket
        io.emit('chat message', messageData);
    } catch (error) {
        console.error('Ошибка сохранения сообщения:', error);
    }
});

// Получение всех сообщений при подключении клиента
io.on('connection', async (socket) => {
    console.log('Новое подключение WebSocket');

    // Отправляем все сохраненные сообщения клиенту
    const messages = await Message.find().sort({ timestamp: 1 });
    socket.emit('chat history', messages);

    socket.on('disconnect', () => {
        console.log('Отключение WebSocket');
    });
});

// Работа с корзиной через Mongoose (без отправки на бот 3)
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
    console.log('Fetching cart items...');
    try {
        const items = await Card.find();
        console.log('Cart items fetched:', items);
        res.json(items);
    } catch (error) {
        console.error('Ошибка получения карточек корзины:', error);
        res.status(500).json({ error: 'Не удалось получить карточки корзины' });
    }
});

app.delete('/api/cart/items/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received request to delete item with id: ${id}`);

    try {
        const result = await Card.deleteOne({ _id: id });

        if (result.deletedCount > 0) {
            console.log(`Карточка с id: ${id} успешно удалена из корзины.`);
            res.status(200).json({ message: `Карточка с id ${id} успешно удалена из корзины` });
        } else {
            res.status(404).json({ error: 'Карточка не найдена' });
        }
    } catch (error) {
        console.error('Ошибка удаления карточки из корзины:', error);
        res.status(500).json({ error: 'Не удалось удалить карточку из корзины' });
    }
});

app.post('/api/cart/clear', async (req, res) => {
    console.log('Clearing cart...');
    try {
        await Card.deleteMany({});
        console.log('Корзина успешно очищена');
        res.status(200).json({ message: 'Корзина успешно очищена' });
    } catch (error) {
        console.error('Ошибка очистки корзины:', error);
        res.status(500).json({ error: 'Не удалось очистить корзину' });
    }
});

// Статические файлы
app.use(express.static('public'));

// Запуск сервера с WebSocket
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});







