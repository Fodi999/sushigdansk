'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Загрузка истории сообщений при подключении
    socket.on('chat history', function (messages) {
        if (Array.isArray(messages)) {
            messages.forEach(addMessageToChat);
        }
    });

    // Слушаем событие добавления новых сообщений в чат
    socket.on('chat message', function (msg) {
        addMessageToChat(msg);
    });

    // Слушаем событие обновления лайков
    socket.on('like update', function ({ id, likes }) {
        updateLikeButton(id, likes);
    });

    /**
     * Функция для добавления сообщения в чат
     * @param {object} message - Сообщение, включающее текст, изображение, лайки и ID
     */
    function addMessageToChat({ _id, text, imageUrl, likes }) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) {
            console.error("Элемент #chatMessages не найден на странице.");
            return;
        }

        const messageCard = createMessageCard(_id, text, imageUrl, likes);
        chatMessages.appendChild(messageCard);

        // Автоматический скролл вниз при добавлении нового сообщения
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Функция для создания карточки сообщения
     * @param {string} id - ID сообщения
     * @param {string} text - Текст сообщения
     * @param {string} imageUrl - Ссылка на изображение
     * @param {number} likes - Количество лайков
     * @returns {HTMLElement} - Карточка сообщения
     */
    function createMessageCard(id, text, imageUrl, likes) {
        const messageCard = document.createElement('div');
        messageCard.className = 'message-card';

        // Добавляем текст сообщения, если он существует
        if (text) {
            const messageText = createMessageText(text);
            messageCard.appendChild(messageText);
        }

        // Добавляем изображение сообщения, если оно существует
        if (imageUrl) {
            const messageImage = createMessageImage(imageUrl);
            messageCard.appendChild(messageImage);
        }

        // Добавляем время отправки сообщения
        const messageTimestamp = createMessageTimestamp();
        messageCard.appendChild(messageTimestamp);

        // Добавляем кнопку лайка
        const likeButton = createLikeButton(id, likes);
        messageCard.appendChild(likeButton);

        return messageCard;
    }

    /**
     * Создает элемент с текстом сообщения
     * @param {string} text - Текст сообщения
     * @returns {HTMLElement} - Элемент с текстом
     */
    function createMessageText(text) {
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        return messageText;
    }

    /**
     * Создает элемент с изображением сообщения
     * @param {string} imageUrl - Ссылка на изображение
     * @returns {HTMLElement} - Элемент изображения
     */
    function createMessageImage(imageUrl) {
        const messageImage = document.createElement('img');
        messageImage.className = 'message-image';
        messageImage.src = imageUrl;
        messageImage.alt = "Image";
        return messageImage;
    }

    /**
     * Создает элемент с текущим временем
     * @returns {HTMLElement} - Элемент с временем
     */
    function createMessageTimestamp() {
        const messageTimestamp = document.createElement('div');
        messageTimestamp.className = 'message-timestamp';
        messageTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return messageTimestamp;
    }

    /**
     * Создает кнопку лайка
     * @param {string} id - ID сообщения
     * @param {number} likes - Количество лайков
     * @returns {HTMLElement} - Кнопка лайка
     */
    function createLikeButton(id, likes = 0) {
        const likeButton = document.createElement('button');
        likeButton.className = 'like-button';
        likeButton.textContent = `👍 ${likes}`;
        likeButton.setAttribute('data-id', id);
        likeButton.addEventListener('click', () => likeMessage(id, likeButton));
        return likeButton;
    }

    /**
     * Обновляет кнопку лайка для сообщения
     * @param {string} id - ID сообщения
     * @param {number} likes - Новое количество лайков
     */
    function updateLikeButton(id, likes) {
        const likeButton = document.querySelector(`.like-button[data-id="${id}"]`);
        if (likeButton) {
            likeButton.textContent = `👍 ${likes}`;
        }
    }

    /**
     * Обрабатывает отправку лайка для сообщения
     * @param {string} messageId - ID сообщения
     * @param {HTMLElement} likeButton - Кнопка лайка
     */
    async function likeMessage(messageId, likeButton) {
        try {
            const response = await fetch(`/api/messages/${messageId}/like`, { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                likeButton.textContent = `👍 ${data.likes}`;
            } else {
                console.error('Ошибка сервера при обработке лайка');
            }
        } catch (error) {
            console.error('Ошибка при отправке лайка:', error);
        }
    }
});

