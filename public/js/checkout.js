'use strict';

import { logMessage } from './logger.js';
import { clearCart, getCartItems } from './cart.js';

export function setupCheckoutForm() {
    const checkoutForm = document.getElementById("checkout-form");

    if (!checkoutForm) {
        console.error("Checkout form not found");
        return;
    }

    checkoutForm.addEventListener("submit", handleSubmit);
}

/**
 * Обработчик отправки формы
 * @param {Event} event - Событие отправки формы
 */
function handleSubmit(event) {
    event.preventDefault();

    const order = collectOrderData();
    if (!order) {
        logMessage("Ошибка: не удалось собрать данные заказа.");
        return;
    }

    fetchCartItems()
        .then(cartItems => sendOrder({ ...order, items: cartItems }))
        .then(handleOrderSuccess)
        .catch(handleOrderError);
}

/**
 * Сбор данных заказа из формы
 * @returns {object|null} - Объект с данными заказа или null, если данные не собраны
 */
function collectOrderData() {
    const name = getInputValue("name");
    const address = getInputValue("address");
    const phone = getInputValue("phone");
    const additionalInfo = getInputValue("additionalInfo");

    if (!name || !address || !phone) {
        logMessage("Ошибка: все поля должны быть заполнены.");
        return null;
    }

    return { name, address, phone, additionalInfo };
}

/**
 * Получает значение поля ввода по ID
 * @param {string} id - ID элемента
 * @returns {string} - Значение элемента ввода
 */
function getInputValue(id) {
    const input = document.getElementById(id);
    return input ? input.value.trim() : '';
}

/**
 * Получение элементов корзины через fetch
 * @returns {Promise<Array>} - Промис с массивом элементов корзины
 */
function fetchCartItems() {
    return fetch("/api/cart/items")
        .then(validateResponse)
        .then(response => response.json());
}

/**
 * Отправка заказа на сервер
 * @param {object} order - Объект с данными заказа
 * @returns {Promise<Response>} - Промис с результатом отправки заказа
 */
function sendOrder(order) {
    return fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
    }).then(validateResponse);
}

/**
 * Валидация ответа сервера
 * @param {Response} response - Ответ сервера
 * @returns {Response|Promise<Error>} - Возвращает ответ или генерирует ошибку
 */
function validateResponse(response) {
    if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
    }
    return response;
}

/**
 * Обработка успешной отправки заказа
 * @param {Response} response - Ответ от сервера
 */
function handleOrderSuccess(response) {
    return response.json().then(data => {
        logMessage(`Заказ отправлен: ${data.message}`);
        document.getElementById("checkout-modal").style.display = "none";
        clearCart();
    });
}

/**
 * Обработка ошибок при отправке заказа
 * @param {Error} error - Объект ошибки
 */
function handleOrderError(error) {
    logMessage(`Ошибка при отправке заказа: ${error.message}`);
    console.error("Error:", error);
}
 