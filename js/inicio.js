function initInicio() {
    try {
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

        // Add social media buttons
        const socialLinksContainer = content.querySelector('#social-links');
        if (socialLinksContainer) {
            const socials = CONFIG.socials || {};
            const socialIcons = {
                instagram: 'fab fa-instagram',
                facebook: 'fab fa-facebook',
                tiktok: 'fab fa-tiktok',
                twitter: 'fab fa-twitter',
                youtube: 'fab fa-youtube'
            };

            Object.keys(socials).forEach(key => {
                if (socials[key]) {
                    const button = document.createElement('a');
                    button.href = socials[key];
                    button.target = '_blank';
                    button.rel = 'noopener';
                    button.className = 'social-icon bg-dark-card text-mustard flex items-center justify-center rounded-full w-12 h-12';
                    button.innerHTML = `<i class="${socialIcons[key]} text-xl"></i>`;
                    socialLinksContainer.appendChild(button);
                }
            });
        }

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

        // Handle Reservation Button
        const reserveButton = content.querySelector('#open-reserve');
        const reserveModal = content.querySelector('#reserve-confirm-modal');
        const reserveMessage = content.querySelector('#reserve-confirm-message');
        const reserveCancel = content.querySelector('#reserve-cancel');
        const reserveContinue = content.querySelector('#reserve-continue');

        if (reserveButton && reserveModal && reserveMessage && reserveCancel && reserveContinue) {
            reserveButton.addEventListener('click', (e) => {
                e.preventDefault();
                reserveMessage.textContent = `Las reservas deben realizarse con ${CONFIG.minBookingHours} horas de antelación. ¿Deseas continuar?`;
                reserveModal.classList.remove('hidden');
                setTimeout(() => reserveModal.classList.add('show'), 10);
            });

            reserveCancel.addEventListener('click', () => {
                reserveModal.classList.remove('show');
                setTimeout(() => reserveModal.classList.add('hidden'), 300);
            });

            reserveContinue.addEventListener('click', () => {
                reserveModal.classList.remove('show');
                setTimeout(() => {
                    reserveModal.classList.add('hidden');
                    tabs.forEach(t => t.classList.remove('active'));
                    const reserveTab = Array.from(tabs).find(t => t.dataset.section === 'reservas');
                    if (reserveTab) reserveTab.classList.add('active');
                    localStorage.setItem('lastSection', 'reservas');
                    loadSection('reservas');
                }, 300);
            });
        } else {
            console.error('Reservation modal elements not found');
            showNotification('Error al inicializar el modal de reservas. Por favor, intenta de nuevo.');
        }

    } catch (error) {
        console.error('Error in initInicio:', error);
        showNotification('Error al inicializar la página de inicio. Por favor, intenta de nuevo.');
    }
}