import { logMessage } from './logger.js';

export function addItemToCart(item) {
    // Убираем ручное добавление id, MongoDB сделает это автоматически
    fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
    })
    .then(response => {
        if (response.ok) {
            logMessage("Товар добавлен в корзину!");
            getCartItems(); // Обновление списка элементов корзины после добавления
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
    console.log("Fetching cart items..."); // Лог начала запроса
    fetch("/api/cart/items")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`); // Лог ошибки сервера
            }
            return response.json();
        })
        .then(cartItems => {
            console.log("Cart items received:", cartItems); // Лог полученных данных
            const cartItemsContainer = document.getElementById("cart-items");
            if (!cartItemsContainer) {
                console.error("Cart items container not found in the DOM."); // Лог, если контейнер не найден
                return;
            }
            cartItemsContainer.innerHTML = ""; // Очистка контейнера

            cartItems.forEach(item => {
                console.log(`Rendering item: ${item.title} (ID: ${item._id})`); // Используем _id
                const itemElement = document.createElement("div");
                itemElement.className = "cart-item";

                const removeButton = document.createElement("button");
                removeButton.className = "remove-button";
                removeButton.innerHTML = "&times;"; // Крестик для удаления
                removeButton.addEventListener("click", function() {
                    console.log(`Remove button clicked for item ID: ${item._id}`); // Используем _id
                    removeItemFromCart(item._id); // Передаем _id для удаления
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
            logMessage(`Ошибка получения элементов корзины: ${error.message}`);
            console.error("Error fetching cart items:", error); // Лог ошибки запроса
        });
}

export function removeItemFromCart(itemId) {
    console.log(`Attempting to remove item with id: ${itemId}`); // Лог перед отправкой запроса

    fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE"
    })
    .then(response => {
        if (response.ok) {
            console.log(`Item with id: ${itemId} successfully removed.`); // Лог при успешном удалении
            getCartItems(); // Обновление списка элементов корзины после удаления
            logMessage("Товар удален из корзины.");
        } else {
            console.log(`Failed to remove item with id: ${itemId}. Server responded with status: ${response.status}`); // Лог в случае ошибки
            logMessage("Ошибка при удалении товара из корзины.");
        }
    })
    .catch(error => {
        console.error(`Ошибка при удалении товара с id: ${itemId}. Error: ${error}`); // Лог при возникновении исключения
        logMessage(`Ошибка при удалении товара из корзины: ${error}`);
    });
}

export function clearCart() {  // Теперь эта функция экспортируется
    fetch("/api/cart/clear", {
        method: "POST"
    })
    .then(response => {
        if (response.ok) {
            getCartItems(); // Обновление списка элементов корзины после очистки
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











