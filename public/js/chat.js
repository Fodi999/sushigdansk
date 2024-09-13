'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Загрузка истории сообщений при подключении
    socket.on('chat history', function (messages) {
        messages.forEach(message => {
            addMessageToChat(message);
        });
    });

    // Слушаем событие добавления сообщений в чат
    socket.on('chat message', function (msg) {
        addMessageToChat(msg);
    });

    // Слушаем событие обновления лайков
    socket.on('like update', function ({ id, likes }) {
        const likeButton = document.querySelector(`.like-button[data-id="${id}"]`);
        if (likeButton) {
            likeButton.textContent = `👍 ${likes}`;
        }
    });

    // Функция для добавления сообщения в чат
    function addMessageToChat({ _id, text, imageUrl, likes }) {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card';

            if (text) {
                const messageText = document.createElement('div');
                messageText.className = 'message-text';
                messageText.textContent = text;
                messageCard.appendChild(messageText);
            }

            if (imageUrl) {
                const messageImage = document.createElement('img');
                messageImage.className = 'message-image';
                messageImage.src = imageUrl;
                messageCard.appendChild(messageImage);
            }

            const messageTimestamp = document.createElement('div');
            messageTimestamp.className = 'message-timestamp';
            messageTimestamp.textContent = new Date().toLocaleTimeString();
            messageCard.appendChild(messageTimestamp);

            const likeButton = document.createElement('button');
            likeButton.className = 'like-button';
            likeButton.textContent = `👍 ${likes || 0}`;
            likeButton.setAttribute('data-id', _id);
            likeButton.addEventListener('click', () => likeMessage(_id, likeButton));
            messageCard.appendChild(likeButton);

            chatMessages.appendChild(messageCard);
        } else {
            console.error("Элемент #chatMessages не найден на странице.");
        }
    }

    // Функция для обработки лайков
    async function likeMessage(messageId, likeButton) {
        try {
            const response = await fetch(`/api/messages/${messageId}/like`, { method: 'POST' });
            const data = await response.json();
            likeButton.textContent = `👍 ${data.likes}`;
        } catch (error) {
            console.error('Ошибка при отправке лайка:', error);
        }
    }
});
