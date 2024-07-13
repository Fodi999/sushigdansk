document.addEventListener("DOMContentLoaded", function() {
    const cardContainer = document.getElementById("card-container");
    const cartItems = [];

    const cardsData = [
        { title: "Najlepszy zestaw Filadelfii", details: "930 грамов, 32 sztuki", price: "240 zł", image: "images/Rectangle-3.webp" },
        { title: "Zestaw California", details: "800 грамов, 28 sztuki", price: "220 zł", image: "images/Rectangle-3.webp" },
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

    cardsData.forEach(card => {
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

        const buttonElement = document.createElement("button");
        buttonElement.className = "order-button";
        buttonElement.textContent = "Chcieć";

        buttonElement.addEventListener("click", function() {
            cartItems.push(card);
            updateCartModal();
        });

        priceSection.appendChild(priceElement);
        priceSection.appendChild(buttonElement);

        cardElement.appendChild(imageElement);
        cardElement.appendChild(titleElement);
        cardElement.appendChild(detailsElement);
        cardElement.appendChild(priceSection);

        cardContainer.appendChild(cardElement);
    });

    const list = document.querySelectorAll('.list');
    function activeLink() {
        list.forEach((item) => item.classList.remove('active'));
        this.classList.add('active');
    }
    list.forEach((item) => item.addEventListener('click', activeLink));

    const cartButton = document.getElementById("cart-button");
    const modal = document.getElementById("cart-modal");
    const closeModal = document.getElementById("close-modal");

    cartButton.addEventListener("click", function() {
        modal.style.display = "flex";
    });

    closeModal.addEventListener("click", function() {
        modal.style.display = "none";
    });

    const checkoutButton = document.getElementById("checkout-button");
    const checkoutModal = document.getElementById("checkout-modal");
    const closeCheckoutModal = document.getElementById("close-checkout-modal");

    checkoutButton.addEventListener("click", function() {
        modal.style.display = "none";
        checkoutModal.style.display = "flex";
    });

    closeCheckoutModal.addEventListener("click", function() {
        checkoutModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        } else if (event.target == checkoutModal) {
            checkoutModal.style.display = "none";
        }
    });

    function updateCartModal() {
        const cartItemsContainer = document.getElementById("cart-items");
        cartItemsContainer.innerHTML = "";

        cartItems.forEach((item, index) => {
            const itemElement = document.createElement("div");
            itemElement.className = "cart-item";

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

            const removeButton = document.createElement("button");
            removeButton.className = "remove-button";
            removeButton.textContent = "Удалить";

            removeButton.addEventListener("click", function() {
                cartItems.splice(index, 1);
                updateCartModal();
            });

            itemDetailsContainer.appendChild(itemTitle);
            itemDetailsContainer.appendChild(itemDetails);
            itemDetailsContainer.appendChild(itemPrice);

            itemElement.appendChild(itemImage);
            itemElement.appendChild(itemDetailsContainer);
            itemElement.appendChild(removeButton);

            cartItemsContainer.appendChild(itemElement);
        });
    }

    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const name = document.getElementById("name").value;
            const address = document.getElementById("address").value;
            const phone = document.getElementById("phone").value;

            const order = {
                name: name,
                address: address,
                phone: phone,
                order: cartItems
            };

            fetch("/api/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(order)
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                checkoutModal.style.display = "none";
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Произошла ошибка при отправке заказа.");
            });
        });
    }
});























