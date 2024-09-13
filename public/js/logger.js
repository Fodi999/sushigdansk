 'use strict';

export function logMessage(message) {
    const logContainer = document.getElementById("log-messages");

    if (!logContainer) {
        console.error("Log container not found in the DOM.");
        return;
    }

    const messageElement = document.createElement("div");
    messageElement.className = "log-message";
    messageElement.textContent = message;
    logContainer.appendChild(messageElement);

    // Показать сообщение
    setTimeout(() => {
        messageElement.classList.add("show");
    }, 100); // Небольшая задержка для запуска анимации

    // Скрыть сообщение и удалить его
    setTimeout(() => {
        messageElement.classList.remove("show");
        setTimeout(() => {
            if (logContainer.contains(messageElement)) {
                logContainer.removeChild(messageElement);
            }
        }, 500); // Должно совпадать с временем transition
    }, 1000); // Уведомление будет отображаться 3 секунды
}
