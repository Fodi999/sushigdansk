import { logMessage } from './logger.js';

export function addItemToCart(item) {
    fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
    })
    .then(response => {
        if (response.ok) {
            logMessage("Товар добавлен в корзину!");
        } else {
            logMessage("Ошибка при добавлении товара в корзину.");
        }
    })
    .catch(error => {
        logMessage(`Ошибка при добавлении товара в корзину: ${error}`);
        console.error("Error:", error);
    });
}

export function getCartItems() {
    fetch("/api/cart/items")
        .then(response => response.json())
        .then(cartItems => {
            const cartItemsContainer = document.getElementById("cart-items");
            cartItemsContainer.innerHTML = "";
            cartItems.forEach((item, index) => {
                const itemElement = document.createElement("div");
                itemElement.className = "cart-item";

                const removeButton = document.createElement("button");
                removeButton.className = "remove-button";
                removeButton.innerHTML = "&times;"; // Крестик для удаления
                removeButton.addEventListener("click", function() {
                    removeItemFromCart(index);
                });

                const itemImage = document.createElement("img");
                itemImage.src = item.image;
                itemImage.alt = item.title;

                const itemDetailsContainer = document.createElement("div");
                itemDetailsContainer.className = "item-details";

                const itemTitle = document.createElement("h3");
                itemTitle.textContent = item.title;

                const itemDetails = document.createElement("p");
                itemDetails.textContent = item.details;

                const itemPrice = document.createElement("p");
                itemPrice.textContent = item.price;

                const itemQuantity = document.createElement("p");
                itemQuantity.className = "item-quantity"; // Добавлен класс для выделения количества
                itemQuantity.textContent = `Количество: ${item.quantity}`;

                itemDetailsContainer.appendChild(itemTitle);
                itemDetailsContainer.appendChild(itemDetails);
                itemDetailsContainer.appendChild(itemPrice);
                itemDetailsContainer.appendChild(itemQuantity);

                itemElement.appendChild(removeButton);
                itemElement.appendChild(itemImage);
                itemElement.appendChild(itemDetailsContainer);

                cartItemsContainer.appendChild(itemElement);
            });
        })
        .catch(error => {
            logMessage(`Ошибка получения элементов корзины: ${error}`);
            console.error("Error:", error);
        });
}

export function removeItemFromCart(index) {
    fetch(`/api/cart/items/${index}`, {
        method: "DELETE"
    })
    .then(response => {
        if (response.ok) {
            getCartItems();
            logMessage("Товар удален из корзины.");
        } else {
            logMessage("Ошибка при удалении товара из корзины.");
        }
    })
    .catch(error => {
        logMessage(`Ошибка при удалении товара из корзины: ${error}`);
        console.error("Error:", error);
    });
}

export function clearCart() {
    fetch("/api/cart/clear", {
        method: "POST"
    })
    .then(response => {
        if (response.ok) {
            logMessage("Корзина очищена!");
        } else {
            logMessage("Ошибка при очистке корзины.");
        }
    })
    .catch(error => {
        logMessage(`Ошибка при очистке корзины: ${error}`);
        console.error("Error:", error);
    });
}

