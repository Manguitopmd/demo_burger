function initCarta() {
    const filters = content.querySelectorAll('button[data-category]');
    const items = content.querySelectorAll('.item');
    const modal = content.querySelector('#item-modal');
    const modalTitle = content.querySelector('#modal-title');
    const modalQuantity = content.querySelector('#modal-quantity');
    const modalSaucesContainer = content.querySelector('#modal-sauces');
    const modalSauceContainer = content.querySelector('#modal-sauce-container');
    const modalNotes = content.querySelector('#modal-notes');
    const modalCancel = content.querySelector('#modal-cancel');
    const modalConfirm = content.querySelector('#modal-confirm');
    const suggestionToast = content.querySelector('#suggestion-toast');
    const suggestionButtons = content.querySelector('#suggestion-buttons');
    const toastClose = content.querySelector('#toast-close');

    // Populate sauces as checkboxes
    if (modalSaucesContainer) {
        modalSaucesContainer.innerHTML = '';
        (CONFIG.sauces || []).forEach(sauce => {
            const div = document.createElement('div');
            div.className = 'flex items-center gap-2';
            div.innerHTML = `
                <input type="checkbox" id="sauce-${sauce.id}" value="${sauce.id}" class="modal-sauce-checkbox">
                <label for="sauce-${sauce.id}" class="text-white/80 text-sm">${sauce.name}</label>
            `;
            modalSaucesContainer.appendChild(div);
        });
    }

    // Filter items
    filters.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            items.forEach(item => {
                item.style.display = category === 'all' || item.dataset.category === category ? 'block' : 'none';
            });
            filters.forEach(btn => btn.classList.remove('active-category'));
            button.classList.add('active-category');
        });
    });

    // Show suggestion toast
    function showSuggestions(category) {
        suggestionButtons.innerHTML = '';
        const suggestions = [];

        if (category === 'hamburguesas' || category === 'combos') {
            suggestions.push(
                { text: 'Añadir bebida', category: 'bebidas', color: 'bg-green' },
                { text: 'Añadir acompañamiento', category: 'acompañamientos', color: 'bg-accent' },
                { text: 'Ver más hamburguesas', category: 'hamburguesas', color: 'bg-mustard' }
            );
        } else if (category === 'acompañamientos') {
            suggestions.push(
                { text: 'Añadir bebida', category: 'bebidas', color: 'bg-green' },
                { text: 'Ver hamburguesas', category: 'hamburguesas', color: 'bg-mustard' }
            );
        } else if (category === 'bebidas') {
            suggestions.push(
                { text: 'Añadir acompañamiento', category: 'acompañamientos', color: 'bg-accent' },
                { text: 'Ver hamburguesas', category: 'hamburguesas', color: 'bg-mustard' }
            );
        }

        suggestions.forEach(sug => {
            const btn = document.createElement('button');
            btn.className = `btn ${sug.color} text-black px-3 py-1 rounded-full`;
            btn.textContent = sug.text;
            btn.addEventListener('click', () => {
                const filterBtn = content.querySelector(`button[data-category="${sug.category}"]`);
                if (filterBtn) {
                    filterBtn.click();
                    suggestionToast.classList.remove('show');
                    setTimeout(() => suggestionToast.classList.add('hidden'), 300);
                }
            });
            suggestionButtons.appendChild(btn);
        });

        suggestionToast.classList.remove('hidden');
        setTimeout(() => suggestionToast.classList.add('show'), 10);

        // Close toast
        toastClose.addEventListener('click', () => {
            suggestionToast.classList.remove('show');
            setTimeout(() => suggestionToast.classList.add('hidden'), 300);
        }, { once: true });
    }

    // Add to cart with modal
    content.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const itemDiv = button.closest('.item');
            const itemName = itemDiv.querySelector('h3').textContent;
            const itemPrice = parseFloat(itemDiv.querySelector('.price').textContent.replace(CONFIG.currency || "S/", ''));
            const itemCategory = itemDiv.dataset.category;
            const isDrink = itemCategory === 'bebidas';

            modalTitle.textContent = itemName;
            modalQuantity.value = 1;
            modalNotes.value = '';
            modalSaucesContainer.querySelectorAll('input').forEach(checkbox => checkbox.checked = false);
            modalSauceContainer.style.display = isDrink ? 'none' : 'block';

            modal.classList.remove('hidden');
            setTimeout(() => modal.classList.add('show'), 10);

            modalCancel.addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => modal.classList.add('hidden'), 300);
            }, { once: true });

            modalConfirm.addEventListener('click', () => {
                const sauces = [];
                modalSaucesContainer.querySelectorAll('input:checked').forEach(checkbox => {
                    sauces.push(checkbox.value);
                });

                const item = {
                    name: itemName,
                    price: itemPrice,
                    quantity: parseInt(modalQuantity.value),
                    sauces: isDrink ? [] : sauces,
                    notes: modalNotes.value,
                    category: itemCategory
                };
                cart.push(item);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();

                const indicator = itemDiv.querySelector('.added-indicator');
                indicator.classList.remove('hidden');
                setTimeout(() => indicator.classList.add('hidden'), 1000);

                modal.classList.remove('show');
                setTimeout(() => modal.classList.add('hidden'), 300);

                // Show suggestions based on category
                showSuggestions(itemCategory);
            }, { once: true });
        });
    });
}