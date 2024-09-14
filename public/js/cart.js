'use strict';

import { logMessage } from './logger.js';

// Мономорфная функция для добавления товара в корзину
export function addItemToCart(item) {
    sendPostRequest("/api/cart/add", item)
        .then(() => {
            logMessage("Товар добавлен в корзину!");
            getCartItems(); // Обновление списка элементов корзины
        })
        .catch(error => {
            handleError("Ошибка при добавлении товара в корзину", error);
        });
}

// Мономорфная функция для получения списка товаров в корзине
export function getCartItems() {
    console.log("Fetching cart items...");

    fetch("/api/cart/items")
        .then(response => validateResponse(response))
        .then(cartItems => renderCartItems(cartItems))
        .catch(error => {
            handleError("Ошибка получения элементов корзины", error);
        });
}

// Мономорфная функция для удаления товара из корзины
export function removeItemFromCart(itemId) {
    sendDeleteRequest(`/api/cart/items/${itemId}`)
        .then(() => {
            logMessage("Товар удален из корзины.");
            getCartItems(); // Обновление списка элементов корзины
        })
        .catch(error => {
            handleError("Ошибка при удалении товара из корзины", error);
        });
}

// Мономорфная функция для очистки корзины
export function clearCart() {
    sendPostRequest("/api/cart/clear")
        .then(() => {
            logMessage("Корзина очищена!");
            getCartItems(); // Обновление списка элементов корзины
        })
        .catch(error => {
            handleError("Ошибка при очистке корзины", error);
        });
}

/**
 * Вспомогательная функция для отправки POST запроса
 * @param {string} url 
 * @param {object} data 
 * @returns {Promise}
 */
function sendPostRequest(url, data = {}) {
    return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(response => validateResponse(response));
}

/**
 * Вспомогательная функция для отправки DELETE запроса
 * @param {string} url 
 * @returns {Promise}
 */
function sendDeleteRequest(url) {
    return fetch(url, { method: "DELETE" })
        .then(response => validateResponse(response));
}

/**
 * Вспомогательная функция для валидации ответа от сервера
 * @param {Response} response 
 * @returns {Promise}
 */
function validateResponse(response) {
    if (!response.ok) {
        return Promise.reject(new Error(`Ошибка сервера: ${response.status}`));
    }
    return response.json();
}

/**
 * Вспомогательная функция для рендеринга товаров в корзине
 * @param {Array} cartItems 
 */
function renderCartItems(cartItems) {
    console.log("Cart items received:", cartItems);

    const cartItemsContainer = document.getElementById("cart-items");
    if (!cartItemsContainer) {
        console.error("Cart items container not found in the DOM.");
        return;
    }

    cartItemsContainer.innerHTML = ""; // Очистка контейнера

    cartItems.forEach(item => {
        console.log(`Rendering item: ${item.title} (ID: ${item._id})`);

        const itemElement = createCartItemElement(item);
        cartItemsContainer.appendChild(itemElement);
    });
}

/**
 * Вспомогательная функция для создания элемента товара корзины
 * @param {object} item 
 * @returns {HTMLElement}
 */
function createCartItemElement(item) {
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";

    const removeButton = createRemoveButton(item._id);
    const itemImage = createItemImage(item.image, item.title);
    const itemDetailsContainer = createItemDetailsContainer(item);

    itemElement.appendChild(removeButton);
    itemElement.appendChild(itemImage);
    itemElement.appendChild(itemDetailsContainer);

    return itemElement;
}

/**
 * Вспомогательная функция для создания кнопки удаления товара
 * @param {string} itemId 
 * @returns {HTMLElement}
 */
function createRemoveButton(itemId) {
    const removeButton = document.createElement("button");
    removeButton.className = "remove-button";
    removeButton.innerHTML = "&times;";
    removeButton.addEventListener("click", () => {
        removeItemFromCart(itemId);
    });
    return removeButton;
}

/**
 * Вспомогательная функция для создания изображения товара
 * @param {string} src 
 * @param {string} alt 
 * @returns {HTMLElement}
 */
function createItemImage(src, alt) {
    const itemImage = document.createElement("img");
    itemImage.src = src;
    itemImage.alt = alt;
    return itemImage;
}

/**
 * Вспомогательная функция для создания контейнера с деталями товара
 * @param {object} item 
 * @returns {HTMLElement}
 */
function createItemDetailsContainer(item) {
    const itemDetailsContainer = document.createElement("div");
    itemDetailsContainer.className = "item-details";

    const itemTitle = document.createElement("h3");
    itemTitle.textContent = item.title;

    const itemDetails = document.createElement("p");
    itemDetails.textContent = item.details;

    const itemPrice = document.createElement("p");
    itemPrice.textContent = item.price;

    const itemQuantity = document.createElement("p");
    itemQuantity.className = "item-quantity";
    itemQuantity.textContent = `Количество: ${item.quantity}`;

    itemDetailsContainer.appendChild(itemTitle);
    itemDetailsContainer.appendChild(itemDetails);
    itemDetailsContainer.appendChild(itemPrice);
    itemDetailsContainer.appendChild(itemQuantity);

    return itemDetailsContainer;
}

/**
 * Вспомогательная функция для обработки ошибок
 * @param {string} message 
 * @param {Error} error 
 */
function handleError(message, error) {
    logMessage(`${message}: ${error.message}`);
    console.error(message, error);
}

