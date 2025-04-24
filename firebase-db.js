// firebase-db.js - Funciones para interactuar con Firebase Realtime Database
import { app } from './firebase-config.js';
import { getDatabase, ref, set, get, update, remove, push, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

// Inicializar la base de datos
const db = getDatabase(app);

// Constantes para las referencias de la base de datos
const STOCK_REF = 'stock';
const CLIENTS_REF = 'clients';
const SALES_REF = 'sales';
const NEXT_CLIENT_ID_REF = 'nextClientId';

// ======== Funciones para Stock ========

/**
 * Guarda los datos de stock en Firebase
 * @param {Array} stockData - Array con los datos de stock
 * @returns {Promise} - Promesa que se resuelve cuando se completa la operación
 */
export async function saveStockToFirebase(stockData) {
    try {
        await set(ref(db, STOCK_REF), stockData);
        console.log('Datos de stock guardados en Firebase');
        return true;
    } catch (error) {
        console.error('Error al guardar datos de stock en Firebase:', error);
        throw error;
    }
}

/**
 * Obtiene los datos de stock desde Firebase
 * @returns {Promise<Array>} - Promesa que se resuelve con los datos de stock
 */
export async function getStockFromFirebase() {
    try {
        const snapshot = await get(ref(db, STOCK_REF));
        if (snapshot.exists()) {
            console.log('Datos de stock obtenidos de Firebase');
            const data = snapshot.val();
            // Asegurarse de que el resultado sea un array
            if (Array.isArray(data)) {
                return data;
            } else {
                console.warn('Los datos de stock en Firebase no son un array, convirtiendo a array vacío');
                return [];
            }
        } else {
            console.log('No hay datos de stock en Firebase');
            return [];
        }
    } catch (error) {
        console.error('Error al obtener datos de stock de Firebase:', error);
        return []; // Devolver array vacío en caso de error en lugar de lanzar excepción
    }
}

/**
 * Configura un listener para cambios en el stock
 * @param {Function} callback - Función a ejecutar cuando cambian los datos
 * @returns {Function} - Función para desuscribirse del listener
 */
export function onStockChange(callback) {
    const stockRef = ref(db, STOCK_REF);
    const unsubscribe = onValue(stockRef, (snapshot) => {
        const data = snapshot.exists() ? snapshot.val() : [];
        callback(data);
    });
    return unsubscribe;
}

// ======== Funciones para Clientes ========

/**
 * Guarda los datos de clientes en Firebase
 * @param {Array} clientsData - Array con los datos de clientes
 * @returns {Promise} - Promesa que se resuelve cuando se completa la operación
 */
export async function saveClientsToFirebase(clientsData) {
    try {
        await set(ref(db, CLIENTS_REF), clientsData);
        console.log('Datos de clientes guardados en Firebase');
        return true;
    } catch (error) {
        console.error('Error al guardar datos de clientes en Firebase:', error);
        throw error;
    }
}

/**
 * Obtiene los datos de clientes desde Firebase
 * @returns {Promise<Array>} - Promesa que se resuelve con los datos de clientes
 */
export async function getClientsFromFirebase() {
    try {
        const snapshot = await get(ref(db, CLIENTS_REF));
        if (snapshot.exists()) {
            console.log('Datos de clientes obtenidos de Firebase');
            const data = snapshot.val();
            // Asegurarse de que el resultado sea un array
            if (Array.isArray(data)) {
                return data;
            } else {
                console.warn('Los datos de clientes en Firebase no son un array, convirtiendo a array vacío');
                return [];
            }
        } else {
            console.log('No hay datos de clientes en Firebase');
            return [];
        }
    } catch (error) {
        console.error('Error al obtener datos de clientes de Firebase:', error);
        return []; // Devolver array vacío en caso de error en lugar de lanzar excepción
    }
}

/**
 * Configura un listener para cambios en los clientes
 * @param {Function} callback - Función a ejecutar cuando cambian los datos
 * @returns {Function} - Función para desuscribirse del listener
 */
export function onClientsChange(callback) {
    const clientsRef = ref(db, CLIENTS_REF);
    const unsubscribe = onValue(clientsRef, (snapshot) => {
        const data = snapshot.exists() ? snapshot.val() : [];
        callback(data);
    });
    return unsubscribe;
}

/**
 * Guarda el próximo ID de cliente en Firebase
 * @param {number} nextId - El próximo ID a usar
 * @returns {Promise} - Promesa que se resuelve cuando se completa la operación
 */
export async function saveNextClientIdToFirebase(nextId) {
    try {
        await set(ref(db, NEXT_CLIENT_ID_REF), nextId);
        console.log('Próximo ID de cliente guardado en Firebase');
        return true;
    } catch (error) {
        console.error('Error al guardar próximo ID de cliente en Firebase:', error);
        throw error;
    }
}

/**
 * Obtiene el próximo ID de cliente desde Firebase
 * @returns {Promise<number>} - Promesa que se resuelve con el próximo ID
 */
export async function getNextClientIdFromFirebase() {
    try {
        const snapshot = await get(ref(db, NEXT_CLIENT_ID_REF));
        if (snapshot.exists()) {
            console.log('Próximo ID de cliente obtenido de Firebase');
            return snapshot.val();
        } else {
            console.log('No hay próximo ID de cliente en Firebase, usando 1');
            return 1;
        }
    } catch (error) {
        console.error('Error al obtener próximo ID de cliente de Firebase:', error);
        throw error;
    }
}

// ======== Funciones para Ventas ========

/**
 * Guarda los datos de ventas en Firebase
 * @param {Array} salesData - Array con los datos de ventas
 * @returns {Promise} - Promesa que se resuelve cuando se completa la operación
 */
export async function saveSalesToFirebase(salesData) {
    try {
        await set(ref(db, SALES_REF), salesData);
        console.log('Datos de ventas guardados en Firebase');
        return true;
    } catch (error) {
        console.error('Error al guardar datos de ventas en Firebase:', error);
        throw error;
    }
}

/**
 * Obtiene los datos de ventas desde Firebase
 * @returns {Promise<Array>} - Promesa que se resuelve con los datos de ventas
 */
export async function getSalesFromFirebase() {
    try {
        const snapshot = await get(ref(db, SALES_REF));
        if (snapshot.exists()) {
            console.log('Datos de ventas obtenidos de Firebase');
            const data = snapshot.val();
            // Asegurarse de que el resultado sea un array
            if (Array.isArray(data)) {
                return data;
            } else {
                console.warn('Los datos de ventas en Firebase no son un array, convirtiendo a array vacío');
                return [];
            }
        } else {
            console.log('No hay datos de ventas en Firebase');
            return [];
        }
    } catch (error) {
        console.error('Error al obtener datos de ventas de Firebase:', error);
        return []; // Devolver array vacío en caso de error en lugar de lanzar excepción
    }
}

/**
 * Configura un listener para cambios en las ventas
 * @param {Function} callback - Función a ejecutar cuando cambian los datos
 * @returns {Function} - Función para desuscribirse del listener
 */
export function onSalesChange(callback) {
    const salesRef = ref(db, SALES_REF);
    const unsubscribe = onValue(salesRef, (snapshot) => {
        const data = snapshot.exists() ? snapshot.val() : [];
        callback(data);
    });
    return unsubscribe;
}

// ======== Función para migrar datos de localStorage a Firebase ========

/**
 * Migra todos los datos de localStorage a Firebase
 * @returns {Promise} - Promesa que se resuelve cuando se completa la migración
 */
export async function migrateLocalStorageToFirebase() {
    try {
        // Obtener datos de localStorage
        const stockData = JSON.parse(localStorage.getItem('bella_stock')) || [];
        const clientsData = JSON.parse(localStorage.getItem('bella_clients')) || [];
        const salesData = JSON.parse(localStorage.getItem('bella_sales')) || [];
        const nextClientId = parseInt(localStorage.getItem('bella_nextClientId')) || 1;
        
        // Guardar datos en Firebase
        await saveStockToFirebase(stockData);
        await saveClientsToFirebase(clientsData);
        await saveSalesToFirebase(salesData);
        await saveNextClientIdToFirebase(nextClientId);
        
        console.log('Migración de datos a Firebase completada con éxito');
        return true;
    } catch (error) {
        console.error('Error durante la migración de datos a Firebase:', error);
        throw error;
    }
}
