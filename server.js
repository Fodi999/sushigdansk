const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const compression = require('compression');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 8080;

// Используем compression middleware
app.use(compression());

// Используем статические файлы из папки 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Используем body-parser для обработки JSON запросов
app.use(bodyParser.json());

// Настройки для Telegram Bot
const TELEGRAM_TOKEN = '7186385439:AAHJTPaPcSLq-5xSkCC1FkNzpnViJiXzjnM';  // Здесь вставьте ваш токен
const TELEGRAM_CHANNEL_ID = '1142224362';  // Здесь вставьте ваш ID канала

// Функция для отправки сообщения в Telegram канал
function sendTelegramMessage(order) {
    const orderDetails = order.order.map(item => `${item.title} - ${item.details} - ${item.price}`).join('\n');
    const message = `New Sushi Order:\n\nName: ${order.name}\nAddress: ${order.address}\nPhone: ${order.phone}\nOrder Details:\n${orderDetails}`;
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const data = JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text: message,
    });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
        },
    };

    const req = https.request(options, (res) => {
        let response = '';
        res.on('data', (chunk) => {
            response += chunk;
        });
        res.on('end', () => {
            console.log('Message sent to Telegram:', response);
        });
    });

    req.on('error', (error) => {
        console.error('Error sending message to Telegram:', error);
    });

    req.write(data);
    req.end();
}

// Обрабатываем GET запрос на корневой URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обрабатываем POST запрос на /order
app.post('/order', (req, res) => {
    const order = req.body;
    console.log('Order received:', order);

    try {
        sendTelegramMessage(order);
        res.status(200).json({ message: 'Order received and message sent to Telegram' });
    } catch (error) {
        console.error('Error sending order:', error);
        res.status(500).json({ message: 'Error sending order' });
    }
});

// Запускаем сервер на указанном порту
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

