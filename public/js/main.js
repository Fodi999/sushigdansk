'use strict';

import { cardsDataRow1, cardsDataRow2, cardsDataRow3, cardsDataRow4, createCard } from './cards.js';
import { addItemToCart, getCartItems } from './cart.js';
import { setupCheckoutForm } from './checkout.js';
import { setupNavigation } from './navigation.js';
import { initializeMap } from './map.js';
import './chat.js'; // Подключаем функционал чата

document.addEventListener("DOMContentLoaded", () => {
    initializeCards();
    setupCartAndCheckout();
    setupDelivery();
    setupChat();
});

function initializeCards() {
    const cardContainers = [
        { container: document.getElementById("card-container-row-1"), data: cardsDataRow1 },
        { container: document.getElementById("card-container-row-2"), data: cardsDataRow2 },
        { container: document.getElementById("card-container-row-3"), data: cardsDataRow3 },
        { container: document.getElementById("card-container-row-4"), data: cardsDataRow4 }
    ];

    cardContainers.forEach(({ container, data }) => {
        if (!container) {
            console.error("Не удалось найти контейнер для карточек.");
            return;
        }

        data.forEach(card => {
            const cardElement = createCard(card, addItemToCart);
            container.appendChild(cardElement);
        });
    });
}

function setupCartAndCheckout() {
    const cartButton = document.getElementById("cart-button");
    const checkoutButton = document.getElementById("checkout-button");

    if (!cartButton || !checkoutButton) {
        console.error("Не удалось найти элементы управления корзиной и оформлением заказа.");
        return;
    }

    cartButton.addEventListener("click", showCart);
    checkoutButton.addEventListener("click", showCheckout);

    setupCheckoutForm();
    setupNavigation();
}

function showCart() {
    getCartItems();
    document.getElementById("cart-modal").style.display = "flex";
}

function showCheckout() {
    document.getElementById("cart-modal").style.display = "none";
    document.getElementById("checkout-modal").style.display = "flex";
}

function setupDelivery() {
    const deliveryButton = document.getElementById("delivery-button");

    if (deliveryButton) {
        deliveryButton.addEventListener("click", openDeliveryModal);
    }
}

function openDeliveryModal() {
    document.getElementById("delivery-modal").style.display = "flex";
    initializeMap();
}

function setupChat() {
    const chatLink = document.querySelector("li.list:nth-child(5) a");

    if (chatLink) {
        chatLink.addEventListener("click", () => {
            document.getElementById("chat-modal").style.display = "flex";
        });
    }
}


