// firebase-sync.js - Sincronización entre Firebase y localStorage
import { app } from './firebase-config.js';
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import * as firebaseDB from './firebase-db.js';

// Constantes para las claves de almacenamiento
const STOCK_STORAGE_KEY = 'bella_stock';
const CLIENTS_STORAGE_KEY = 'bella_clients';
const SALES_STORAGE_KEY = 'bella_sales';
const NEXT_CLIENT_ID_KEY = 'bella_nextClientId';

// Inicializar la base de datos
const db = getDatabase(app);

// Función para sincronizar datos de Firebase a localStorage
async function syncFromFirebase() {
    console.log('Sincronizando datos desde Firebase a localStorage...');
    
    try {
        // Sincronizar stock
        const stockData = await firebaseDB.getStockFromFirebase();
        if (Array.isArray(stockData)) {
            localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(stockData));
            console.log('Stock sincronizado desde Firebase a localStorage');
        } else {
            console.warn('Los datos de stock de Firebase no son un array válido');
        }
        
        // Sincronizar clientes
        const clientsData = await firebaseDB.getClientsFromFirebase();
        if (Array.isArray(clientsData)) {
            localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clientsData));
            console.log('Clientes sincronizados desde Firebase a localStorage');
        } else {
            console.warn('Los datos de clientes de Firebase no son un array válido');
        }
        
        // Sincronizar ventas
        const salesData = await firebaseDB.getSalesFromFirebase();
        if (Array.isArray(salesData)) {
            localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(salesData));
            console.log('Ventas sincronizadas desde Firebase a localStorage');
        } else {
            console.warn('Los datos de ventas de Firebase no son un array válido');
        }
        
        // Sincronizar próximo ID de cliente
        const nextClientId = await firebaseDB.getNextClientIdFromFirebase();
        if (typeof nextClientId === 'number') {
            localStorage.setItem(NEXT_CLIENT_ID_KEY, nextClientId.toString());
            console.log('Próximo ID de cliente sincronizado desde Firebase a localStorage');
        } else {
            console.warn('El próximo ID de cliente de Firebase no es un número válido');
        }
        
        console.log('Sincronización desde Firebase completada');
        return true;
    } catch (error) {
        console.error('Error al sincronizar datos desde Firebase:', error);
        return false;
    }
}

// Configurar listeners para cambios en Firebase
function setupFirebaseListeners() {
    console.log('Configurando listeners para cambios en Firebase...');
    
    // Listener para cambios en stock
    const stockRef = ref(db, 'stock');
    onValue(stockRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (Array.isArray(data)) {
                localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(data));
                console.log('Stock actualizado automáticamente desde Firebase');
            } else {
                console.warn('Los datos de stock recibidos de Firebase no son un array válido');
            }
        } else {
            console.log('No hay datos de stock en Firebase');
        }
    });
    
    // Listener para cambios en clientes
    const clientsRef = ref(db, 'clients');
    onValue(clientsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (Array.isArray(data)) {
                localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(data));
                console.log('Clientes actualizados automáticamente desde Firebase');
            } else {
                console.warn('Los datos de clientes recibidos de Firebase no son un array válido');
            }
        } else {
            console.log('No hay datos de clientes en Firebase');
        }
    });
    
    // Listener para cambios en ventas
    const salesRef = ref(db, 'sales');
    onValue(salesRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (Array.isArray(data)) {
                localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(data));
                console.log('Ventas actualizadas automáticamente desde Firebase');
            } else {
                console.warn('Los datos de ventas recibidos de Firebase no son un array válido');
            }
        } else {
            console.log('No hay datos de ventas en Firebase');
        }
    });
    
    // Listener para cambios en próximo ID de cliente
    const nextClientIdRef = ref(db, 'nextClientId');
    onValue(nextClientIdRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (typeof data === 'number') {
                localStorage.setItem(NEXT_CLIENT_ID_KEY, data.toString());
                console.log('Próximo ID de cliente actualizado automáticamente desde Firebase');
            } else {
                console.warn('El próximo ID de cliente recibido de Firebase no es un número válido');
            }
        } else {
            console.log('No hay próximo ID de cliente en Firebase');
        }
    });
    
    console.log('Listeners de Firebase configurados correctamente');
}

// Función para sincronizar datos de localStorage a Firebase
async function syncToFirebase() {
    console.log('Sincronizando datos desde localStorage a Firebase...');
    
    try {
        // Sincronizar stock
        const stockData = JSON.parse(localStorage.getItem(STOCK_STORAGE_KEY) || '[]');
        await firebaseDB.saveStockToFirebase(stockData);
        console.log('Stock sincronizado desde localStorage a Firebase');
        
        // Sincronizar clientes
        const clientsData = JSON.parse(localStorage.getItem(CLIENTS_STORAGE_KEY) || '[]');
        await firebaseDB.saveClientsToFirebase(clientsData);
        console.log('Clientes sincronizados desde localStorage a Firebase');
        
        // Sincronizar ventas
        const salesData = JSON.parse(localStorage.getItem(SALES_STORAGE_KEY) || '[]');
        await firebaseDB.saveSalesToFirebase(salesData);
        console.log('Ventas sincronizadas desde localStorage a Firebase');
        
        // Sincronizar próximo ID de cliente
        const nextClientId = parseInt(localStorage.getItem(NEXT_CLIENT_ID_KEY) || '1');
        await firebaseDB.saveNextClientIdToFirebase(nextClientId);
        console.log('Próximo ID de cliente sincronizado desde localStorage a Firebase');
        
        console.log('Sincronización a Firebase completada');
        return true;
    } catch (error) {
        console.error('Error al sincronizar datos a Firebase:', error);
        return false;
    }
}

// Función para sobrescribir las funciones de almacenamiento originales
function overrideStorageFunctions() {
    console.log('Sobrescribiendo funciones de almacenamiento...');
    
    // Guardar las funciones originales
    const originalSaveStockData = window.saveStockData;
    const originalSaveClientsData = window.saveClientsData;
    const originalSaveSalesData = window.saveSalesData;
    
    // Sobrescribir saveStockData
    if (typeof originalSaveStockData === 'function') {
        window.saveStockData = function(data) {
            // Primero guardar en localStorage usando la función original
            originalSaveStockData(data);
            
            // Luego guardar en Firebase
            firebaseDB.saveStockToFirebase(data)
                .catch(error => console.error('Error al guardar stock en Firebase:', error));
            
            return true;
        };
    }
    
    // Sobrescribir saveClientsData
    if (typeof originalSaveClientsData === 'function') {
        window.saveClientsData = function(data) {
            // Primero guardar en localStorage usando la función original
            originalSaveClientsData(data);
            
            // Luego guardar en Firebase
            firebaseDB.saveClientsToFirebase(data)
                .catch(error => console.error('Error al guardar clientes en Firebase:', error));
            
            return true;
        };
    }
    
    // Sobrescribir saveSalesData
    if (typeof originalSaveSalesData === 'function') {
        window.saveSalesData = function(data) {
            // Primero guardar en localStorage usando la función original
            originalSaveSalesData(data);
            
            // Luego guardar en Firebase
            firebaseDB.saveSalesToFirebase(data)
                .catch(error => console.error('Error al guardar ventas en Firebase:', error));
            
            return true;
        };
    }
    
    // Sobrescribir getNextClientId y incrementNextClientId
    const originalGetNextClientId = window.getNextClientId;
    if (typeof originalGetNextClientId === 'function') {
        window.incrementNextClientId = function() {
            // Obtener el ID actual
            const currentId = originalGetNextClientId();
            
            // Incrementar el ID
            const nextId = currentId + 1;
            
            // Guardar en localStorage
            localStorage.setItem(NEXT_CLIENT_ID_KEY, nextId.toString());
            
            // Guardar en Firebase
            firebaseDB.saveNextClientIdToFirebase(nextId)
                .catch(error => console.error('Error al guardar próximo ID de cliente en Firebase:', error));
            
            return nextId;
        };
    }
    
    console.log('Funciones de almacenamiento sobrescritas correctamente');
}

// Inicializar la sincronización
async function initSync() {
    console.log('Inicializando sincronización con Firebase...');
    
    // Primero intentar sincronizar desde Firebase a localStorage
    const syncFromResult = await syncFromFirebase();
    
    // Si no hay datos en Firebase, sincronizar desde localStorage a Firebase
    if (!syncFromResult) {
        console.log('No se pudieron obtener datos de Firebase, intentando sincronizar desde localStorage...');
        await syncToFirebase();
    }
    
    // Configurar listeners para cambios en Firebase
    setupFirebaseListeners();
    
    // Sobrescribir funciones de almacenamiento
    overrideStorageFunctions();
    
    console.log('Sincronización con Firebase inicializada correctamente');
}

// Iniciar la sincronización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initSync);

// Exportar funciones para uso externo
export { syncFromFirebase, syncToFirebase, setupFirebaseListeners };
