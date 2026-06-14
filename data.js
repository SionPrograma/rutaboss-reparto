// data.js - Datos Demo

const demoRepartidores = [
    { id: 'r1', nombre: 'Bidal' },
    { id: 'r2', nombre: 'Nico' },
    { id: 'r3', nombre: 'Ayman' }
];

const demoPaquetes = [
    {
        id: 'PAQ-001',
        cliente: 'María López',
        telefono: '610234567',
        direccion: 'Calle Larios 14, 2A, Málaga',
        cobro: true,
        importe: 12,
        etiquetas: ['Horaria', 'Tienda'],
        asignadoId: 'r1',
        estado: 'pendiente',
        llamadas: 0,
        nota: ''
    },
    {
        id: 'PAQ-002',
        cliente: 'Juan Pérez',
        telefono: '600543221',
        direccion: 'Camino Suárez 53, Local 45, Málaga',
        cobro: false,
        importe: 0,
        etiquetas: ['Tienda'],
        asignadoId: 'r2',
        estado: 'pendiente',
        llamadas: 0,
        nota: ''
    },
    {
        id: 'PAQ-003',
        cliente: 'Lucía Fernández',
        telefono: '611876543',
        direccion: 'Av. Miraflores de los Ángeles 4, 3B, Málaga',
        cobro: true,
        importe: 19,
        etiquetas: ['Horaria', 'Bloque'],
        asignadoId: 'r3',
        estado: 'pendiente',
        llamadas: 0,
        nota: ''
    },
    {
        id: 'PAQ-004',
        cliente: 'Carlos Medina',
        telefono: '612345678',
        direccion: 'C/ Emilio Thuillier 22, 1C, Málaga',
        cobro: false,
        importe: 0,
        etiquetas: ['Bloque'],
        asignadoId: 'r1',
        estado: 'pendiente',
        llamadas: 0,
        nota: ''
    },
    {
        id: 'PAQ-005',
        cliente: 'Sofía Ramírez',
        telefono: '613456789',
        direccion: 'Plaza Basconia 1, Local, Málaga',
        cobro: true,
        importe: 8,
        etiquetas: ['Tienda', 'Cobro'],
        asignadoId: 'r1',
        estado: 'pendiente',
        llamadas: 0,
        nota: ''
    }
];

window.appData = {
    repartidores: demoRepartidores,
    paquetes: demoPaquetes
};
