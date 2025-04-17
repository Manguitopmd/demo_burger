const content = document.getElementById('content');
const tabs = document.querySelectorAll('.tab-bar button');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Track loaded scripts to avoid duplicates
const loadedScripts = new Set();

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

// Delegate click events for dynamically loaded buttons, excluding open-reserve
content.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-section]');
    if (button && button.id !== 'open-reserve') {
        const section = button.dataset.section;
        if (section) {
            localStorage.setItem('lastSection', section);
            loadSection(section);
            updateTabActive(section);
        }
    }
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

// Load section and corresponding script
async function loadSection(section) {
    try {
        // Load HTML
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

        // Load section-specific script
        const scriptMap = {
            'inicio': 'js/inicio.js',
            'carta': 'js/carta.js',
            'carrito': 'js/carrito.js',
            'reservas': 'js/reservas.js'
        };

        const scriptSrc = scriptMap[section];
        if (scriptSrc && !loadedScripts.has(scriptSrc)) {
            const script = document.createElement('script');
            script.src = scriptSrc;
            script.async = true;
            script.onload = () => {
                loadedScripts.add(scriptSrc);
                console.log(`${scriptSrc} loaded successfully`);
                // Initialize section after script loads
                if (section === 'inicio') {
                    initInicio();
                } else if (section === 'carta') {
                    initCarta();
                } else if (section === 'carrito') {
                    initCarrito();
                } else if (section === 'reservas') {
                    initReservas();
                }
            };
            script.onerror = () => {
                console.error(`Error loading ${scriptSrc}`);
                showNotification(`Error al cargar el script de ${section}. Por favor, intenta de nuevo.`);
            };
            document.body.appendChild(script);
        } else if (loadedScripts.has(scriptSrc)) {
            // If script is already loaded, call initialization directly
            if (section === 'inicio') {
                initInicio();
            } else if (section === 'carta') {
                initCarta();
            } else if (section === 'carrito') {
                initCarrito();
            } else if (section === 'reservas') {
                initReservas();
            }
        } else {
            console.warn(`No script defined for section: ${section}`);
        }
    } catch (error) {
        console.error(error);
        content.innerHTML = `<p class="text-center text-secondary">Error al cargar la sección: ${section}. Por favor, intenta de nuevo.</p>`;
        showNotification(`Error al cargar la sección ${section}. Verifica tu conexión o intenta de nuevo.`);
    }
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