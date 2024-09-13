 'use strict';

export function setupNavigation() {
    const listItems = document.querySelectorAll('.navigation .list');
    const indicator = document.querySelector('.navigation .indicator');

    if (!listItems.length || !indicator) {
        console.error("Не удалось найти элементы навигации или индикатор.");
        return;
    }

    function updateActiveItem() {
        listItems.forEach(item => item.classList.remove('active'));
        this.classList.add('active');
        moveIndicator(this);
    }

    function moveIndicator(element) {
        const position = element.getBoundingClientRect();
        indicator.style.left = `${element.offsetLeft}px`;
        indicator.style.width = `${element.clientWidth}px`;
    }

    listItems.forEach(item => item.addEventListener('click', updateActiveItem));
}