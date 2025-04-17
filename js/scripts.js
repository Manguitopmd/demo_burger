const content = document.getElementById('content');
const tabs = document.querySelectorAll('.tab-bar button');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Load initial section from localStorage or default to 'inicio'
const lastSection = localStorage.getItem('lastSection') || 'inicio';
loadSection(lastSection);
updateTabActive(lastSection);

// Tab navigation
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const section = tab.dataset.section;
        localStorage.setItem('lastSection', section);
        loadSection(section);
    });
});

// Update active tab
function updateTabActive(section) {
    tabs.forEach(t => t.classList.remove('active'));
    const activeTab = Array.from(tabs).find(t => t.dataset.section === section);
    if (activeTab) activeTab.classList.add('active');
}

// Show notification modal
function showNotification(message) {
    const modal = content.querySelector('#notification-modal');
    const messageEl = content.querySelector('#notification-message');
    const closeBtn = content.querySelector('#notification-close');

    if (!modal || !messageEl || !closeBtn) {
        console.error('Notification modal elements not found');
        return;
    }

    messageEl.textContent = message;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('show'), 10);

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }, { once: true });
}

// Load section
async function loadSection(section) {
    try {
        const response = await fetch(`${section}.html`);
        if (!response.ok) {
            throw new Error(`Error al cargar ${section}.html: ${response.status}`);
        }
        let html = await response.text();

        // Replace CONFIG variables with safe defaults
        html = html.replace(/{{businessName}}/g, CONFIG.businessName || "Burger Bonanza")
                  .replace(/{{slogan}}/g, CONFIG.slogan || "¡Las mejores hamburguesas!")
                  .replace(/{{whatsappNumber}}/g, CONFIG.whatsappNumber || "51987654321")
                  .replace(/{{currency}}/g, CONFIG.currency || "S/")
                  .replace(/{{address}}/g, CONFIG.address || "Av. Sabor 123, Lima")
                  .replace(/{{map.lat}}/g, CONFIG.map?.lat || -12.046373)
                  .replace(/{{map.lng}}/g, CONFIG.map?.lng || -77.042754)
                  .replace(/{{hoursDisplay}}/g, CONFIG.hours?.display?.replace('\n', '<br>') || "Lun-Dom: 12:00-22:00");

        content.innerHTML = html;

        // Initialize section-specific functionality
        if (section === 'inicio') {
            initInicio();
        } else if (section === 'carta') {
            initCarta();
        } else if (section === 'carrito') {
            initCarrito();
        }
    } catch (error) {
        console.error(error);
        content.innerHTML = `<p class="text-center text-secondary">Error al cargar la sección: ${section}. Por favor, intenta de nuevo.</p>`;
    }
}

// Inicio Section
function initInicio() {
    const swiper = new Swiper('.swiper', {
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    });

    const menuButton = content.querySelector('[data-section="carta"]');
    if (menuButton) {
        menuButton.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabs[1].classList.add('active');
            localStorage.setItem('lastSection', 'carta');
            loadSection('carta');
        });
    }

    // Initialize map
    const map = L.map('map').setView([CONFIG.map?.lat || -12.046373, CONFIG.map?.lng || -77.042754], CONFIG.map?.zoom || 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    L.marker([CONFIG.map?.lat || -12.046373, CONFIG.map?.lng || -77.042754]).addTo(map)
        .bindPopup(CONFIG.businessName || "Burger Bonanza")
        .openPopup();

    // Add agency credit
    const agencyCredit = document.createElement('div');
    agencyCredit.className = 'agency-credit';
    agencyCredit.innerHTML = `
        <p><a href="#" class="agency-link">Powered by ${CONFIG.agency?.name || "Manguito Publicidad"}</a></p>
    `;
    content.appendChild(agencyCredit);

    // Add agency modal
    const agencyModal = document.createElement('div');
    agencyModal.id = 'agency-modal';
    agencyModal.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center hidden';
    let socialLinks = '';
    if (CONFIG.agency?.socials) {
        if (CONFIG.agency.socials.instagram) {
            socialLinks += `<a href="${CONFIG.agency.socials.instagram}" target="_blank" rel="noopener" class="agency-icon bg-mustard text-white flex items-center justify-center rounded-lg"><i class="fab fa-instagram"></i></a>`;
        }
        if (CONFIG.agency.socials.facebook) {
            socialLinks += `<a href="${CONFIG.agency.socials.facebook}" target="_blank" rel="noopener" class="agency-icon bg-mustard text-white flex items-center justify-center rounded-lg"><i class="fab fa-facebook"></i></a>`;
        }
        if (CONFIG.agency.socials.tiktok) {
            socialLinks += `<a href="${CONFIG.agency.socials.tiktok}" target="_blank" rel="noopener" class="agency-icon bg-mustard text-white flex items-center justify-center rounded-lg"><i class="fab fa-tiktok"></i></a>`;
        }
    }
    agencyModal.innerHTML = `
        <div class="card max-w-sm w-full mx-4 text-center">
            <div class="agency-logo-container">
                <img id="agency-logo" src="assets/img/logo.jpg" alt="${CONFIG.agency?.name || "Manguito Publicidad"}">
            </div>
            <h3 class="text-2xl font-bold mt-4">${CONFIG.agency?.name || "Manguito Publicidad"}</h3>
            <p class="mt-2 text-secondary italic">¿Necesitas una carta digital como esta o deseas que trabajemos contigo en tu proyecto? ¡Contáctanos!</p>
            <div class="contact-icons mt-4 flex justify-center gap-4">
                <div class="icon-wrapper">
                    <a href="${CONFIG.agency?.website || 'https://manguitopmd.github.io/biolink/'}" target="_blank" rel="noopener" class="agency-icon">
                        <i class="fas fa-link"></i>
                    </a>
                </div>
                <div class="icon-wrapper">
                    <a href="https://wa.me/${CONFIG.agency?.whatsapp || '+51961360935'}" target="_blank" rel="noopener" class="agency-icon">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </div>
            </div>

            <div class="social-icons mt-4 flex justify-center gap-4">
                ${socialLinks}
            </div>

            <button id="agency-modal-close" class="btn mt-6 w-full">Cerrar</button>
        </div>
    `;
    content.appendChild(agencyModal);

    // Modal events
    const agencyLink = content.querySelector('.agency-link');
    const agencyModalClose = content.querySelector('#agency-modal-close');
    if (agencyLink && agencyModalClose) {
        agencyLink.addEventListener('click', (e) => {
            e.preventDefault();
            agencyModal.classList.remove('hidden');
            setTimeout(() => agencyModal.classList.add('show'), 10);
        });
        agencyModalClose.addEventListener('click', () => {
            agencyModal.classList.remove('show');
            setTimeout(() => agencyModal.classList.add('hidden'), 300);
        });
    } else {
        console.error('Agency modal elements not found');
    }
}

// Carta Section
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

// Carrito Section
function initCarrito() {
    const cartContent = content.querySelector('#cart-content');
    const emptyCart = content.querySelector('#empty-cart');
    const cartItems = content.querySelector('#cart-items');
    const cartTotal = content.querySelector('#cart-total');
    const proceedCheckout = content.querySelector('#proceed-checkout');
    const verifyModal = content.querySelector('#verify-modal');
    const verifyItems = content.querySelector('#verify-items');
    const verifyName = content.querySelector('#verify-name');
    const verifyPhone = content.querySelector('#verify-phone');
    const verifyDelivery = content.querySelector('#verify-delivery');
    const verifyAddressContainer = content.querySelector('#verify-address-container');
    const verifyAddress = content.querySelector('#verify-address');
    const verifyPayment = content.querySelector('#verify-payment');
    const verifyCashAmount = content.querySelector('#verify-cash-amount');
    const verifyChange = content.querySelector('#verify-change');
    const verifyTotal = content.querySelector('#verify-total');
    const verifyCancel = content.querySelector('#verify-cancel');
    const verifyConfirm = content.querySelector('#verify-confirm');
    const customerName = content.querySelector('#customer-name');
    const customerPhone = content.querySelector('#customer-phone');
    const customerAddress = content.querySelector('#customer-address');
    const addressContainer = content.querySelector('#address-container');
    const cashAmountContainer = content.querySelector('#cash-amount-container');
    const cashAmount = content.querySelector('#cash-amount');
    const qrContainer = content.querySelector('#qr-container');
    const qrImage = content.querySelector('#qr-image');

    // Debug elements
    console.log('Proceed checkout:', proceedCheckout);
    console.log('QR container:', qrContainer);
    console.log('QR image:', qrImage);

    if (!proceedCheckout || !qrContainer || !qrImage) {
        console.error('Critical cart elements missing');
        return;
    }

    // Toggle delivery address field
    content.querySelectorAll('input[name="delivery-method"]').forEach(radio => {
        radio.addEventListener('change', () => {
            addressContainer.classList.toggle('hidden', radio.value !== 'delivery');
            if (radio.value !== 'delivery') customerAddress.value = '';
        });
    });

    // Toggle cash amount field
    content.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', () => {
            cashAmountContainer.classList.toggle('hidden', radio.value !== 'efectivo');
            if (radio.value !== 'efectivo') cashAmount.value = '';
        });
    });

    // Render cart items
    function renderCart() {
        if (cart.length === 0) {
            cartContent.classList.add('hidden');
            emptyCart.classList.remove('hidden');
        } else {
            cartContent.classList.remove('hidden');
            emptyCart.classList.add('hidden');
            cartItems.innerHTML = '';
            cart.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'card flex justify-between items-center p-4';
                div.innerHTML = `
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-mustard">${item.name}</h3>
                        <p class="text-sm text-secondary">${CONFIG.currency || "S/"}${item.price.toFixed(2)}</p>
                        ${item.sauces && item.sauces.length > 0 ? `<p class="text-sm text-secondary">Cremas: ${(CONFIG.sauces || []).filter(s => item.sauces.includes(s.id)).map(s => s.name).join(', ')}</p>` : ''}
                        ${item.notes ? `<p class="text-sm text-secondary">Notas: ${item.notes}</p>` : ''}
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="decrement-item text-mustard text-lg" data-index="${index}"><i class="fas fa-minus"></i></button>
                        <span class="text-white text-sm w-8 text-center">${item.quantity}</span>
                        <button class="increment-item text-mustard text-lg" data-index="${index}"><i class="fas fa-plus"></i></button>
                        <button class="remove-item text-accent ml-2" data-index="${index}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                cartItems.appendChild(div);
            });
            proceedCheckout.disabled = false;
            proceedCheckout.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartTotal.textContent = `${CONFIG.currency || "S/"}${total.toFixed(2)}`;
    }

    renderCart();

    // Go to menu button
    const goToMenu = content.querySelector('#go-to-menu');
    if (goToMenu) {
        goToMenu.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabs[1].classList.add('active');
            localStorage.setItem('lastSection', 'carta');
            loadSection('carta');
        });
    } else {
        console.error('Go to menu button not found');
    }

    // Handle item quantity and removal
    cartItems.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('button')?.dataset.index);
        if (e.target.closest('.increment-item')) {
            cart[index].quantity += 1;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCart();
        } else if (e.target.closest('.decrement-item')) {
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                renderCart();
            }
        } else if (e.target.closest('.remove-item')) {
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCart();
        }
    });

    // Proceed to checkout
    proceedCheckout.addEventListener('click', () => {
        console.log('Proceed checkout clicked');
        const name = customerName.value.trim();
        const phone = customerPhone.value.trim();
        const delivery = content.querySelector('input[name="delivery-method"]:checked')?.value;
        const address = customerAddress.value.trim();
        const payment = content.querySelector('input[name="payment-method"]:checked')?.value?.trim().toLowerCase();
        const cashValue = parseFloat(cashAmount.value) || 0;
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Debug payment value
        console.log('Payment method:', payment);
        console.log('QR container before:', qrContainer.classList);
        console.log('QR image src before:', qrImage.src);

        // Validations
        if (!name) {
            showNotification("Por favor, ingresa tu nombre.");
            return;
        }
        if (!phone) {
            showNotification("Por favor, ingresa tu teléfono.");
            return;
        }
        if (!delivery) {
            showNotification("Por favor, selecciona un método de entrega.");
            return;
        }
        if (delivery === 'delivery' && !address) {
            showNotification("Por favor, ingresa una dirección para el delivery.");
            return;
        }
        if (!payment) {
            showNotification("Por favor, selecciona un método de pago.");
            return;
        }
        if (payment === 'efectivo' && cashValue <= total) {
            showNotification(`El monto en efectivo debe ser mayor al total del pedido (${CONFIG.currency || "S/"}${total.toFixed(2)}).`);
            return;
        }

        // Populate verification modal
        verifyItems.innerHTML = cart.map(item => `
            <p class="text-white/80 text-sm">${item.quantity}x ${item.name} (${CONFIG.currency || "S/"}${(item.price * item.quantity).toFixed(2)})
                ${item.sauces && item.sauces.length > 0 ? `<br>Cremas: ${(CONFIG.sauces || []).filter(s => item.sauces.includes(s.id)).map(s => s.name).join(', ')}` : ''}
                ${item.notes ? `<br>Notas: ${item.notes}` : ''}
            </p>
        `).join('');
        verifyName.textContent = name;
        verifyPhone.textContent = phone;
        verifyDelivery.textContent = delivery === 'recojo' ? 'Recojo en local' : 'Delivery';
        verifyAddressContainer.classList.toggle('hidden', delivery !== 'delivery');
        verifyAddress.textContent = address;
        verifyPayment.textContent = payment.charAt(0).toUpperCase() + payment.slice(1);
        verifyTotal.textContent = `${CONFIG.currency || "S/"}${total.toFixed(2)}`;

        // Handle payment method display
        verifyCashAmount.classList.add('hidden');
        qrContainer.classList.add('hidden');
        if (payment === 'efectivo') {
            verifyCashAmount.classList.remove('hidden');
            verifyChange.textContent = `${CONFIG.currency || "S/"}${(cashValue - total).toFixed(2)}`;
        } else if (payment === 'plin' || payment === 'yape') {
            qrContainer.classList.remove('hidden');
            qrContainer.style.display = 'flex'; // Force visibility
            qrImage.src = ''; // Clear previous image
            qrImage.src = payment === 'plin' ? 'assets/img/qr/qr_plin.jpg' : 'assets/img/qr/qr_yape.jpg';
            qrImage.alt = `QR ${payment.charAt(0).toUpperCase() + payment.slice(1)}`;
            qrImage.onerror = () => {
                console.error(`Error loading QR image: ${qrImage.src}`);
                qrImage.src = 'assets/img/qr/fallback.jpg';
                qrContainer.querySelector('p').textContent = 'QR no disponible. Contacta por WhatsApp.';
            };
            qrContainer.querySelector('p').textContent = 'Descarga el QR y realiza el pago, envía el boucher para realizar tu pedido.';
        } else {
            console.warn('Unknown payment method:', payment);
        }

        console.log('QR container after:', qrContainer.classList);
        console.log('QR image src after:', qrImage.src);

        verifyModal.classList.remove('hidden');
        setTimeout(() => verifyModal.classList.add('show'), 10);
    });

    // Verification modal actions
    verifyCancel.addEventListener('click', () => {
        verifyModal.classList.remove('show');
        setTimeout(() => verifyModal.classList.add('hidden'), 300);
    });

    verifyConfirm.addEventListener('click', () => {
        const name = customerName.value.trim();
        const phone = customerPhone.value.trim();
        const delivery = content.querySelector('input[name="delivery-method"]:checked')?.value;
        const address = customerAddress.value.trim();
        const payment = content.querySelector('input[name="payment-method"]:checked')?.value?.trim().toLowerCase();
        const cashValue = parseFloat(cashAmount.value) || 0;
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const message = cart.map(item => {
            let msg = `${item.quantity}x ${item.name} (${CONFIG.currency || "S/"}${(item.price * item.quantity).toFixed(2)})`;
            if (item.sauces && item.sauces.length > 0) msg += `, Cremas: ${(CONFIG.sauces || []).filter(s => item.sauces.includes(s.id)).map(s => s.name).join(', ')}`;
            if (item.notes) msg += `, Notas: ${item.notes}`;
            return msg;
        }).join('\n');
        const deliveryMessage = delivery === 'recojo' ? 'Recojo en local' : `Delivery a: ${address}`;
        let paymentMessage = '';
        if (payment === 'plin' || payment === 'yape') {
            paymentMessage = `Método de pago: ${payment.charAt(0).toUpperCase() + payment.slice(1)}\nPor favor, realiza el pago con el QR y envía el boucher al WhatsApp.`;
        } else {
            paymentMessage = `Método de pago: Efectivo\nPagaré con ${CONFIG.currency || "S/"}${cashValue.toFixed(2)}, preparar vuelto de ${CONFIG.currency || "S/"}${(cashValue - total).toFixed(2)}.`;
        }

        const whatsappMessage = encodeURIComponent(
            `Hola, quiero hacer un pedido:\n\n` +
            `Nombre: ${name}\n` +
            `Teléfono: ${phone}\n` +
            `Entrega: ${deliveryMessage}\n\n` +
            `Pedidos:\n${message}\n\n` +
            `Total: ${CONFIG.currency || "S/"}${total.toFixed(2)}\n\n` +
            `${paymentMessage}`
        );

        window.location.href = `https://wa.me/${CONFIG.whatsappNumber || "51987654321"}?text=${whatsappMessage}`;
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        verifyModal.classList.remove('show');
        setTimeout(() => verifyModal.classList.add('hidden'), 300);
        renderCart();
    });
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.classList.toggle('hidden', totalItems === 0);

    if (totalItems > 0) {
        cartCount.classList.add('jump', 'highlight');
        setTimeout(() => {
            cartCount.classList.remove('jump', 'highlight');
        }, 1000);
    }
}

updateCartCount();