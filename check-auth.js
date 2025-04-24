// check-auth.js - Verifica la autenticación en todas las páginas excepto login.html
document.addEventListener('DOMContentLoaded', function() {
    // Obtener la ruta actual
    const currentPath = window.location.pathname;
    
    // Si estamos en login.html, no hacer nada
    if (currentPath.endsWith('/login.html')) {
        return;
    }
    
    // Verificar si el usuario está autenticado
    const user = JSON.parse(localStorage.getItem('bella_user'));
    
    // Si no está autenticado, redirigir a login.html
    if (!user) {
        window.location.href = 'login.html';
    }
});
