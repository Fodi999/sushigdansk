//server.js
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('Starting server...');

const app = express();
app.use(express.json());
const upload = multer({ dest: 'public/images/' });

const { TELEGRAM_TOKEN, TELEGRAM_CHANNEL_ID, MONGODB_URI, PORT = 8080 } = process.env;

if (!TELEGRAM_TOKEN || !TELEGRAM_CHANNEL_ID || !MONGODB_URI) {
    console.error('TELEGRAM_TOKEN, TELEGRAM_CHANNEL_ID и MONGODB_URI должны быть указаны в .env файле');
    process.exit(1);
}

// Подключение к MongoDB с использованием Mongoose
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB with Mongoose');
    })
    .catch((error) => {
        console.error('Could not connect to MongoDB:', error);
        process.exit(1);
    });

// Определение схемы и модели для карточек
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

// Маршрут для добавления тестового элемента в коллекцию Card
app.get('/api/test-add-item', async (req, res) => {
    try {
        const testItem = new Card({
            title: 'Test Sushi Set',
            details: 'This is a test sushi set',
            price: '100 zł',
            image: 'images/test-image.webp',
            quantity: 1
        });

        await testItem.save();

        console.log('Test item added:', testItem);

        res.status(200).json({ message: 'Test item added successfully', item: testItem });
    } catch (error) {
        console.error('Error adding test item:', error);
        res.status(500).json({ error: 'Failed to add test item' });
    }
});

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
        console.log("Order saved to MongoDB:", newOrder);
    } catch (error) {
        console.error("Error saving order to MongoDB:", error);
    }

    // Отправка сообщения в Telegram
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

// Работа с корзиной через Mongoose

app.post('/api/cart/add', async (req, res) => {
    const { title, details, price, image, quantity } = req.body;

    try {
        const card = new Card({ title, details, price, image, quantity });
        await card.save();
        res.status(200).json({ message: 'Card added to cart successfully', id: card._id });
    } catch (error) {
        console.error('Error adding card to cart:', error);
        res.status(500).json({ error: 'Failed to add card to cart' });
    }
});

app.get('/api/cart/items', async (req, res) => {
    console.log('Fetching cart items...');
    try {
        const items = await Card.find();
        console.log('Cart items fetched:', items);
        res.json(items);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ error: 'Failed to fetch cart items' });
    }
});

app.delete('/api/cart/items/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received request to delete item with id: ${id}`);

    try {
        const result = await Card.deleteOne({ _id: id });

        if (result.deletedCount > 0) {
            console.log(`Item with id: ${id} successfully removed from cart.`);
            res.status(200).json({ message: `Item with id ${id} successfully removed from cart` });
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
});

// Оставляем функцию очистки корзины, но не вызываем её после обработки заказа
app.post('/api/cart/clear', async (req, res) => {
    console.log('Clearing cart...');
    try {
        await Card.deleteMany({});
        console.log('Cart cleared successfully');
        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

