# Bella Indumentaria Femenina

Sistema de gestión para Bella Indumentaria Femenina con autenticación de Firebase y almacenamiento en Realtime Database.

## Estructura del Proyecto

### Archivos Principales
- `index.html` - Página principal de la aplicación
- `login.html` - Página de inicio de sesión
- `clientes.html` - Gestión de clientes
- `stock.html` - Gestión de inventario
- `ventas.html` - Estadísticas de ventas
- `migrate.html` - Herramienta para migrar datos de localStorage a Firebase

### JavaScript
- `app.js` - Lógica principal de la aplicación
- `firebase-config.js` - Configuración de Firebase
- `firebase-auth.js` - Funciones de autenticación con Google
- `firebase-db.js` - Funciones para interactuar con Firebase Realtime Database
- `firebase-sync.js` - Sincronización entre Firebase y localStorage
- `auth-ui.js` - Interfaz de usuario para la autenticación
- `check-auth.js` - Verifica la autenticación en todas las páginas

### CSS
- `style.css` - Estilos principales de la aplicación
- `auth-styles.css` - Estilos para componentes de autenticación

### Otros
- `assets/` - Directorio para imágenes y otros recursos

## Funcionalidades

- **Autenticación**: Inicio de sesión con Google a través de Firebase Authentication
- **Gestión de Stock**: Agregar, editar y eliminar productos del inventario
- **Gestión de Clientes**: Administrar información de clientes y sus compras
- **Ventas**: Visualizar estadísticas de ventas y filtrar por fechas
- **Sincronización**: Los datos se sincronizan automáticamente entre Firebase y localStorage

## Uso

1. Abrir `login.html` para iniciar sesión con Google
2. Una vez autenticado, se redirigirá a la página principal
3. Navegar entre las diferentes secciones usando el menú lateral
4. La información del usuario autenticado se muestra en la parte superior del menú lateral

## Tecnologías Utilizadas

- HTML, CSS y JavaScript
- Tailwind CSS para estilos
- Firebase Authentication para autenticación
- Firebase Realtime Database para almacenamiento de datos
- Font Awesome para iconos
