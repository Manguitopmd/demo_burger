function initReservas() {
    try {
        const section = content.querySelector('section');
        if (!section) {
            console.error('Reservas section not found');
            showModal('🚫 Error', 'Error al cargar la sección de reservas. Por favor, intenta de nuevo.', '');
            return;
        }

        // DOM elements
        const reserveDate = section.querySelector('#reserve-date');
        const reserveTime = section.querySelector('#reserve-time');
        const reservePersons = section.querySelector('#reserve-persons');
        const reserveName = section.querySelector('#reserve-name');
        const reservePhone = section.querySelector('#reserve-phone');
        const reserveNotes = section.querySelector('#reserve-notes');
        const submitReserve = section.querySelector('#submit-reserve');
        const verifyModal = section.querySelector('#verify-reserve-modal');
        const verifyTitle = section.querySelector('#verify-reserve-title');
        const verifyMessage = section.querySelector('#verify-reserve-message');
        const verifyDetails = section.querySelector('#verify-reserve-details');
        const verifySubmit = section.querySelector('#verify-reserve-submit');
        const verifyCancel = section.querySelector('#verify-reserve-cancel');

        // Set minimum date based on minBookingHours
        const now = new Date();
        const minDate = new Date(now.getTime() + CONFIG.minBookingHours * 60 * 60 * 1000);
        const minDateString = minDate.toISOString().split('T')[0];
        reserveDate.setAttribute('min', minDateString);

        // Set maximum date (e.g., 30 days from now)
        const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const maxDateString = maxDate.toISOString().split('T')[0];
        reserveDate.setAttribute('max', maxDateString);

        // Function to generate time slots for a given date
        function populateTimeSlots(selectedDate) {
            reserveTime.innerHTML = '<option value="">Selecciona una hora</option>';
            const dayName = selectedDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
            const hours = CONFIG.businessHours[dayName] || [];

            if (hours.length === 0) {
                reserveTime.disabled = true;
                return;
            }

            reserveTime.disabled = false;

            hours.forEach(slot => {
                let start = new Date(`1970-01-01T${slot.start}:00`);
                const end = new Date(`1970-01-01T${slot.end}:00`);

                while (start < end) {
                    const timeString = start.toTimeString().slice(0, 5); // Format as HH:MM
                    const option = document.createElement('option');
                    option.value = timeString;
                    option.textContent = timeString;
                    reserveTime.appendChild(option);
                    start.setMinutes(start.getMinutes() + 30); // 30-minute intervals
                }
            });
        }

        // Update time slots when date changes
        reserveDate.addEventListener('change', () => {
            const selectedDate = new Date(reserveDate.value);
            if (selectedDate && !isNaN(selectedDate)) {
                populateTimeSlots(selectedDate);
            } else {
                reserveTime.innerHTML = '<option value="">Selecciona una hora</option>';
                reserveTime.disabled = true;
            }
        });

        // Function to show modal
        function showModal(title, message, details) {
            if (verifyModal && verifyTitle && verifyMessage && verifyDetails) {
                verifyTitle.textContent = title;
                verifyMessage.textContent = message;
                verifyDetails.innerHTML = details;
                verifyModal.classList.remove('hidden');
                setTimeout(() => verifyModal.classList.add('show'), 10);
            } else {
                console.error('Modal elements not found');
            }
        }

        // Handle form submission
        submitReserve.addEventListener('click', () => {
            const date = reserveDate.value;
            const time = reserveTime.value;
            const persons = reservePersons.value.trim();
            const name = reserveName.value.trim();
            const phone = reservePhone.value.trim();
            const notes = reserveNotes.value.trim();

            // Validations
            let errorMessage = '';
            if (!date) errorMessage = '🚫 Por favor, selecciona una fecha.';
            else if (!time) errorMessage = '🚫 Por favor, selecciona una hora.';
            else if (!persons || persons < 1) errorMessage = '🚫 Por favor, ingresa un número válido de personas.';
            else if (!name) errorMessage = '🚫 Por favor, ingresa tu nombre.';
            else if (!phone) errorMessage = '🚫 Por favor, ingresa tu teléfono.';

            if (errorMessage) {
                verifySubmit.classList.add('hidden');
                showModal('🚫 Error en la Reserva', errorMessage, '');
                verifyCancel.addEventListener('click', () => {
                    verifyModal.classList.remove('show');
                    setTimeout(() => verifyModal.classList.add('hidden'), 300);
                }, { once: true });
                return;
            }

            // Format reservation details for modal
            const formattedDate = new Date(date).toLocaleDateString('es-PE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const details = `
                <div class="space-y-2">
                    <p><span class="font-bold text-mustard">👤 Nombre:</span> ${name}</p>
                    <p><span class="font-bold text-mustard">📞 Teléfono:</span> ${phone}</p>
                    <p><span class="font-bold text-mustard">🗓️ Fecha:</span> ${formattedDate}</p>
                    <p><span class="font-bold text-mustard">⏰ Hora:</span> ${time}</p>
                    <p><span class="font-bold text-mustard">👥 Personas:</span> ${persons}</p>
                    ${notes ? `<p><span class="font-bold text-mustard">📝 Notas:</span> ${notes}</p>` : ''}
                </div>
            `;

            // Show verification modal with data
            verifySubmit.classList.remove('hidden');
            showModal('📅 Verifica tu Reserva', 'Revisa que los datos sean correctos:', details);

            // Handle Cancel button
            verifyCancel.addEventListener('click', () => {
                verifyModal.classList.remove('show');
                setTimeout(() => verifyModal.classList.add('hidden'), 300);
            }, { once: true });

            // Handle Submit button
            verifySubmit.addEventListener('click', () => {
                verifyModal.classList.remove('show');
                setTimeout(() => {
                    verifyModal.classList.add('hidden');

                    // Format WhatsApp message
                    const message = 
                      "Solicitud de Reserva\n\n" +
                      "Nombre: " + name + "\n" +
                      "Teléfono: " + phone + "\n" +
                      "Fecha: " + formattedDate + "\n" +
                      "Hora: " + time + "\n" +
                      "Personas: " + persons + "\n" +
                      (notes ? "Notas: " + notes + "\n" : '');

                    const whatsappMessage = encodeURIComponent(message);
                    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${whatsappMessage}`, '_blank');


                    // Clear form
                    reserveDate.value = '';
                    reserveTime.innerHTML = '<option value="">Selecciona una hora</option>';
                    reserveTime.disabled = true;
                    reservePersons.value = '';
                    reserveName.value = '';
                    reservePhone.value = '';
                    reserveNotes.value = '';

                    // Redirect to inicio
                    setTimeout(() => {
                        localStorage.setItem('lastSection', 'inicio');
                        updateTabActive('inicio');
                        loadSection('inicio');
                    }, 500); // Small delay to ensure WhatsApp opens
                }, 300);
            }, { once: true });
        });

    } catch (error) {
        console.error('Error in initReservas:', error);
        showModal('🚫 Error', 'Error al procesar la reserva. Por favor, intenta de nuevo.', '');
    }
}