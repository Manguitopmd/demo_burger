function initCarrito() {
    try {
        // Ensure section is loaded
        const section = content.querySelector('#carrito');
        if (!section) {
            console.error('Carrito section not found');
            showNotification('Error al cargar el carrito. Por favor, intenta de nuevo.');
            return;
        }

        // DOM elements
        const cartContent = section.querySelector('#cart-content');
        const emptyCart = section.querySelector('#empty-cart');
        const cartItems = section.querySelector('#cart-items');
        const toggleCartItems = section.querySelector('#toggle-cart-items');
        const cartTotal = section.querySelector('#cart-total');
        const proceedToInfo = section.querySelector('#proceed-to-info');
        const customerInfo = section.querySelector('#customer-info');
        const proceedCheckout = section.querySelector('#proceed-checkout');
        const orderSummaryModal = section.querySelector('#order-summary-modal');
        const summaryItems = section.querySelector('#summary-items');
        const summaryTotal = section.querySelector('#summary-total');
        const summaryCancel = section.querySelector('#summary-cancel');
        const summaryConfirm = section.querySelector('#summary-confirm');
        const verifyModal = section.querySelector('#verify-modal');
        const verifyItems = section.querySelector('#verify-items');
        const verifyName = section.querySelector('#verify-name');
        const verifyPhone = section.querySelector('#verify-phone');
        const verifyDelivery = section.querySelector('#verify-delivery');
        const verifyAddressContainer = section.querySelector('#verify-address-container');
        const verifyAddress = section.querySelector('#verify-address');
        const verifyPayment = section.querySelector('#verify-payment');
        const verifyCashAmount = section.querySelector('#verify-cash-amount');
        const verifyChange = section.querySelector('#verify-change');
        const verifyTotal = section.querySelector('#verify-total');
        const verifyCancel = section.querySelector('#verify-cancel');
        const verifyConfirm = section.querySelector('#verify-confirm');
        const customerName = section.querySelector('#customer-name');
        const customerPhone = section.querySelector('#customer-phone');
        const customerAddress = section.querySelector('#customer-address');
        const addressContainer = section.querySelector('#address-container');
        const cashAmountContainer = section.querySelector('#cash-amount-container');
        const cashAmount = section.querySelector('#cash-amount');
        const qrContainer = section.querySelector('#qr-container');
        const qrImage = section.querySelector('#qr-image');
        const goToMenu = section.querySelector('#go-to-menu');

        // Step navigation
        const steps = section.querySelectorAll('.step');
        const stepIndicators = section.querySelectorAll('.step-indicator');
        const nextStep1 = section.querySelector('#next-step-1');
        const nextStep2 = section.querySelector('#next-step-2');
        const prevStep2 = section.querySelector('#prev-step-2');
        const prevStep3 = section.querySelector('#prev-step-3');

        // Validate critical elements
        if (!cartContent || !emptyCart || !cartItems || !toggleCartItems || !cartTotal || !proceedToInfo || !customerInfo || !proceedCheckout || !orderSummaryModal || !verifyModal || !qrContainer || !qrImage) {
            console.error('Critical cart elements missing');
            showNotification('Error al inicializar el carrito. Por favor, recarga la página.');
            return;
        }

        // Toggle cart items visibility
        let isCartItemsVisible = true;
        toggleCartItems.addEventListener('click', () => {
            isCartItemsVisible = !isCartItemsVisible;
            cartItems.classList.toggle('hidden', !isCartItemsVisible);
            toggleCartItems.querySelector('i').classList.toggle('fa-chevron-up', isCartItemsVisible);
            toggleCartItems.querySelector('i').classList.toggle('fa-chevron-down', !isCartItemsVisible);
            toggleCartItems.querySelector('span').textContent = isCartItemsVisible ? 'Colapsar' : 'Expandir';
        });

        // Toggle delivery address field
        section.querySelectorAll('input[name="delivery-method"]').forEach(radio => {
            radio.addEventListener('change', () => {
                addressContainer.classList.toggle('hidden', radio.value !== 'delivery');
                if (radio.value !== 'delivery') customerAddress.value = '';
            });
        });

        // Toggle cash amount field
        section.querySelectorAll('input[name="payment-method"]').forEach(radio => {
            radio.addEventListener('change', () => {
                cashAmountContainer.classList.toggle('hidden', radio.value !== 'efectivo');
                if (radio.value !== 'efectivo') cashAmount.value = '';
            });
        });

        // Render cart items
        function renderCart() {
            if (!cart || cart.length === 0) {
                cartContent.classList.add('hidden');
                emptyCart.classList.remove('hidden');
                customerInfo.classList.add('hidden');
                toggleCartItems.classList.add('hidden');
            } else {
                cartContent.classList.remove('hidden');
                emptyCart.classList.add('hidden');
                toggleCartItems.classList.remove('hidden');
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
                proceedToInfo.disabled = false;
                proceedToInfo.classList.remove('opacity-50', 'cursor-not-allowed');
            }

            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            cartTotal.textContent = `${CONFIG.currency || "S/"}${total.toFixed(2)}`;
        }

        // Initial render
        renderCart();

        // Go to menu button
        if (goToMenu) {
            goToMenu.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                const cartaTab = Array.from(tabs).find(t => t.dataset.section === 'carta');
                if (cartaTab) cartaTab.classList.add('active');
                localStorage.setItem('lastSection', 'carta');
                loadSection('carta');
            });
        }

        // Handle item quantity and removal
        cartItems.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button')?.dataset.index);
            if (isNaN(index)) return;
            if (e.target.closest('.increment-item')) {
                cart[index].quantity += 1;
            } else if (e.target.closest('.decrement-item')) {
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
            } else if (e.target.closest('.remove-item')) {
                cart.splice(index, 1);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCart();
        });

        // Step navigation logic
        let currentStep = 1;

        function showStep(stepNumber) {
            steps.forEach(step => step.classList.add('hidden'));
            section.querySelector(`#step-${stepNumber}`).classList.remove('hidden');
            stepIndicators.forEach(ind => ind.classList.remove('active'));
            section.querySelector(`.step-indicator[data-step="${stepNumber}"]`).classList.add('active');
            currentStep = stepNumber;
        }

        // Proceed to customer info
        proceedToInfo.addEventListener('click', () => {
            customerInfo.classList.remove('hidden');
            isCartItemsVisible = false;
            cartItems.classList.add('hidden');
            toggleCartItems.querySelector('i').classList.remove('fa-chevron-up');
            toggleCartItems.querySelector('i').classList.add('fa-chevron-down');
            toggleCartItems.querySelector('span').textContent = 'Expandir';
        });

        // Step 1: Validate and go to Step 2
        nextStep1.addEventListener('click', () => {
            const name = customerName.value.trim();
            const phone = customerPhone.value.trim();
            if (!name) {
                showNotification("Por favor, ingresa tu nombre.");
                return;
            }
            if (!/^[A-Za-z\s]+$/.test(name)) {
                showNotification("El nombre solo puede contener letras y espacios.");
                return;
            }
            if (!phone) {
                showNotification("Por favor, ingresa tu teléfono.");
                return;
            }
            if (!/^\d{9}$/.test(phone)) {
                showNotification("El teléfono debe contener exactamente 9 dígitos numéricos.");
                return;
            }
            showStep(2);
        });

        // Step 2: Back to Step 1 or go to Step 3
        prevStep2.addEventListener('click', () => showStep(1));
        nextStep2.addEventListener('click', () => {
            const delivery = section.querySelector('input[name="delivery-method"]:checked')?.value;
            const address = customerAddress.value.trim();
            if (!delivery) {
                showNotification("Por favor, selecciona un método de entrega.");
                return;
            }
            if (delivery === 'delivery' && !address) {
                showNotification("Por favor, ingresa una dirección para el delivery.");
                return;
            }
            showStep(3);
        });

        // Step 3: Back to Step 2
        prevStep3.addEventListener('click', () => showStep(2));

        // Proceed to order summary
        proceedCheckout.addEventListener('click', () => {
            const name = customerName.value.trim();
            const phone = customerPhone.value.trim();
            const delivery = section.querySelector('input[name="delivery-method"]:checked')?.value;
            const address = customerAddress.value.trim();
            const payment = section.querySelector('input[name="payment-method"]:checked')?.value?.trim().toLowerCase();
            const cashValue = parseFloat(cashAmount.value) || 0;
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

            // Validations
            if (!payment) {
                showNotification("Por favor, selecciona un método de pago.");
                return;
            }
            if (payment === 'efectivo' && cashValue <= total) {
                showNotification(`El monto en efectivo debe ser mayor al total del pedido (${CONFIG.currency || "S/"}${total.toFixed(2)}).`);
                return;
            }

            // Populate order summary modal
            summaryItems.innerHTML = cart.map(item => `
                <p class="text-secondary text-sm">${item.quantity}x ${item.name} (${CONFIG.currency || "S/"}${(item.price * item.quantity).toFixed(2)})
                    ${item.sauces && item.sauces.length > 0 ? `<br>Cremas: ${(CONFIG.sauces || []).filter(s => item.sauces.includes(s.id)).map(s => s.name).join(', ')}` : ''}
                    ${item.notes ? `<br>Notas: ${item.notes}` : ''}
                </p>
            `).join('');
            summaryTotal.textContent = `${CONFIG.currency || "S/"}${total.toFixed(2)}`;

            orderSummaryModal.classList.remove('hidden');
            setTimeout(() => orderSummaryModal.classList.add('show'), 10);
        });

        // Order summary modal actions
        summaryCancel.addEventListener('click', () => {
            orderSummaryModal.classList.remove('show');
            setTimeout(() => orderSummaryModal.classList.add('hidden'), 300);
            customerInfo.classList.add('hidden');
            isCartItemsVisible = true;
            cartItems.classList.remove('hidden');
            toggleCartItems.querySelector('i').classList.add('fa-chevron-up');
            toggleCartItems.querySelector('i').classList.remove('fa-chevron-down');
            toggleCartItems.querySelector('span').textContent = 'Colapsar';
            proceedToInfo.classList.remove('hidden');
        });

        summaryConfirm.addEventListener('click', () => {
            orderSummaryModal.classList.remove('show');
            setTimeout(() => orderSummaryModal.classList.add('hidden'), 300);

            const name = customerName.value.trim();
            const phone = customerPhone.value.trim();
            const delivery = section.querySelector('input[name="delivery-method"]:checked')?.value;
            const address = customerAddress.value.trim();
            const payment = section.querySelector('input[name="payment-method"]:checked')?.value?.trim().toLowerCase();
            const cashValue = parseFloat(cashAmount.value) || 0;
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

            // Populate verify data modal
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
                qrContainer.style.display = 'flex';
                qrImage.src = payment === 'plin' ? 'assets/img/qr/qr_plin.jpg' : 'assets/img/qr/qr_yape.jpg';
                qrImage.alt = `QR ${payment.charAt(0).toUpperCase() + payment.slice(1)}`;
                qrImage.onerror = () => {
                    console.error(`Error loading QR image: ${qrImage.src}`);
                    qrImage.src = 'assets/img/qr/fallback.jpg';
                    qrContainer.querySelector('p').textContent = 'QR no disponible. Contacta por WhatsApp.';
                };
            }

            verifyModal.classList.remove('hidden');
            setTimeout(() => verifyModal.classList.add('show'), 10);
        });

        // Verify data modal actions
        verifyCancel.addEventListener('click', () => {
            verifyModal.classList.remove('show');
            setTimeout(() => verifyModal.classList.add('hidden'), 300);
            showStep(currentStep);
        });

        verifyConfirm.addEventListener('click', () => {
            const name = customerName.value.trim();
            const phone = customerPhone.value.trim();
            const delivery = section.querySelector('input[name="delivery-method"]:checked')?.value;
            const address = customerAddress.value.trim();
            const payment = section.querySelector('input[name="payment-method"]:checked')?.value?.trim().toLowerCase();
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
                paymentMessage = `Método de pago: ${payment.charAt(0).toUpperCase() + payment.slice(1)}\nEn breve envío el pago con el QR y envío el comprobante para confirmar mi pedido.`;
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
    } catch (error) {
        console.error('Error in initCarrito:', error);
        showNotification('Error al cargar el carrito. Por favor, intenta de nuevo.');
    }
}