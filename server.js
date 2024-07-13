const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const compression = require('compression');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const TELEGRAM_TOKEN = 'ВАШ_ТЕЛЕГРАМ_ТОКЕН';
const TELEGRAM_CHANNEL_ID = 'ВАШ_ID_ТЕЛЕГРАМ_КАНАЛА';

function sendTelegramMessage(order) {
    const orderDetails = order.order.map(item => `${item.title} - ${item.details} - ${item.price}`).join('\n');
    const message = `Новый заказ на суши:\n\nИмя: ${order.name}\nАдрес: ${order.address}\nТелефон: ${order.phone}\nДетали заказа:\n${orderDetails}`;
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
            console.log('Сообщение отправлено в Telegram:', response);
        });
    });

    req.on('error', (error) => {
        console.error('Ошибка при отправке сообщения в Telegram:', error);
    });

    req.write(data);
    req.end();
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/order', (req, res) => {
    const order = req.body;
    console.log('Получен заказ:', order);

    try {
        sendTelegramMessage(order);
        res.status(200).json({ message: 'Заказ получен и сообщение отправлено в Telegram' });
    } catch (error) {
        console.error('Ошибка при отправке заказа:', error);
        res.status(500).json({ message: 'Ошибка при отправке заказа' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});





 