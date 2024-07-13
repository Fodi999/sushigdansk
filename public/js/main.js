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
    });

    document.getElementById("close-delivery-modal").addEventListener("click", function() {
        document.getElementById("delivery-modal").style.display = "none";
    });
});

