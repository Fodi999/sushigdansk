import { cardsData, createCard } from './cards.js';
import { addItemToCart, getCartItems } from './cart.js';
import { setupCheckoutForm } from './checkout.js';
import { setupNavigation } from './navigation.js';

document.addEventListener("DOMContentLoaded", function() {
    const cardContainer = document.getElementById("card-container");

    cardsData.forEach(card => {
        const cardElement = createCard(card, addItemToCart);
        cardContainer.appendChild(cardElement);
    });

    document.getElementById("cart-button").addEventListener("click", function() {
        getCartItems();
        document.getElementById("cart-modal").style.display = "flex";
    });

    document.getElementById("close-modal").addEventListener("click", function() {
        document.getElementById("cart-modal").style.display = "none";
    });

    document.getElementById("checkout-button").addEventListener("click", function() {
        document.getElementById("cart-modal").style.display = "none";
        document.getElementById("checkout-modal").style.display = "flex";
    });

    document.getElementById("close-checkout-modal").addEventListener("click", function() {
        document.getElementById("checkout-modal").style.display = "none";
    });

    setupCheckoutForm();
    setupNavigation(); // Инициализация навигации

    // Добавляем обработчик для кнопки "Доставка"
    document.getElementById("delivery-button").addEventListener("click", function() {
        document.getElementById("delivery-modal").style.display = "flex";
        initializeMap(); // Инициализация карты при открытии модального окна
    });

    document.getElementById("close-delivery-modal").addEventListener("click", function() {
        document.getElementById("delivery-modal").style.display = "none";
    });

    function initializeMap() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const map = L.map('delivery-map').setView([userLat, userLng], 12);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                L.marker([userLat, userLng]).addTo(map)
                    .bindPopup('Вы здесь.')
                    .openPopup();

                // Координаты ресторана
                const restaurantCoords = [54.3521, 18.6466]; // Гданьск

                // Добавляем маркер ресторана
                L.marker(restaurantCoords).addTo(map)
                    .bindPopup('Ресторан')
                    .openPopup();

                // Рассчитываем и выводим время доставки
                calculateDeliveryTime(userLat, userLng, restaurantCoords);
            }, function() {
                // Если пользователь не дал разрешение на геолокацию или произошла ошибка
                handleLocationError();
            });
        } else {
            // Браузер не поддерживает геолокацию
            handleLocationError();
        }
    }

    function handleLocationError() {
        const defaultLat = 54.3521; // Широта Гданьска
        const defaultLng = 18.6466; // Долгота Гданьска
        const map = L.map('delivery-map').setView([defaultLat, defaultLng], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([defaultLat, defaultLng]).addTo(map)
            .bindPopup('Ваш заказ будет доставлен сюда.')
            .openPopup();
    }

    function calculateDeliveryTime(userLat, userLng, restaurantCoords) {
        const R = 6371; // Радиус Земли в километрах
        const dLat = (restaurantCoords[0] - userLat) * Math.PI / 180;
        const dLng = (restaurantCoords[1] - userLng) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(userLat * Math.PI / 180) * Math.cos(restaurantCoords[0] * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Расстояние в километрах

        // Предположим средняя скорость доставки 50 км/ч
        const averageSpeed = 50;
        const deliveryTime = distance / averageSpeed;

        // Вывод времени доставки
        console.log(`Время доставки: ${deliveryTime.toFixed(2)} часов`);
    }
});












