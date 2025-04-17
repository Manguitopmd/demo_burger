const CONFIG = {
    // Nombre del negocio, aparece en la página de inicio y el mapa
    businessName: "Burger Bonanza",

    // Eslogan del negocio, mostrado en la página de inicio
    slogan: "¡Las mejores hamburguesas de la ciudad!",

    // Número de WhatsApp para pedidos (sin espacios ni signos, formato internacional)
    whatsappNumber: "51961360935",

    // Moneda para precios, aparece en carta y carrito
    currency: "S/",

    // Dirección del negocio, mostrada en la página de inicio
    address: "Av. Sabor 123, Lima, Perú",

    // Coordenadas para el mapa en la página de inicio
    map: {
        lat: -12.046373,
        lng: -77.042754,
        zoom: 15
    },

    // Horarios de atención, para reservas y página de inicio
    businessHours: {
        monday: [], // Cerrado
        tuesday: [
            { start: '12:00', end: '15:00' },
            { start: '18:00', end: '22:00' }
        ],
        wednesday: [
            { start: '12:00', end: '15:00' },
            { start: '18:00', end: '22:00' }
        ],
        thursday: [
            { start: '12:00', end: '15:00' },
            { start: '18:00', end: '22:00' }
        ],
        friday: [
            { start: '12:00', end: '15:00' },
            { start: '18:00', end: '22:00' }
        ],
        saturday: [
            { start: '11:00', end: '15:00' },
            { start: '18:00', end: '23:00' }
        ],
        sunday: [
            { start: '11:00', end: '15:00' },
            { start: '18:00', end: '23:00' }
        ]
    },

    // Mínimo de horas de anticipación para reservas
    minBookingHours: 48,

    // Lista de cremas disponibles para personalizar ítems
    sauces: [
        { id: "1", name: "Mayonesa" },
        { id: "2", name: "Kétchup" },
        { id: "3", name: "Mostaza" },
        { id: "4", name: "Salsa BBQ" },
        { id: "5", name: "Crema de Ají" },
        { id: "6", name: "Salsa Picante" },
        { id: "7", name: "Crema de Hierbas" }
    ],

    // Información de la agencia creadora, para el crédito en inicio
    agency: {
        name: "Manguito Publicidad",
        website: "https://manguitopmd.github.io/biolink/",
        whatsapp: "+51961360935",
        socials: {
            instagram: "",
            facebook: "",
            tiktok: ""
        }
    },

    // Redes sociales del negocio, para botones en la página de inicio
    socials: {
        instagram: "https://instagram.com/burgerbonanza",
        facebook: "https://facebook.com/burgerbonanza",
        tiktok: "",
        twitter: "",
        youtube: ""
    }
};