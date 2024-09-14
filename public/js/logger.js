'use strict';

// Функция для создания элементов сообщения
function createLogMessageElement(message) {
    const messageElement = document.createElement("div");
    messageElement.className = "log-message";
    messageElement.textContent = message;
    return messageElement;
}

// Инициализация лог контейнера, выполняем один раз
let logContainer;

// Максимальное количество логов
const MAX_LOGS = 10;

// Функция для инициализации лог контейнера
export function initializeLogContainer() {
    logContainer = document.getElementById("log-messages");

    if (!logContainer) {
        console.error("Log container not found in the DOM.");
        return false;
    }
    return true;
}

// Функция для ограничения количества сообщений в логах
function limitLogMessages() {
    const logMessages = logContainer.getElementsByClassName('log-message');
    if (logMessages.length >= MAX_LOGS) {
        logContainer.removeChild(logMessages[0]); // Удаляем старейшее сообщение
    }
}

// Мономорфная функция для логирования сообщений
export function logMessage(message) {
    if (!logContainer) {
        console.error("Log container not initialized.");
        return;
    }

    // Ограничиваем количество логов
    limitLogMessages();

    // Создаем и добавляем новое сообщение в контейнер
    const messageElement = createLogMessageElement(message);
    logContainer.appendChild(messageElement);

    // Показать сообщение через небольшую задержку
    setTimeout(() => {
        messageElement.classList.add("show");
    }, 100);

    // Скрыть сообщение через 3 секунды и удалить его
    setTimeout(() => {
        messageElement.classList.remove("show");

        // Удалить элемент через 500 мс после скрытия (анимация скрытия)
        setTimeout(() => {
            if (logContainer.contains(messageElement)) {
                logContainer.removeChild(messageElement);
            }
        }, 500);
    }, 3000); // Сообщение будет отображаться 3 секунды
}

// Пример использования, который должен вызываться после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    if (initializeLogContainer()) {
        logMessage('Лог контейнер успешно инициализирован.');
    } else {
        console.error('Ошибка инициализации лог контейнера.');
    }
});

 