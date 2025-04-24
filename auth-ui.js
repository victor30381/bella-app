// auth-ui.js - Interfaz de usuario para autenticación
import { signInWithGoogle, signOutUser, getCurrentUser, isUserAuthenticated } from './firebase-auth.js';

// Función para integrar la autenticación en el menú hamburguesa
function integrateAuthInMenu() {
    // Buscar el menú lateral
    const sideMenu = document.querySelector('.side-menu');
    if (!sideMenu) {
        console.error('No se encontró el menú lateral');
        return;
    }
    
    // Verificar si ya existe el contenedor de autenticación en el menú
    if (sideMenu.querySelector('#auth-menu-container')) {
        return;
    }
    
    // Crear el contenedor de autenticación para el menú
    const authMenuContainer = document.createElement('div');
    authMenuContainer.id = 'auth-menu-container';
    authMenuContainer.className = 'auth-menu-container';
    
    // Actualizar el contenido según el estado de autenticación
    updateAuthInMenu(authMenuContainer);
    
    // Insertar al principio del menú, después del encabezado
    const menuHeader = sideMenu.querySelector('.p-4.border-b');
    if (menuHeader && menuHeader.nextSibling) {
        sideMenu.insertBefore(authMenuContainer, menuHeader.nextSibling);
    } else {
        // Si no se encuentra el encabezado, agregar al principio del menú
        sideMenu.prepend(authMenuContainer);
    }
}

// Función para actualizar la autenticación en el menú
function updateAuthInMenu(container = document.getElementById('auth-menu-container')) {
    if (!container) return;
    
    const user = getCurrentUser();
    
    if (user) {
        // Usuario autenticado
        container.innerHTML = `
            <div class="p-4 border-b border-gray-200">
                <div class="flex items-center mb-2">
                    <img src="${user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'Usuario')}" alt="Avatar" class="w-10 h-10 rounded-full mr-3">
                    <div>
                        <div class="font-medium text-gray-800">${user.displayName || 'Usuario'}</div>
                        <div class="text-sm text-gray-500">${user.email || ''}</div>
                    </div>
                </div>
                <button id="auth-logout-button" class="w-full mt-2 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition duration-200 flex items-center justify-center">
                    <i class="fas fa-sign-out-alt mr-2"></i> Cerrar sesión
                </button>
            </div>
        `;
        
        // Agregar evento al botón de cerrar sesión
        const logoutButton = container.querySelector('#auth-logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                try {
                    await signOutUser();
                    // El redireccionamiento a login.html se maneja en el evento authStateChanged
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                    alert('Error al cerrar sesión. Por favor, intenta nuevamente.');
                }
            });
        }
    } else {
        // Usuario no autenticado (no debería ocurrir en las páginas protegidas)
        container.innerHTML = `
            <div class="p-4 border-b border-gray-200">
                <button id="auth-login-button" class="w-full py-2 px-4 bg-brand-fuchsia hover:bg-brand-fuchsia-dark text-white rounded-md transition duration-200 flex items-center justify-center">
                    <i class="fas fa-sign-in-alt mr-2"></i> Iniciar sesión
                </button>
            </div>
        `;
        
        // Agregar evento al botón de iniciar sesión
        const loginButton = container.querySelector('#auth-login-button');
        if (loginButton) {
            loginButton.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    }
}

// Función para crear el modal de autenticación
function createAuthModal() {
    // Verificar si ya existe
    if (document.getElementById('auth-modal')) {
        return;
    }
    
    // Crear el modal
    const authModal = document.createElement('div');
    authModal.id = 'auth-modal';
    authModal.className = 'auth-modal';
    
    authModal.innerHTML = `
        <div class="auth-modal-content">
            <h2 class="auth-modal-title">Iniciar sesión</h2>
            <p class="auth-modal-text">Inicia sesión para acceder a todas las funcionalidades de Bella Indumentaria Femenina.</p>
            
            <button id="auth-google-button" class="auth-google-button">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="auth-google-icon">
                Continuar con Google
            </button>
            
            <button id="auth-cancel-button" class="auth-cancel-button">Cancelar</button>
        </div>
    `;
    
    // Agregar eventos
    const googleButton = authModal.querySelector('#auth-google-button');
    const cancelButton = authModal.querySelector('#auth-cancel-button');
    
    googleButton.addEventListener('click', async () => {
        try {
            await signInWithGoogle();
            hideAuthModal();
            updateAuthComponent();
        } catch (error) {
            console.error('Error al iniciar sesión con Google:', error);
            alert('Error al iniciar sesión con Google. Por favor, intenta nuevamente.');
        }
    });
    
    cancelButton.addEventListener('click', () => {
        hideAuthModal();
    });
    
    // Agregar al body
    document.body.appendChild(authModal);
}

// Función para mostrar el modal de autenticación
function showAuthModal() {
    const authModal = document.getElementById('auth-modal') || createAuthModal();
    authModal.classList.add('active');
}

// Función para ocultar el modal de autenticación
function hideAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.remove('active');
    }
}

// Función para proteger una página
export function protectPage() {
    if (!isUserAuthenticated()) {
        // Redirigir a la página de login si no está autenticado
        window.location.href = 'login.html';
    }
}

// Función para inicializar la autenticación en la UI
export function initAuthUI() {
    // Verificar si el usuario está autenticado
    if (!isUserAuthenticated() && window.location.pathname !== '/login.html') {
        // Redirigir a la página de login si no está autenticado y no estamos ya en la página de login
        window.location.href = 'login.html';
        return;
    }
    
    // Esperar a que el DOM esté completamente cargado para integrar la autenticación en el menú
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(integrateAuthInMenu, 100); // Pequeño retraso para asegurar que el menú esté cargado
        });
    } else {
        setTimeout(integrateAuthInMenu, 100);
    }
    
    // Crear el modal de autenticación (por si se necesita)
    createAuthModal();
    
    // Escuchar cambios en el estado de autenticación
    window.addEventListener('authStateChanged', (event) => {
        // Actualizar la información en el menú
        const authMenuContainer = document.getElementById('auth-menu-container');
        if (authMenuContainer) {
            updateAuthInMenu(authMenuContainer);
        }
        
        // Si el usuario cerró sesión, redirigir a la página de login
        if (!event.detail.user && window.location.pathname !== '/login.html') {
            window.location.href = 'login.html';
        }
    });
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initAuthUI);
