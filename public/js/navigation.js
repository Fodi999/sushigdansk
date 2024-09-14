 'use strict';

export function setupNavigation() {
    const listItems = document.querySelectorAll('.navigation .list');
    const indicator = document.querySelector('.navigation .indicator');

    if (!listItems.length || !indicator) {
        console.error("Не удалось найти элементы навигации или индикатор.");
        return;
    }

    // Вспомогательная функция для удаления и добавления класса 'active'
    function updateActiveItem(item) {
        resetActiveItems(listItems);
        item.classList.add('active');
        moveIndicator(item, indicator);
    }

    // Вспомогательная функция для сброса активных классов
    function resetActiveItems(items) {
        items.forEach(item => item.classList.remove('active'));
    }

    // Вспомогательная функция для перемещения индикатора
    function moveIndicator(element, indicatorElement) {
        const position = element.getBoundingClientRect();
        indicatorElement.style.left = `${element.offsetLeft}px`;
        indicatorElement.style.width = `${element.clientWidth}px`;
    }

    // Добавляем обработчики событий для каждого элемента списка
    listItems.forEach(item => {
        item.addEventListener('click', () => updateActiveItem(item));
    });
}
