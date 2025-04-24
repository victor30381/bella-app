// firebase-auth.js - Autenticación con Google para Bella Indumentaria Femenina
import { app } from './firebase-config.js';
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Inicializar Firebase Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Variable para almacenar el usuario actual
let currentUser = null;

// Función para iniciar sesión con Google
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        // El usuario ha iniciado sesión correctamente
        currentUser = result.user;
        console.log('Usuario autenticado:', currentUser.displayName);
        
        // Guardar información básica del usuario en localStorage
        localStorage.setItem('bella_user', JSON.stringify({
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL
        }));
        
        // Disparar evento de cambio de estado de autenticación
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: currentUser } }));
        
        return currentUser;
    } catch (error) {
        console.error('Error al iniciar sesión con Google:', error);
        throw error;
    }
}

// Función para cerrar sesión
export async function signOutUser() {
    try {
        await signOut(auth);
        // El usuario ha cerrado sesión correctamente
        currentUser = null;
        console.log('Usuario desconectado');
        
        // Eliminar información del usuario de localStorage
        localStorage.removeItem('bella_user');
        
        // Disparar evento de cambio de estado de autenticación
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: null } }));
        
        return true;
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        throw error;
    }
}

// Función para obtener el usuario actual
export function getCurrentUser() {
    return currentUser || JSON.parse(localStorage.getItem('bella_user') || 'null');
}

// Función para verificar si el usuario está autenticado
export function isUserAuthenticated() {
    return currentUser !== null || localStorage.getItem('bella_user') !== null;
}

// Configurar listener para cambios en el estado de autenticación
export function setupAuthListener() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuario ha iniciado sesión
            currentUser = user;
            console.log('Usuario autenticado:', user.displayName);
            
            // Guardar información básica del usuario en localStorage
            localStorage.setItem('bella_user', JSON.stringify({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            }));
            
            // Disparar evento de cambio de estado de autenticación
            window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
        } else {
            // Usuario ha cerrado sesión
            currentUser = null;
            console.log('Usuario no autenticado');
            
            // Eliminar información del usuario de localStorage si existe
            if (localStorage.getItem('bella_user')) {
                localStorage.removeItem('bella_user');
                
                // Disparar evento de cambio de estado de autenticación
                window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: null } }));
            }
        }
    });
}

// Inicializar el listener de autenticación cuando se carga el documento
document.addEventListener('DOMContentLoaded', setupAuthListener);
