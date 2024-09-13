'use strict';

import { cardsDataRow1, cardsDataRow2, cardsDataRow3, cardsDataRow4, createCard } from './cards.js';
import { addItemToCart, getCartItems } from './cart.js';
import { setupCheckoutForm } from './checkout.js';
import { setupNavigation } from './navigation.js';
import './chat.js'; // Подключаем функционал чата

document.addEventListener("DOMContentLoaded", function() {
    const cardContainerRow1 = document.getElementById("card-container-row-1");
    const cardContainerRow2 = document.getElementById("card-container-row-2");
    const cardContainerRow3 = document.getElementById("card-container-row-3");
    const cardContainerRow4 = document.getElementById("card-container-row-4");

    if (!cardContainerRow1 || !cardContainerRow2 || !cardContainerRow3 || !cardContainerRow4) {
        console.error("Не удалось найти контейнеры для карточек.");
        return;
    }

    cardsDataRow1.forEach(card => {
        const cardElement = createCard(card, addItemToCart);
        cardContainerRow1.appendChild(cardElement);
    });

    cardsDataRow2.forEach(card => {
        const cardElement = createCard(card, addItemToCart);
        cardContainerRow2.appendChild(cardElement);
    });

    cardsDataRow3.forEach(card => {
        const cardElement = createCard(card, addItemToCart);
        cardContainerRow3.appendChild(cardElement);
    });

    cardsDataRow4.forEach(card => {
        const cardElement = createCard(card, addItemToCart);
        cardContainerRow4.appendChild(cardElement);
    });

    const cartButton = document.getElementById("cart-button");
    const closeModalButton = document.getElementById("close-modal");
    const checkoutButton = document.getElementById("checkout-button");
    const closeCheckoutModalButton = document.getElementById("close-checkout-modal");

    if (!cartButton || !closeModalButton || !checkoutButton || !closeCheckoutModalButton) {
        console.error("Не удалось найти элементы управления корзиной и оформлением заказа.");
        return;
    }

    cartButton.addEventListener("click", function() {
        getCartItems();
        document.getElementById("cart-modal").style.display = "flex";
    });

    closeModalButton.addEventListener("click", function() {
        document.getElementById("cart-modal").style.display = "none";
    });

    checkoutButton.addEventListener("click", function() {
        document.getElementById("cart-modal").style.display = "none";
        document.getElementById("checkout-modal").style.display = "flex";
    });

    closeCheckoutModalButton.addEventListener("click", function() {
        document.getElementById("checkout-modal").style.display = "none";
    });

    setupCheckoutForm();
    setupNavigation();

    const deliveryButton = document.getElementById("delivery-button");
    const closeDeliveryModalButton = document.getElementById("close-delivery-modal");

    if (deliveryButton && closeDeliveryModalButton) {
        deliveryButton.addEventListener("click", function() {
            document.getElementById("delivery-modal").style.display = "flex";
            initializeMap();
        });

        closeDeliveryModalButton.addEventListener("click", function() {
            document.getElementById("delivery-modal").style.display = "none";
        });
    }

    const chatLink = document.querySelector("li.list:nth-child(5) a");
    const closeChatModalButton = document.getElementById("close-chat-modal");

    if (chatLink && closeChatModalButton) {
        chatLink.addEventListener("click", function() {
            document.getElementById("chat-modal").style.display = "flex";
        });

        closeChatModalButton.addEventListener("click", function() {
            document.getElementById("chat-modal").style.display = "none";
        });
    }

    let map;

    function initializeMap() {
        if (map) {
            map.remove();
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                console.log(`User location: ${userLat}, ${userLng}`);

                map = L.map('delivery-map').setView([userLat, userLng], 12);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                L.marker([userLat, userLng]).addTo(map)
                    .bindPopup('Вы здесь.')
                    .openPopup();

                const restaurantCoords = [54.3521, 18.6466];
                L.marker(restaurantCoords).addTo(map)
                    .bindPopup('Ресторан')
                    .openPopup();

                calculateDeliveryTime(userLat, userLng, restaurantCoords);
            }, function(error) {
                console.error('Error occurred. Error code: ' + error.code);
                handleLocationError();
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
            handleLocationError();
        }
    }

    function handleLocationError() {
        if (map) {
            map.remove();
        }

        const defaultLat = 54.3521;
        const defaultLng = 18.6466;
        map = L.map('delivery-map').setView([defaultLat, defaultLng], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([defaultLat, defaultLng]).addTo(map)
            .bindPopup('Ваш заказ будет доставлен сюда.')
            .openPopup();
    }

    function calculateDeliveryTime(userLat, userLng, restaurantCoords) {
        const R = 6371;
        const dLat = (restaurantCoords[0] - userLat) * Math.PI / 180;
        const dLng = (restaurantCoords[1] - userLng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLat * Math.PI / 180) * Math.cos(restaurantCoords[0] * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        const averageSpeed = 50;
        const deliveryTimeHours = distance / averageSpeed;
        const deliveryTimeMinutes = deliveryTimeHours * 60;

        console.log(`Время доставки: ${deliveryTimeMinutes.toFixed(2)} минут`);
    }
});
