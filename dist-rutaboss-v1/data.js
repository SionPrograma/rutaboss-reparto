// data.js - Datos Demo con Sistema de Rutas y Códigos Físicos

const demoRepartidores = [
    { id: 'r1', nombre: 'Bidal' },
    { id: 'r2', nombre: 'Nico' },
    { id: 'r3', nombre: 'Ayman' }
];

const demoRutas = [
    { 
        id: 'ruta-1', numeroRuta: 1, nombre: 'Ruta 1', color: '#1E3A8A', repartidorAsignado: 'r1',
        tipoGeometria: 'circle', centro: { lat: 36.721, lng: -4.421 }, radio: 500, fechaCreacion: new Date().toISOString()
    },
    { 
        id: 'ruta-2', numeroRuta: 2, nombre: 'Ruta 2', color: '#F59E0B', repartidorAsignado: 'r2',
        tipoGeometria: 'circle', centro: { lat: 36.731, lng: -4.431 }, radio: 600, fechaCreacion: new Date().toISOString()
    },
    { 
        id: 'ruta-3', numeroRuta: 3, nombre: 'Ruta 3', color: '#10B981', repartidorAsignado: 'r3',
        tipoGeometria: 'circle', centro: { lat: 36.741, lng: -4.441 }, radio: 700, fechaCreacion: new Date().toISOString()
    },
    { 
        id: 'ruta-4', numeroRuta: 4, nombre: 'Ruta 4', color: '#EF4444', repartidorAsignado: null,
        tipoGeometria: 'circle', centro: { lat: 36.711, lng: -4.451 }, radio: 500, fechaCreacion: new Date().toISOString()
    }
];

const demoPaquetes = [
    {
        idPaquete: 'PAQ-001',
        numeroEscaneo: 1,
        rutaAsignada: 'ruta-1',
        codigoFisico: '1/1 HORARIA',
        cliente: 'María López',
        telefono: '610234567',
        direccion: 'Calle Larios 14',
        pisoPuerta: '2A',
        esHoraria: true,
        esTienda: true,
        esCobro: true,
        importeCobro: 12,
        esBloque: false,
        estado: 'pendiente',
        codigoEscrito: true,
        llamadas: 0,
        nota: ''
    },
    {
        idPaquete: 'PAQ-002',
        numeroEscaneo: 2,
        rutaAsignada: 'ruta-2',
        codigoFisico: '2/2 TIENDA',
        cliente: 'Juan Pérez',
        telefono: '600543221',
        direccion: 'Camino Suárez 53, Local 45',
        pisoPuerta: '',
        esHoraria: false,
        esTienda: true,
        esCobro: false,
        importeCobro: 0,
        esBloque: false,
        estado: 'pendiente',
        codigoEscrito: true,
        llamadas: 0,
        nota: ''
    },
    {
        idPaquete: 'PAQ-003',
        numeroEscaneo: 3,
        rutaAsignada: 'ruta-3',
        codigoFisico: '3/3 HORARIA',
        cliente: 'Lucía Fernández',
        telefono: '611876543',
        direccion: 'Av. Miraflores de los Ángeles 4',
        pisoPuerta: '3B',
        esHoraria: true,
        esTienda: false,
        esCobro: true,
        importeCobro: 19,
        esBloque: true,
        estado: 'pendiente',
        codigoEscrito: true,
        llamadas: 0,
        nota: ''
    },
    {
        idPaquete: 'PAQ-004',
        numeroEscaneo: 4,
        rutaAsignada: 'ruta-1',
        codigoFisico: '4/1 BLOQUE',
        cliente: 'Carlos Medina',
        telefono: '612345678',
        direccion: 'C/ Emilio Thuillier 22',
        pisoPuerta: '1C',
        esHoraria: false,
        esTienda: false,
        esCobro: false,
        importeCobro: 0,
        esBloque: true,
        estado: 'pendiente',
        codigoEscrito: true,
        llamadas: 0,
        nota: ''
    },
    {
        idPaquete: 'PAQ-005',
        numeroEscaneo: 5,
        rutaAsignada: 'ruta-1',
        codigoFisico: '5/1 TIENDA',
        cliente: 'Sofía Ramírez',
        telefono: '613456789',
        direccion: 'Plaza Basconia 1, Local',
        pisoPuerta: '',
        esHoraria: false,
        esTienda: true,
        esCobro: true,
        importeCobro: 8,
        esBloque: false,
        estado: 'pendiente',
        codigoEscrito: true,
        llamadas: 0,
        nota: ''
    }
];

window.appData = {
    repartidores: demoRepartidores,
    rutas: demoRutas,
    paquetes: demoPaquetes,
    globalScanCounter: 5
};
