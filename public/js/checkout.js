'use strict';

import { logMessage } from './logger.js';
import { clearCart, getCartItems } from './cart.js';

export function setupCheckoutForm() {
    document.getElementById("checkout-form").addEventListener("submit", function(event) {
        event.preventDefault();
        const name = document.getElementById("name").value;
        const address = document.getElementById("address").value;
        const phone = document.getElementById("phone").value;
        const additionalInfo = document.getElementById("additionalInfo").value; // Сбор значения дополнительной информации

        fetch("/api/cart/items")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка получения корзины: ${response.status}`);
                }
                return response.json();
            })
            .then(cartItems => {
                const order = { name, address, phone, additionalInfo, items: cartItems }; // Добавляем additionalInfo в объект заказа
                return fetch("/api/order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(order)
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка при отправке заказа: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                logMessage(`Заказ отправлен: ${data.message}`);
                document.getElementById("checkout-modal").style.display = "none";
                clearCart();
            })
            .catch(error => {
                logMessage(`Ошибка при отправке заказа: ${error.message}`);
                console.error("Error:", error);
            });
    });
}