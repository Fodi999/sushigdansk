'use strict';

// js/cards.js
export const cardsDataRow1 = [
    { title: "Najlepszy zestaw Filadelfii", details: "930 грамов, 32 sztuki", price: "240 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw California", details: "800 грамов, 28 sztуки", price: "220 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Tokio", details: "850 грамов, 30 sztуки", price: "230 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Osaka", details: "900 грамов, 34 sztуки", price: "250 zł", image: "images/Rectangle-22.webp" },
    { title: "Zestaw Kyoto", details: "780 грамов, 26 sztуки", price: "210 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Sapporo", details: "920 грамов, 36 sztуки", price: "260 zł", image: "images/Rectangle-3.webp" }
];

export const cardsDataRow2 = [
    { title: "Zestaw Nigiri", details: "700 грамов, 20 sztуки", price: "200 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Maki", details: "750 грамов, 24 sztуки", price: "215 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Ebi", details: "800 грамов, 28 sztуки", price: "225 zł", image: "images/Rectangle-22.webp" },
    { title: "Zestaw Kani", details: "820 грамов, 29 sztуки", price: "235 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Unagi", details: "870 грамов, 32 sztуки", price: "245 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Ikura", details: "900 грамов, 33 sztуки", price: "255 zł", image: "images/Rectangle-3.webp" }
];

export const cardsDataRow3 = [
    { title: "Set A", details: "600 грамов, 20 sztuki", price: "180 zł", image: "images/Rectangle-3.webp" },
    { title: "Set B", details: "700 грамов, 25 sztуки", price: "200 zł", image: "images/Rectangle-3.webp" },
    { title: "Set C", details: "800 грамов, 30 sztуки", price: "220 zł", image: "images/Rectangle-3.webp" },
    { title: "Set D", details: "900 грамов, 35 sztуки", price: "240 zł", image: "images/Rectangle-22.webp" },
    { title: "Set E", details: "1000 грамов, 40 sztуки", price: "260 zł", image: "images/Rectangle-3.webp" },
    { title: "Set F", details: "1100 грамов, 45 sztуки", price: "280 zł", image: "images/Rectangle-3.webp" }
];

export const cardsDataRow4 = [
    { title: "Snack A", details: "300 грамов, 10 sztuki", price: "100 zł", image: "images/Rectangle-3.webp" },
    { title: "Snack B", details: "350 грамов, 12 sztуки", price: "120 zł", image: "images/Rectangle-3.webp" },
    { title: "Snack C", details: "400 грамов, 15 sztуки", price: "140 zł", image: "images/Rectangle-3.webp" },
    { title: "Snack D", details: "450 грамов, 18 sztуки", price: "160 zł", image: "images/Rectangle-22.webp" },
    { title: "Snack E", details: "500 грамов, 20 sztуки", price: "180 zł", image: "images/Rectangle-3.webp" },
    { title: "Snack F", details: "550 грамов, 22 sztуки", price: "200 zł", image: "images/Rectangle-3.webp" }
];

// Функция для создания карты, всегда возвращающая одинаковую структуру (мономорфизм)
export function createCard(card, addItemToCart) {
    const cardElement = document.createElement("div");
    cardElement.className = "sushi-card";

    // Создаем и добавляем изображение
    const imageElement = createImageElement(card);
    cardElement.appendChild(imageElement);

    // Создаем и добавляем заголовок
    const titleElement = createTitleElement(card);
    cardElement.appendChild(titleElement);

    // Создаем и добавляем описание
    const detailsElement = createDetailsElement(card);
    cardElement.appendChild(detailsElement);

    // Создаем секцию цены и управления количеством
    const priceSection = createPriceSection(card, addItemToCart);
    cardElement.appendChild(priceSection);

    return cardElement;
}

// Вспомогательная функция для создания изображения
function createImageElement(card) {
    const imageElement = document.createElement("img");
    imageElement.src = card.image;
    imageElement.alt = card.title;
    imageElement.className = "sushi-image";
    return imageElement;
}

// Вспомогательная функция для создания заголовка
function createTitleElement(card) {
    const titleElement = document.createElement("h2");
    titleElement.className = "sushi-title";
    titleElement.textContent = card.title;
    return titleElement;
}

// Вспомогательная функция для создания описания
function createDetailsElement(card) {
    const detailsElement = document.createElement("p");
    detailsElement.className = "sushi-details";
    detailsElement.textContent = card.details;
    return detailsElement;
}

// Вспомогательная функция для создания секции цены и количества
function createPriceSection(card, addItemToCart) {
    const priceSection = document.createElement("div");
    priceSection.className = "price-section";

    const priceElement = document.createElement("span");
    priceElement.className = "price";
    priceElement.textContent = card.price;

    const quantitySection = createQuantitySection();
    const buttonElement = createOrderButton(card, quantitySection, addItemToCart);

    priceSection.appendChild(priceElement);
    priceSection.appendChild(quantitySection);
    priceSection.appendChild(buttonElement);

    return priceSection;
}

// Вспомогательная функция для создания секции количества
function createQuantitySection() {
    const quantitySection = document.createElement("div");
    quantitySection.className = "quantity-section";

    const decreaseButton = document.createElement("button");
    decreaseButton.className = "quantity-button";
    decreaseButton.innerHTML = '<ion-icon name="remove-circle-outline"></ion-icon>';

    const quantityInput = document.createElement("input");
    quantityInput.min = 1;
    quantityInput.value = 1;
    quantityInput.className = "quantity-input";

    const increaseButton = document.createElement("button");
    increaseButton.className = "quantity-button";
    increaseButton.innerHTML = '<ion-icon name="add-circle-outline"></ion-icon>';

    decreaseButton.addEventListener("click", () => {
        if (quantityInput.value > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
        }
    });

    increaseButton.addEventListener("click", () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
    });

    quantitySection.appendChild(decreaseButton);
    quantitySection.appendChild(quantityInput);
    quantitySection.appendChild(increaseButton);

    return quantitySection;
}

// Вспомогательная функция для создания кнопки заказа
function createOrderButton(card, quantitySection, addItemToCart) {
    const buttonElement = document.createElement("button");
    buttonElement.className = "order-button";
    buttonElement.textContent = "Chcieć";

    buttonElement.addEventListener("click", () => {
        const quantityInput = quantitySection.querySelector(".quantity-input");
        const itemWithQuantity = {
            ...card,
            quantity: parseInt(quantityInput.value)
        };
        addItemToCart(itemWithQuantity);
    });

    return buttonElement;
}
 