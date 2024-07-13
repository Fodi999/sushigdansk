export const cardsData = [
    { title: "Najlepszy zestaw Filadelfii", details: "930 грамов, 32 sztuki", price: "240 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw California", details: "800 грамов, 28 sztуки", price: "220 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Tokio", details: "850 грамов, 30 sztуки", price: "230 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Osaka", details: "900 грамов, 34 sztуки", price: "250 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Kyoto", details: "780 грамов, 26 sztуки", price: "210 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Sapporo", details: "920 грамов, 36 sztуки", price: "260 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Nigiri", details: "700 грамов, 20 sztуки", price: "200 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Maki", details: "750 грамов, 24 sztуки", price: "215 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Ebi", details: "800 грамов, 28 sztуки", price: "225 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Kani", details: "820 грамов, 29 sztуки", price: "235 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Unagi", details: "870 грамов, 32 sztуки", price: "245 zł", image: "images/Rectangle-3.webp" },
    { title: "Zestaw Ikura", details: "900 грамов, 33 sztуки", price: "255 zł", image: "images/Rectangle-3.webp" }
];

export function createCard(card, addItemToCart) {
    const cardElement = document.createElement("div");
    cardElement.className = "sushi-card";

    const imageElement = document.createElement("img");
    imageElement.src = card.image;
    imageElement.alt = card.title;
    imageElement.className = "sushi-image";

    const titleElement = document.createElement("h2");
    titleElement.className = "sushi-title";
    titleElement.textContent = card.title;

    const detailsElement = document.createElement("p");
    detailsElement.className = "sushi-details";
    detailsElement.textContent = card.details;

    const priceSection = document.createElement("div");
    priceSection.className = "price-section";

    const priceElement = document.createElement("span");
    priceElement.className = "price";
    priceElement.textContent = card.price;

    const quantitySection = document.createElement("div");
    quantitySection.className = "quantity-section";

    const decreaseButton = document.createElement("button");
    decreaseButton.className = "quantity-button";
    decreaseButton.innerHTML = '<ion-icon name="remove-circle-outline"></ion-icon>';
    decreaseButton.addEventListener("click", function() {
        if (quantityInput.value > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
        }
    });

    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.min = 1;
    quantityInput.value = 1;
    quantityInput.className = "quantity-input";

    const increaseButton = document.createElement("button");
    increaseButton.className = "quantity-button";
    increaseButton.innerHTML = '<ion-icon name="add-circle-outline"></ion-icon>';
    increaseButton.addEventListener("click", function() {
        quantityInput.value = parseInt(quantityInput.value) + 1;
    });

    quantitySection.appendChild(decreaseButton);
    quantitySection.appendChild(quantityInput);
    quantitySection.appendChild(increaseButton);

    const buttonElement = document.createElement("button");
    buttonElement.className = "order-button";
    buttonElement.textContent = "Chcieć";

    buttonElement.addEventListener("click", function() {
        const itemWithQuantity = {
            ...card,
            quantity: parseInt(quantityInput.value)
        };
        addItemToCart(itemWithQuantity);
    });

    priceSection.appendChild(priceElement);
    priceSection.appendChild(quantitySection);
    priceSection.appendChild(buttonElement);

    cardElement.appendChild(imageElement);
    cardElement.appendChild(titleElement);
    cardElement.appendChild(detailsElement);
    cardElement.appendChild(priceSection);

    return cardElement;
}
