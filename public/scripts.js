document.addEventListener('DOMContentLoaded', function () {
    const burgerMenu = document.getElementById('burger-menu');
    const headerNav = document.getElementById('header-nav');

    burgerMenu.addEventListener('click', function () {
        headerNav.classList.toggle('active');
    });
});

