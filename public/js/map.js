'use strict';

let map;

export async function initializeMap() {
    if (map) {
        map.remove();
    }

    try {
        const position = await getCurrentPosition();
        setupMapWithLocation(position);
    } catch (error) {
        console.error("Error getting location:", error);
        handleLocationError();
    }
}

async function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}

function setupMapWithLocation(position) {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    console.log(`User location: ${userLat}, ${userLng}`);

    map = L.map('delivery-map').setView([userLat, userLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([userLat, userLng]).addTo(map).bindPopup('Вы здесь.').openPopup();

    const restaurantCoords = [54.3521, 18.6466];
    L.marker(restaurantCoords).addTo(map).bindPopup('Ресторан').openPopup();

    calculateDeliveryTime(userLat, userLng, restaurantCoords);
}

function handleLocationError() {
    const defaultLat = 54.3521;
    const defaultLng = 18.6466;

    map = L.map('delivery-map').setView([defaultLat, defaultLng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([defaultLat, defaultLng]).addTo(map).bindPopup('Ваш заказ будет доставлен сюда.').openPopup();
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
    const deliveryTimeMinutes = (distance / averageSpeed) * 60;

    console.log(`Время доставки: ${deliveryTimeMinutes.toFixed(2)} минут`);
}
 