// app.js - Lógica para Bella Indumentaria Femenina

// --- Constantes Globales ---
const SIZES = ['S', 'M', 'L', 'XL', 'O'];
const STOCK_STORAGE_KEY = 'bella_stock';
const CLIENTS_STORAGE_KEY = 'bella_clients';
const SALES_STORAGE_KEY = 'bella_sales';
const NEXT_CLIENT_ID_KEY = 'bella_nextClientId';

// --- Funciones de Utilidad Comunes ---

/**
 * Muestra un mensaje de feedback al usuario en un área designada.
 * @param {string} text - El texto del mensaje.
 * @param {string} type - 'success', 'error' o 'info'.
 * @param {string} areaId - El ID del elemento contenedor del mensaje (default: 'messageArea').
 */
function showMessage(text, type = 'success', areaId = 'messageArea') {
    const area = document.getElementById(areaId);
    if (area) {
        area.innerHTML = `
            <div class="message ${type === 'success' ? 'message-success' : 'message-error'}">
                ${text}
            </div>
        `;
        setTimeout(() => {
            area.innerHTML = '';
        }, 3000);
    }
}

/**
 * Formatea un número como moneda (ARS - Peso Argentino).
 * @param {number | string} number - El número a formatear.
 * @returns {string} - El número formateado como moneda.
 */
function formatCurrency(number) {
    const num = Number(number); // Ya no multiplicamos por 1000 aquí
    if (isNaN(num)) {
        return new Intl.NumberFormat('es-AR', { 
            style: 'currency', 
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(0);
    }
    return new Intl.NumberFormat('es-AR', { 
        style: 'currency', 
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
}

/**
 * Formatea una fecha ISO string a un formato legible (DD/MM/AAAA HH:MM).
 * @param {string} isoString - La fecha en formato ISO.
 * @returns {string} - La fecha formateada o 'Fecha inválida'.
 */
function formatDate(isoString) {
    if (!isoString) return 'Fecha inválida';
    try {
        const date = new Date(isoString);
        // Opciones para formato más legible
        const options = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false // Formato 24hs
        };
        // Intl.DateTimeFormat es más robusto que toLocaleString para consistencia
        return new Intl.DateTimeFormat('es-AR', options).format(date).replace(',', ''); // Formato DD/MM/AAAA HH:MM
    } catch (e) {
        console.error("Error formatting date:", isoString, e);
        return 'Fecha inválida';
    }
}

// --- Funciones de Datos (localStorage) ---

function getStorageData(key) {
    const data = localStorage.getItem(key);
    try {
        return data ? JSON.parse(data) : (key === NEXT_CLIENT_ID_KEY ? 1 : []); // Default a 1 para ID, array vacío para otros
    } catch (e) {
        console.error(`Error parsing data from localStorage (key: ${key}):`, e);
        showMessage(`Error al cargar datos (${key}). Se usarán datos vacíos.`, "error");
        return (key === NEXT_CLIENT_ID_KEY ? 1 : []); // Retorna default seguro en caso de error
    }
}

function saveStorageData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Error saving data to localStorage (key: ${key}):`, e);
        showMessage(`Error al guardar los datos (${key}).`, "error");
    }
}

function getStockData() {
    try {
        const data = localStorage.getItem(STOCK_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error al leer datos de stock:', error);
        localStorage.removeItem(STOCK_STORAGE_KEY);
        return [];
    }
}

function saveStockData(data) {
    try {
        localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error al guardar datos de stock:', error);
        showMessage('Error al guardar los datos', 'error');
    }
}

function getClientsData() {
    try {
        const data = localStorage.getItem(CLIENTS_STORAGE_KEY);
        if (!data) {
            console.log('No hay datos de clientes en localStorage');
            return [];
        }
        const parsedData = JSON.parse(data);
        if (!Array.isArray(parsedData)) {
            console.error('Los datos de clientes no son un array válido');
            return [];
        }
        return parsedData;
    } catch (error) {
        console.error('Error al leer datos de clientes:', error);
        localStorage.removeItem(CLIENTS_STORAGE_KEY);
        return [];
    }
}

function saveClientsData(data) {
    try {
        if (!Array.isArray(data)) {
            console.error('Los datos a guardar no son un array válido');
            return;
        }
        localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error al guardar datos de clientes:', error);
        showMessage('Error al guardar los datos de clientes', 'error');
    }
}

function getSalesData() {
    try {
        const data = localStorage.getItem(SALES_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error al leer datos de ventas:', error);
        localStorage.removeItem(SALES_STORAGE_KEY);
        return [];
    }
}

function saveSalesData(data) {
    try {
        localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error al guardar datos de ventas:', error);
        showMessage('Error al guardar los datos', 'error');
    }
}

function getNextClientId() {
    let nextId = getStorageData(NEXT_CLIENT_ID_KEY);
    if (typeof nextId !== 'number' || nextId < 1) {
        nextId = 1; // Resetear si no es válido
    }
    saveStorageData(NEXT_CLIENT_ID_KEY, nextId + 1);
    return nextId;
}


// ==========================================================================
// --- LÓGICA ESPECÍFICA DE LA PÁGINA DE STOCK (stock.html) ---
// ==========================================================================

function initStockPage() {
    console.log("Initializing Stock Page...");
    const addItemForm = document.getElementById('addItemForm');
    const stockTableBody = document.getElementById('stockTableBody');

    if (!addItemForm || !stockTableBody) {
        console.error("Stock page elements not found!");
        return;
    }

    /** Renderiza la tabla de stock completa. */
    function renderStockTable() {
        const stockTableBody = document.getElementById('stockTableBody');
        stockTableBody.innerHTML = '';

        const stockData = getStockData();
        if (stockData.length === 0) {
            stockTableBody.innerHTML = `
                <tr>
                    <td colspan="${3 + SIZES.length + 1}" class="text-center py-4 text-gray-500" role="alert">
                        No hay prendas en el stock. Agrega una nueva.
                    </td>
                </tr>
            `;
            return;
        }

        // Ordenar stock por nombre de prenda
        stockData.sort((a, b) => a.name.localeCompare(b.name));

        stockData.forEach(item => {
            const row = document.createElement('tr');
            row.classList.add('hover:bg-gray-50');

            // Celda Nombre
            const nameCell = document.createElement('td');
            nameCell.className = 'px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900';
            nameCell.textContent = item.name;
            nameCell.setAttribute('role', 'cell');
            row.appendChild(nameCell);

            // Celda Precio de Costo
            const costPriceCell = document.createElement('td');
            costPriceCell.className = 'px-4 py-3 whitespace-nowrap text-sm text-gray-500';
            costPriceCell.textContent = formatCurrency(item.costPrice || 0);
            costPriceCell.setAttribute('role', 'cell');
            row.appendChild(costPriceCell);

            // Celda Precio de Venta
            const priceCell = document.createElement('td');
            priceCell.className = 'px-4 py-3 whitespace-nowrap text-sm text-gray-500';
            priceCell.textContent = formatCurrency(item.price || 0);
            priceCell.setAttribute('role', 'cell');
            row.appendChild(priceCell);

            // Celdas Talles
            SIZES.forEach(size => {
                const sizeCell = document.createElement('td');
                sizeCell.className = 'px-2 py-3 text-center';
                sizeCell.setAttribute('role', 'cell');
                
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.value = item.sizes[size] || 0;
                input.dataset.itemName = item.name;
                input.dataset.size = size;
                input.setAttribute('aria-label', `Cantidad de ${item.name} en talle ${size}`);
                input.classList.add('stock-quantity-input', 'border', 'border-gray-300', 'rounded-md', 'focus:ring-brand-violet', 'focus:border-brand-violet', 'w-20', 'text-center');
                sizeCell.appendChild(input);
                row.appendChild(sizeCell);
            });

            // Celda Acciones
            const actionsCell = document.createElement('td');
            actionsCell.className = 'px-4 py-3 text-center whitespace-nowrap text-sm font-medium';
            actionsCell.setAttribute('role', 'cell');
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'text-red-600 hover:text-red-800 deleteItemBtn';
            deleteButton.dataset.itemName = item.name;
            deleteButton.innerHTML = '<i class="fas fa-trash-alt" aria-hidden="true"></i>';
            deleteButton.setAttribute('aria-label', `Eliminar ${item.name}`);
            deleteButton.title = 'Eliminar prenda';
            actionsCell.appendChild(deleteButton);
            row.appendChild(actionsCell);

            stockTableBody.appendChild(row);
        });
    }

    /** Maneja el envío del formulario para agregar una nueva prenda. */
    function handleAddItem(event) {
        event.preventDefault();
        const itemNameInput = document.getElementById('itemName');
        const itemCostPriceInput = document.getElementById('itemCostPrice');
        const itemPriceInput = document.getElementById('itemPrice');
        const name = itemNameInput.value.trim();
        const costPrice = parseFloat(itemCostPriceInput.value); // Ya no dividimos por 1000
        const price = parseFloat(itemPriceInput.value); // Ya no dividimos por 1000

        // Validaciones
        if (!name) {
            showMessage("El nombre de la prenda no puede estar vacío.", "error");
            itemNameInput.focus(); return;
        }
        if (isNaN(costPrice) || costPrice < 0) {
            showMessage("Ingresa un precio de costo válido (mayor o igual a 0).", "error");
            itemCostPriceInput.focus(); return;
        }
        if (isNaN(price) || price < 0) {
            showMessage("Ingresa un precio de venta válido (mayor o igual a 0).", "error");
            itemPriceInput.focus(); return;
        }

        const stockData = getStockData();
        const existingItem = stockData.find(item => item.name.toLowerCase() === name.toLowerCase());
        if (existingItem) {
            showMessage(`La prenda "${name}" ya existe en el stock.`, "error"); return;
        }

        // Generar un color aleatorio en formato HSL para asegurar colores distintos y agradables
        const hue = Math.floor(Math.random() * 360); // Tono aleatorio
        const color = `hsl(${hue}, 70%, 65%)`; // Saturación y luminosidad fijas para colores agradables

        // Crear nuevo item con color
        const newItem = {
            name: name,
            costPrice: costPrice,
            price: price,
            color: color,
            sizes: SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}) // Inicializar talles en 0
        };

        stockData.push(newItem);
        saveStockData(stockData);

        itemNameInput.value = '';
        itemCostPriceInput.value = '';
        itemPriceInput.value = '';
        renderStockTable();
        showMessage(`Prenda "${name}" agregada correctamente.`, "success");
        itemNameInput.focus();
    }

    /** Maneja el cambio en un input de cantidad de stock. */
    function handleQuantityChange(event) {
        const input = event.target;
        if (!input.classList.contains('stock-quantity-input') || !input.closest('#stockTableBody')) {
            return;
        }

        const itemName = input.dataset.itemName;
        const size = input.dataset.size;
        let newQuantity = parseInt(input.value, 10);

        // Validación: asegurar que sea un número no negativo
        if (isNaN(newQuantity) || newQuantity < 0) {
            showMessage("La cantidad debe ser un número mayor o igual a 0.", "error");
            const stockData = getStockData();
            const item = stockData.find(i => i.name === itemName);
            input.value = item?.sizes?.[size] || 0;
            return;
        }

        // Actualizar los datos
        const stockData = getStockData();
        const itemIndex = stockData.findIndex(item => item.name === itemName);
        
        if (itemIndex > -1) {
            stockData[itemIndex].sizes[size] = newQuantity;
            saveStockData(stockData);
        }
    }

    /** Maneja el clic en un botón de eliminar prenda. */
    function handleDeleteItem(event) {
        const deleteButton = event.target.closest('.deleteItemBtn');
        if (!deleteButton || !deleteButton.closest('#stockTableBody')) {
            return; // Salir si no se hizo clic en un botón de eliminar dentro de la tabla
        }

        const itemName = deleteButton.dataset.itemName;

        if (confirm(`¿Estás seguro de que quieres eliminar la prenda "${itemName}"? Esta acción no se puede deshacer.`)) {
            let stockData = getStockData();
            stockData = stockData.filter(item => item.name !== itemName);
            saveStockData(stockData);
            renderStockTable();
            showMessage(`Prenda "${itemName}" eliminada correctamente.`, "success");
        }
    }

    // --- Inicialización y Asignación de Eventos para Stock ---
    addItemForm.addEventListener('submit', handleAddItem);
    // Usar delegación de eventos en el body de la tabla para inputs y botones
    stockTableBody.addEventListener('change', handleQuantityChange); // 'change' se dispara al perder foco/Enter
    stockTableBody.addEventListener('click', handleDeleteItem);

    // Renderizar tabla inicial
    renderStockTable();
}


// ==========================================================================
// --- LÓGICA ESPECÍFICA DE LA PÁGINA DE CLIENTES (clientes.html) ---
// ==========================================================================

/** Renderiza la tabla de clientes. */
function renderClientsTable() {
    const clientsTableBody = document.getElementById('clientsTableBody');
    if (!clientsTableBody) {
        console.error('No se encontró el elemento clientsTableBody');
        return;
    }

    const clients = getClientsData();
    clientsTableBody.innerHTML = '';

    if (clients.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="4" class="text-center py-4 text-gray-500" role="alert">
                No hay clientes registrados
            </td>
        `;
        clientsTableBody.appendChild(emptyRow);
        return;
    }

    // Ordenar clientes por nombre
    clients.sort((a, b) => a.name.localeCompare(b.name));

    clients.forEach(client => {
        const row = document.createElement('tr');
        
        // Verificar si el cliente tiene pruebas registradas
        const hasTrials = client.movements && client.movements.some(movement => movement.type === 'prueba');
        
        row.innerHTML = `
            <td class="px-4 py-2">${client.name}</td>
            <td class="px-4 py-2">
                <span class="text-red-600 font-semibold">${formatCurrency(client.debt || 0)}</span>
            </td>
            <td class="px-4 py-2 text-center">
                <button class="action-btn text-green-600 hover:text-green-800 mx-1" 
                        data-client-id="${client.id}" 
                        data-action="purchase"
                        title="Agregar compra">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="action-btn text-blue-600 hover:text-blue-800 mx-1" 
                        data-client-id="${client.id}" 
                        data-action="movements"
                        title="Ver movimientos">
                    <i class="fas fa-eye"></i>
                </button>
                ${hasTrials ? `
                <button class="action-btn text-yellow-500 hover:text-yellow-700 mx-1" 
                        data-client-id="${client.id}" 
                        data-action="trials"
                        title="Ver pruebas">
                    <i class="fas fa-exclamation-triangle"></i>
                </button>
                ` : ''}
                <button class="action-btn text-red-600 hover:text-red-800 mx-1" 
                        data-client-id="${client.id}" 
                        data-action="delete"
                        title="Eliminar cliente">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        clientsTableBody.appendChild(row);
    });
}

/** Inicializa la página de clientes. */
function initClientsPage() {
    console.log('Inicializando página de clientes...');
    const clientsTableBody = document.getElementById('clientsTableBody');
    if (!clientsTableBody) {
        console.error('No se encontró el elemento clientsTableBody');
        return;
    }

    // Renderizar tabla inicial
    renderClientsTable();

    // Agregar cliente
    const addClientForm = document.getElementById('addClientForm');
    if (addClientForm) {
        addClientForm.addEventListener('submit', handleAddClient);
    }

    // Manejar acciones de clientes
    clientsTableBody.addEventListener('click', (event) => {
        const button = event.target.closest('.action-btn');
        if (!button) return;

        const clientId = parseInt(button.dataset.clientId, 10);
        const action = button.dataset.action;

        switch (action) {
            case 'purchase':
                document.getElementById('registerClientName').textContent = button.closest('tr').querySelector('td:first-child').textContent;
                document.getElementById('registerPurchaseBtn').dataset.clientId = clientId;
                document.getElementById('registerPaymentBtn').dataset.clientId = clientId;
                document.getElementById('registerTryBtn').dataset.clientId = clientId;
                openModal('registerOptionsModal');
                break;
            case 'movements':
                setupMovementsModal(clientId);
                break;
            case 'trials':
                setupTrialsModal(clientId);
                break;
            case 'delete':
                handleDeleteClient(clientId);
                break;
        }
    });

    // Manejar botones del modal de compra
    const fullPaymentBtn = document.getElementById('fullPaymentBtn');
    const partialPaymentBtn = document.getElementById('partialPaymentBtn');
    const noPaymentBtn = document.getElementById('noPaymentBtn');
    const registerPartialPaymentBtn = document.getElementById('registerPartialPaymentBtn');

    if (fullPaymentBtn) fullPaymentBtn.addEventListener('click', handleFullPayment);
    if (partialPaymentBtn) partialPaymentBtn.addEventListener('click', handlePartialPayment);
    if (noPaymentBtn) noPaymentBtn.addEventListener('click', handleNoPayment);
    if (registerPartialPaymentBtn) registerPartialPaymentBtn.addEventListener('click', handlePartialPayment);

    // Manejar formulario de pago
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }

    // Manejar botones de registro
    const registerPurchaseBtn = document.getElementById('registerPurchaseBtn');
    const registerPaymentBtn = document.getElementById('registerPaymentBtn');
    const registerTryBtn = document.getElementById('registerTryBtn');

    if (registerPurchaseBtn) {
        registerPurchaseBtn.addEventListener('click', () => {
            const clientId = registerPurchaseBtn.dataset.clientId;
            closeModal('registerOptionsModal');
            setupPurchaseModal(clientId);
        });
    }
    if (registerPaymentBtn) {
        registerPaymentBtn.addEventListener('click', () => {
            const clientId = registerPaymentBtn.dataset.clientId;
            closeModal('registerOptionsModal');
            setupPaymentModal(clientId);
        });
    }
    if (registerTryBtn) {
        registerTryBtn.addEventListener('click', () => {
            const clientId = registerTryBtn.dataset.clientId;
            closeModal('registerOptionsModal');
            setupTrialModal(clientId);
        });
    }

    // Manejar formulario de prueba
    const trialForm = document.getElementById('trialForm');
    if (trialForm) {
        trialForm.addEventListener('submit', handleTrialSubmit);
    }

    // Manejar cierre de modales
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Cerrar modal al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// --- Funciones de Utilidad ---
function openModal(modalId) {
    console.log('Abriendo modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    } else {
        console.error('Modal no encontrado:', modalId);
    }
}

function closeModal(modalId) {
    console.log('Cerrando modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = ''; // Restaurar scroll del body
        // Limpiar mensajes de error específicos del modal
        const modalMessageAreaId = `${modalId.replace('Modal','')}MessageArea`;
        const modalMessageArea = document.getElementById(modalMessageAreaId);
        if (modalMessageArea) modalMessageArea.innerHTML = '';

        // Resetear formularios
        if (modalId === 'purchaseModal') {
            document.getElementById('purchaseForm')?.reset();
            const purchaseSizeSelect = document.getElementById('purchaseSizeSelect');
            if (purchaseSizeSelect) {
                purchaseSizeSelect.innerHTML = '<option value="">-- Selecciona un talle --</option>';
                purchaseSizeSelect.disabled = true;
            }
            document.getElementById('purchaseItemPrice').textContent = '--';
            document.getElementById('purchaseAvailableStock').textContent = '--';
            document.getElementById('purchaseTotal').textContent = '--';
            document.getElementById('partialPaymentContainer').classList.add('hidden');
            document.getElementById('partialPaymentAmount').value = '';
        } else if (modalId === 'paymentModal') {
            document.getElementById('paymentForm')?.reset();
        }
    }
}

// --- Funciones de Manejo de Clientes ---
function handleAddClient(event) {
    event.preventDefault();
    const clientNameInput = document.getElementById('clientName');
    const name = clientNameInput.value.trim();

    if (!name) {
        showMessage("El nombre de la clienta no puede estar vacío.", "error");
        clientNameInput.focus();
        return;
    }

    const clientsData = getClientsData();
    const existingClient = clientsData.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingClient) {
        showMessage(`La clienta "${name}" ya existe.`, "error");
        return;
    }

    const newClient = {
        id: getNextClientId(),
        name: name,
        debt: 0,
        movements: []
    };
    clientsData.push(newClient);
    saveClientsData(clientsData);
    renderClientsTable();
    showMessage(`Clienta "${name}" agregada correctamente.`, "success");
    clientNameInput.value = '';
}

function handleDeleteClient(clientId) {
    console.log('Intentando eliminar cliente con ID:', clientId);
    
    // Obtener datos actuales
    const clients = getClientsData();
    const client = clients.find(c => c.id === clientId);
    
    if (!client) {
        showMessage('Error: No se encontró el cliente a eliminar', 'error');
        return;
    }

    // Confirmar eliminación
    if (!confirm(`¿Estás segura de que deseas eliminar a la clienta "${client.name}"? Esta acción no se puede deshacer.`)) {
        return;
    }

    // Verificar si la cliente tiene deuda pendiente
    if (client.debt > 0) {
        if (!confirm(`La clienta "${client.name}" tiene una deuda pendiente de ${formatCurrency(client.debt)}. ¿Estás segura de que deseas eliminarla?`)) {
            return;
        }
    }

    // Eliminar cliente
    const updatedClients = clients.filter(c => c.id !== clientId);
    saveClientsData(updatedClients);
    
    // Actualizar la tabla
    renderClientsTable();
    
    showMessage(`La clienta "${client.name}" ha sido eliminada correctamente.`, 'success');
}

// --- Funciones de Modal de Compra ---
function handleFullPayment() {
    const clientId = parseInt(document.getElementById('purchaseClientId').value, 10);
    const itemName = document.getElementById('purchaseItemSelect').value;
    const size = document.getElementById('purchaseSizeSelect').value;
    const quantity = parseInt(document.getElementById('purchaseQuantity').value) || 1;
    const date = document.getElementById('purchaseDate').value;
    
    // Obtener el precio unitario del item seleccionado
    const selectedOption = document.getElementById('purchaseItemSelect').options[document.getElementById('purchaseItemSelect').selectedIndex];
    const unitPrice = parseFloat(selectedOption.dataset.price);
    const total = unitPrice * quantity;

    if (!clientId || !itemName || !size || !date) {
        showMessage("Completa todos los campos requeridos.", "error", "purchaseMessageArea");
        return;
    }

    let stockData = getStockData();
    let clientsData = getClientsData();
    const itemIndex = stockData.findIndex(item => item.name === itemName);
    const clientIndex = clientsData.findIndex(c => c.id === clientId);

    if (itemIndex === -1 || clientIndex === -1) {
        showMessage("Error: No se encontró la prenda o la clienta.", "error", "purchaseMessageArea");
        return;
    }

    const item = stockData[itemIndex];
    const currentStock = item.sizes?.[size] || 0;

    // Verificar si esta compra viene de una prueba
    const isFromTrial = document.getElementById('isFromTrial')?.value === 'true';

    // Solo verificar stock si no viene de una prueba
    if (!isFromTrial && currentStock < quantity) {
        showMessage(`No hay suficiente stock disponible para ${itemName} en talle ${size}.`, "error", "purchaseMessageArea");
        return;
    }

    // No necesitamos actualizar el stock si viene de una prueba, ya que ya fue descontado
    if (!isFromTrial) {
        stockData[itemIndex].sizes[size] = currentStock - quantity;
        saveStockData(stockData);
    }

    // Actualizar Cliente
    const newMovement = {
        type: 'compra',
        date: date,
        item: itemName,
        size: size,
        quantity: quantity,
        price: total,
        payment: 'total',
        amount: total
    };
    if (!clientsData[clientIndex].movements) clientsData[clientIndex].movements = [];
    clientsData[clientIndex].movements.push(newMovement);
    
    // No sumar deuda ya que es pago total
    saveClientsData(clientsData);

    closeModal('purchaseModal');
    renderClientsTable();
    showMessage(`Compra de ${itemName} (${size}) registrada con pago total.`, "success");
}

function handlePartialPayment() {
    const partialPaymentContainer = document.getElementById('partialPaymentContainer');
    if (partialPaymentContainer.classList.contains('hidden')) {
        partialPaymentContainer.classList.remove('hidden');
        return;
    }

    const clientId = parseInt(document.getElementById('purchaseClientId').value, 10);
    const itemName = document.getElementById('purchaseItemSelect').value;
    const size = document.getElementById('purchaseSizeSelect').value;
    const quantity = parseInt(document.getElementById('purchaseQuantity').value) || 1;
    const date = document.getElementById('purchaseDate').value;
    
    // Obtener el precio unitario del item seleccionado
    const selectedOption = document.getElementById('purchaseItemSelect').options[document.getElementById('purchaseItemSelect').selectedIndex];
    const unitPrice = parseFloat(selectedOption.dataset.price);
    const total = unitPrice * quantity;
    
    const partialAmount = parseFloat(document.getElementById('partialPaymentAmount').value);

    if (!clientId || !itemName || !size || !date) {
        showMessage("Completa todos los campos requeridos.", "error", "purchaseMessageArea");
        return;
    }

    if (isNaN(partialAmount) || partialAmount <= 0) {
        showMessage("El monto del pago debe ser mayor a 0.", "error", "purchaseMessageArea");
        return;
    }

    if (partialAmount >= total) {
        showMessage(`El monto del pago parcial (${formatCurrency(partialAmount)}) debe ser menor al total (${formatCurrency(total)}).`, "error", "purchaseMessageArea");
        return;
    }

    let stockData = getStockData();
    let clientsData = getClientsData();
    const itemIndex = stockData.findIndex(item => item.name === itemName);
    const clientIndex = clientsData.findIndex(c => c.id === clientId);

    if (itemIndex === -1 || clientIndex === -1) {
        showMessage("Error: No se encontró la prenda o la clienta.", "error", "purchaseMessageArea");
        return;
    }

    const item = stockData[itemIndex];
    const currentStock = item.sizes?.[size] || 0;

    // Verificar si esta compra viene de una prueba
    const isFromTrial = document.getElementById('isFromTrial')?.value === 'true';

    // Solo verificar stock si no viene de una prueba
    if (!isFromTrial && currentStock < quantity) {
        showMessage(`No hay suficiente stock disponible para ${itemName} en talle ${size}.`, "error", "purchaseMessageArea");
        return;
    }

    // No necesitamos actualizar el stock si viene de una prueba, ya que ya fue descontado
    if (!isFromTrial) {
        stockData[itemIndex].sizes[size] = currentStock - quantity;
        saveStockData(stockData);
    }

    // Actualizar Cliente
    const newMovement = {
        type: 'compra',
        date: date,
        item: itemName,
        size: size,
        quantity: quantity,
        price: total,
        payment: 'partial',
        amount: partialAmount
    };
    if (!clientsData[clientIndex].movements) clientsData[clientIndex].movements = [];
    clientsData[clientIndex].movements.push(newMovement);
    clientsData[clientIndex].debt = (clientsData[clientIndex].debt || 0) + (total - partialAmount);
    saveClientsData(clientsData);

    closeModal('purchaseModal');
    renderClientsTable();
    showMessage(`Compra de ${itemName} (${size}) registrada con pago parcial de ${formatCurrency(partialAmount)}. Deuda restante: ${formatCurrency(total - partialAmount)}`, "success");
}

function handleNoPayment() {
    const clientId = parseInt(document.getElementById('purchaseClientId').value, 10);
    const itemName = document.getElementById('purchaseItemSelect').value;
    const size = document.getElementById('purchaseSizeSelect').value;
    const quantity = parseInt(document.getElementById('purchaseQuantity').value) || 1;
    const date = document.getElementById('purchaseDate').value;
    
    // Obtener el precio unitario del item seleccionado
    const selectedOption = document.getElementById('purchaseItemSelect').options[document.getElementById('purchaseItemSelect').selectedIndex];
    const unitPrice = parseFloat(selectedOption.dataset.price);
    const total = unitPrice * quantity;

    if (!clientId || !itemName || !size || !date) {
        showMessage("Completa todos los campos requeridos.", "error", "purchaseMessageArea");
        return;
    }

    let stockData = getStockData();
    let clientsData = getClientsData();
    const itemIndex = stockData.findIndex(item => item.name === itemName);
    const clientIndex = clientsData.findIndex(c => c.id === clientId);

    if (itemIndex === -1 || clientIndex === -1) {
        showMessage("Error: No se encontró la prenda o la clienta.", "error", "purchaseMessageArea");
        return;
    }

    const item = stockData[itemIndex];
    const currentStock = item.sizes?.[size] || 0;

    // Verificar si esta compra viene de una prueba
    const isFromTrial = document.getElementById('isFromTrial')?.value === 'true';

    // Solo verificar stock si no viene de una prueba
    if (!isFromTrial && currentStock < quantity) {
        showMessage(`No hay suficiente stock disponible para ${itemName} en talle ${size}.`, "error", "purchaseMessageArea");
        return;
    }

    // No necesitamos actualizar el stock si viene de una prueba, ya que ya fue descontado
    if (!isFromTrial) {
        stockData[itemIndex].sizes[size] = currentStock - quantity;
        saveStockData(stockData);
    }

    // Actualizar Cliente
    const newMovement = {
        type: 'compra',
        date: date,
        item: itemName,
        size: size,
        quantity: quantity,
        price: total,
        payment: 'none',
        amount: 0
    };
    if (!clientsData[clientIndex].movements) clientsData[clientIndex].movements = [];
    clientsData[clientIndex].movements.push(newMovement);
    clientsData[clientIndex].debt = (clientsData[clientIndex].debt || 0) + total;
    saveClientsData(clientsData);

    closeModal('purchaseModal');
    renderClientsTable();
    showMessage(`Compra de ${itemName} (${size}) registrada sin pago. Deuda total: ${formatCurrency(clientsData[clientIndex].debt)}`, "success");
}

function setupPurchaseModal(clientId) {
    console.log('Configurando modal de compra para cliente ID:', clientId);
    const modal = document.getElementById('purchaseModal');
    const itemSelect = document.getElementById('purchaseItemSelect');
    const sizeSelect = document.getElementById('purchaseSizeSelect');
    const dateInput = document.getElementById('purchaseDate');
    const clientNameDisplay = document.getElementById('purchaseClientName');
    
    // Obtener datos del cliente
    const clients = getClientsData();
    const client = clients.find(c => c.id === parseInt(clientId, 10));

    if (!client) {
        console.error('No se encontró el cliente con ID:', clientId);
        showMessage('No se encontró el cliente', 'error');
        return;
    }

    // Crear o actualizar el input hidden para el ID del cliente
    let clientIdInput = document.getElementById('purchaseClientId');
    if (!clientIdInput) {
        clientIdInput = document.createElement('input');
        clientIdInput.type = 'hidden';
        clientIdInput.id = 'purchaseClientId';
        document.getElementById('purchaseForm').appendChild(clientIdInput);
    }
    clientIdInput.value = clientId;

    // Establecer fecha actual
    const now = new Date();
    dateInput.value = now.toISOString().split('T')[0];
    
    // Mostrar nombre del cliente
    clientNameDisplay.textContent = client.name;

    // Limpiar y poblar select de prendas
    itemSelect.innerHTML = '<option value="">-- Selecciona una prenda --</option>';
    const stockData = getStockData();
    stockData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = `${item.name} - ${formatCurrency(item.price)}`;
        option.dataset.price = item.price; // Guardamos el precio sin multiplicar por 1000
        itemSelect.appendChild(option);
    });

    // Evento para cuando se selecciona una prenda
    itemSelect.addEventListener('change', () => {
        const selectedItem = stockData.find(item => item.name === itemSelect.value);
        sizeSelect.innerHTML = '<option value="">-- Selecciona un talle --</option>';
        sizeSelect.disabled = !selectedItem;
        
        if (selectedItem) {
            document.getElementById('purchaseItemPrice').textContent = formatCurrency(selectedItem.price);
            SIZES.forEach(size => {
                if (selectedItem.sizes[size] > 0) {
                    const option = document.createElement('option');
                    option.value = size;
                    option.textContent = `${size} (${selectedItem.sizes[size]} disponibles)`;
                    sizeSelect.appendChild(option);
                }
            });
        } else {
            document.getElementById('purchaseItemPrice').textContent = '--';
        }
        updatePurchaseTotal();
    });

    // Evento para cuando se selecciona un talle
    sizeSelect.addEventListener('change', () => {
        const selectedItem = stockData.find(item => item.name === itemSelect.value);
        const selectedSize = sizeSelect.value;
        
        if (selectedItem && selectedSize) {
            document.getElementById('purchaseAvailableStock').textContent = selectedItem.sizes[selectedSize] || 0;
        } else {
            document.getElementById('purchaseAvailableStock').textContent = '--';
        }
        updatePurchaseTotal();
    });

    // Evento para cuando cambia la cantidad
    document.getElementById('purchaseQuantity').addEventListener('change', updatePurchaseTotal);

    // Mostrar el modal
    openModal('purchaseModal');
}

function updatePurchaseTotal() {
    const itemSelect = document.getElementById('purchaseItemSelect');
    const quantityInput = document.getElementById('purchaseQuantity');
    const totalElement = document.getElementById('purchaseTotal');
    
    const selectedOption = itemSelect.options[itemSelect.selectedIndex];
    const price = selectedOption ? parseFloat(selectedOption.dataset.price) || 0 : 0;
    const quantity = parseInt(quantityInput.value) || 1;
    
    totalElement.textContent = formatCurrency(price * quantity);
}

function setupMovementsModal(clientId) {
    console.log('Configurando modal de movimientos para cliente ID:', clientId);
    const modal = document.getElementById('movementsModal');
    const clientNameDisplay = document.getElementById('movementsClientName');
    const currentDebtDisplay = document.getElementById('movementsCurrentDebt');
    const movementsList = document.getElementById('movementsList');

    // Obtener datos del cliente
    const clients = getClientsData();
    const client = clients.find(c => c.id === parseInt(clientId, 10));

    if (!client) {
        showMessage('No se encontró el cliente', 'error');
        return;
    }

    // Mostrar información del cliente
    clientNameDisplay.textContent = client.name;
    currentDebtDisplay.textContent = formatCurrency(client.debt || 0);

    // Limpiar y poblar la tabla de movimientos
    movementsList.innerHTML = '';
    if (client.movements && client.movements.length > 0) {
        client.movements.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(movement => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            const formattedDate = new Date(movement.date).toLocaleDateString('es-AR');
            let paymentType = '';
            let amountDisplay = '';

            if (movement.type === 'compra') {
                paymentType = movement.payment === 'total' ? 'Total' : 
                            movement.payment === 'partial' ? 'Parcial' : 
                            'Sin pago';
                amountDisplay = movement.payment === 'total' ? formatCurrency(movement.price) :
                               movement.payment === 'partial' ? `${formatCurrency(movement.amount)} de ${formatCurrency(movement.price)}` :
                               `${formatCurrency(0)} de ${formatCurrency(movement.price)}`;
            } else if (movement.type === 'pago') {
                paymentType = 'Pago';
                amountDisplay = formatCurrency(movement.amount);
            } else if (movement.type === 'prueba') {
                paymentType = 'Prueba';
                amountDisplay = formatCurrency(movement.price);
            }
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formattedDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${movement.item || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${movement.size || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${movement.quantity || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(movement.price || 0)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${paymentType}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${
                    movement.type === 'compra' && movement.payment === 'none' ? 'text-red-600' : 
                    movement.type === 'compra' && movement.payment === 'partial' ? 'text-yellow-600' :
                    movement.type === 'pago' ? 'text-green-600' : 'text-gray-900'
                }">${amountDisplay}</td>
            `;
            movementsList.appendChild(row);
        });
    } else {
        movementsList.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-4 text-center text-sm text-gray-500">
                    No hay movimientos registrados
                </td>
            </tr>
        `;
    }

    // Configurar el botón de PDF
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    generatePdfBtn.onclick = () => generateClientPdf(client);

    openModal('movementsModal');
}

function generateClientPdf(client) {
    try {
        // Verificar que jsPDF esté disponible
        if (typeof window.jsPDF === 'undefined') {
            throw new Error('La biblioteca jsPDF no está cargada correctamente');
        }

        const doc = new window.jsPDF();

        // Configuración inicial
        doc.setFontSize(16);
        doc.text('Bella Indumentaria Femenina', 20, 20);
        doc.setFontSize(12);
        doc.text('Historial de Movimientos', 20, 30);
        doc.text(`Cliente: ${client.name || 'Sin nombre'}`, 20, 40);
        doc.text(`Deuda Actual: ${formatCurrency(client.debt || 0)}`, 20, 50);

        // Configurar la tabla
        const headers = ['Fecha', 'Tipo', 'Prenda', 'Talle', 'Cantidad', 'Precio', 'Pago', 'Monto'];
        const rows = (client.movements || []).sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA;
        }).map(movement => {
            const formattedDate = movement.date ? new Date(movement.date).toLocaleDateString('es-AR') : 'Sin fecha';
            const paymentType = movement.payment === 'total' ? 'Total' : 
                              movement.payment === 'partial' ? 'Parcial' : 
                              movement.payment === 'none' ? 'Sin pago' : 'Pago';
            
            return [
                formattedDate,
                movement.type || 'Sin tipo',
                movement.item || 'Sin prenda',
                movement.size || 'Sin talle',
                (movement.quantity || 0).toString(),
                formatCurrency(movement.price || 0),
                paymentType,
                formatCurrency(movement.amount || 0)
            ];
        });

        // Configurar el estilo de la tabla
        doc.autoTable({
            startY: 60,
            head: [headers],
            body: rows.length > 0 ? rows : [['No hay movimientos registrados']],
            theme: 'grid',
            headStyles: {
                fillColor: [236, 72, 153], // Color fucsia
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 9,
                cellPadding: 2
            },
            columnStyles: {
                0: { cellWidth: 25 }, // Fecha
                1: { cellWidth: 20 }, // Tipo
                2: { cellWidth: 40 }, // Prenda
                3: { cellWidth: 15 }, // Talle
                4: { cellWidth: 15 }, // Cantidad
                5: { cellWidth: 25 }, // Precio
                6: { cellWidth: 20 }, // Pago
                7: { cellWidth: 25 }  // Monto
            }
        });

        // Guardar el PDF
        const fileName = `historial_${(client.name || 'cliente').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        showMessage('Error al generar el PDF. Por favor, intente nuevamente.', 'error');
    }
}

// Asegurarse de que la función esté disponible globalmente
window.generateClientPdf = generateClientPdf;

function setupPaymentModal(clientId) {
    console.log('Configurando modal de pago para cliente ID:', clientId);
    const modal = document.getElementById('paymentModal');
    const clientNameDisplay = document.getElementById('paymentClientName');
    const currentDebtDisplay = document.getElementById('paymentCurrentDebt');
    const paymentForm = document.getElementById('paymentForm');
    const clientIdInput = document.getElementById('paymentClientId');
    const paymentDateInput = document.getElementById('paymentDate');

    // Obtener datos del cliente
    const clients = getClientsData();
    const client = clients.find(c => c.id === parseInt(clientId, 10));

    if (!client) {
        showMessage('No se encontró el cliente', 'error');
        return;
    }

    // Configurar el formulario
    clientIdInput.value = clientId;
    clientNameDisplay.textContent = client.name;
    currentDebtDisplay.textContent = formatCurrency(client.debt || 0);

    // Establecer la fecha actual como valor predeterminado
    const today = new Date().toISOString().split('T')[0];
    paymentDateInput.value = today;

    // Limpiar el formulario
    paymentForm.reset();
    paymentDateInput.value = today; // Restablecer la fecha después del reset

    // Mostrar el modal
    openModal('paymentModal');
}

function handlePaymentSubmit(event) {
    event.preventDefault();
    const clientId = parseInt(document.getElementById('paymentClientId').value, 10);
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value) || 0;
    const paymentDate = document.getElementById('paymentDate').value;
    const messageArea = document.getElementById('paymentMessageArea');

    if (!clientId) {
        showMessage('Error: No se encontró el ID del cliente', 'error', 'paymentMessageArea');
        return;
    }

    if (!paymentDate) {
        showMessage('Por favor seleccione una fecha', 'error', 'paymentMessageArea');
        return;
    }

    if (paymentAmount <= 0) {
        showMessage('El monto del pago debe ser mayor a 0', 'error', 'paymentMessageArea');
        return;
    }

    let clients = getClientsData();
    const clientIndex = clients.findIndex(c => c.id === clientId);

    if (clientIndex === -1) {
        showMessage('Error: No se encontró el cliente', 'error', 'paymentMessageArea');
        return;
    }

    const client = clients[clientIndex];
    const currentDebt = client.debt || 0;

    if (paymentAmount > currentDebt) {
        showMessage(`El monto del pago (${formatCurrency(paymentAmount)}) no puede ser mayor a la deuda actual (${formatCurrency(currentDebt)})`, 'error', 'paymentMessageArea');
        return;
    }

    // Actualizar la deuda del cliente
    clients[clientIndex].debt = currentDebt - paymentAmount;

    // Agregar el movimiento de pago
    const newMovement = {
        type: 'pago',
        date: paymentDate,
        amount: paymentAmount,
        payment: 'total'
    };

    if (!clients[clientIndex].movements) {
        clients[clientIndex].movements = [];
    }
    clients[clientIndex].movements.push(newMovement);

    // Guardar los cambios
    saveClientsData(clients);

    // Cerrar el modal y actualizar la tabla
    closeModal('paymentModal');
    renderClientsTable();
    showMessage(`Pago de ${formatCurrency(paymentAmount)} registrado correctamente`, 'success');
}

function setupTrialModal(clientId) {
    console.log('Configurando modal de prueba para cliente ID:', clientId);
    const modal = document.getElementById('trialModal');
    const clientNameDisplay = document.getElementById('trialClientName');
    const trialDateInput = document.getElementById('trialDate');
    const itemSelect = document.getElementById('trialItemSelect');
    const sizeSelect = document.getElementById('trialSizeSelect');
    const trialForm = document.getElementById('trialForm');

    // Obtener datos del cliente
    const clients = getClientsData();
    const client = clients.find(c => c.id === parseInt(clientId, 10));

    if (!client) {
        showMessage('No se encontró el cliente', 'error');
        return;
    }

    // Crear o actualizar el input hidden para el ID del cliente
    let clientIdInput = document.getElementById('trialClientId');
    if (!clientIdInput) {
        clientIdInput = document.createElement('input');
        clientIdInput.type = 'hidden';
        clientIdInput.id = 'trialClientId';
        trialForm.appendChild(clientIdInput);
    }
    clientIdInput.value = clientId;

    // Configurar el formulario
    clientNameDisplay.textContent = client.name;

    // Establecer la fecha actual como valor predeterminado
    const today = new Date().toISOString().split('T')[0];
    trialDateInput.value = today;

    // Limpiar y poblar select de prendas
    itemSelect.innerHTML = '<option value="">-- Selecciona una prenda --</option>';
    const stockData = getStockData();
    stockData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = `${item.name} - ${formatCurrency(item.price)}`;
        option.dataset.price = item.price;
        itemSelect.appendChild(option);
    });

    // Evento para cuando se selecciona una prenda
    itemSelect.addEventListener('change', () => {
        const selectedItem = stockData.find(item => item.name === itemSelect.value);
        sizeSelect.innerHTML = '<option value="">-- Selecciona un talle --</option>';
        sizeSelect.disabled = !selectedItem;
        
        if (selectedItem) {
            SIZES.forEach(size => {
                if (selectedItem.sizes[size] > 0) {
                    const option = document.createElement('option');
                    option.value = size;
                    option.textContent = `${size} (${selectedItem.sizes[size]} disponibles)`;
                    sizeSelect.appendChild(option);
                }
            });
        }
    });

    // Evento para cuando se selecciona un talle
    sizeSelect.addEventListener('change', () => {
        const selectedItem = stockData.find(item => item.name === itemSelect.value);
        const selectedSize = sizeSelect.value;
        
        if (selectedItem && selectedSize) {
            document.getElementById('trialAvailableStock').textContent = selectedItem.sizes[selectedSize] || 0;
        } else {
            document.getElementById('trialAvailableStock').textContent = '--';
        }
    });

    // Mostrar el modal
    openModal('trialModal');
}

function handleTrialSubmit(event) {
    event.preventDefault();
    console.log('Manejando envío de prueba...');
    
    const clientId = parseInt(document.getElementById('trialClientId').value, 10);
    const trialDate = document.getElementById('trialDate').value;
    const itemName = document.getElementById('trialItemSelect').value;
    const size = document.getElementById('trialSizeSelect').value;
    const quantity = parseInt(document.getElementById('trialQuantity').value) || 1;
    const messageArea = document.getElementById('trialMessageArea');

    console.log('Datos del formulario:', { clientId, trialDate, itemName, size, quantity });

    if (!clientId || !trialDate || !itemName || !size) {
        showMessage('Por favor complete todos los campos requeridos', 'error', 'trialMessageArea');
        return;
    }

    let stockData = getStockData();
    let clients = getClientsData();
    const itemIndex = stockData.findIndex(item => item.name === itemName);
    const clientIndex = clients.findIndex(c => c.id === clientId);

    if (itemIndex === -1 || clientIndex === -1) {
        showMessage('Error: No se encontró la prenda o el cliente', 'error', 'trialMessageArea');
        return;
    }

    const item = stockData[itemIndex];
    const currentStock = item.sizes?.[size] || 0;

    if (currentStock < quantity) {
        showMessage(`No hay suficiente stock disponible para ${itemName} en talle ${size}`, 'error', 'trialMessageArea');
        return;
    }

    // Actualizar Stock
    stockData[itemIndex].sizes[size] = currentStock - quantity;
    saveStockData(stockData);

    // Agregar el movimiento de prueba
    const newMovement = {
        type: 'prueba',
        date: trialDate,
        item: itemName,
        size: size,
        quantity: quantity,
        price: item.price
    };

    if (!clients[clientIndex].movements) {
        clients[clientIndex].movements = [];
    }
    clients[clientIndex].movements.push(newMovement);

    // Guardar los cambios
    saveClientsData(clients);

    // Cerrar el modal y actualizar la tabla
    closeModal('trialModal');
    renderClientsTable();
    showMessage(`Prueba de ${itemName} (${size}) registrada correctamente`, 'success');
}

function setupTrialsModal(clientId) {
    console.log('Configurando modal de pruebas para cliente ID:', clientId);
    const modal = document.getElementById('trialsModal');
    const clientNameDisplay = document.getElementById('trialsClientName');
    const trialsList = document.getElementById('trialsList');

    // Obtener datos del cliente
    const clients = getClientsData();
    const client = clients.find(c => c.id === parseInt(clientId, 10));

    if (!client) {
        showMessage('No se encontró el cliente', 'error');
        return;
    }

    // Mostrar nombre del cliente
    clientNameDisplay.textContent = client.name;

    // Limpiar y poblar la lista de pruebas
    trialsList.innerHTML = '';
    if (client.movements && client.movements.length > 0) {
        const trials = client.movements.filter(movement => movement.type === 'prueba');
        
        if (trials.length === 0) {
            trialsList.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                        No hay pruebas pendientes
                    </td>
                </tr>
            `;
        } else {
            trials.forEach((trial, index) => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${new Date(trial.date).toLocaleDateString('es-AR')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${trial.item}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${trial.size}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${trial.quantity}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(trial.price)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        <button class="bg-brand-fuchsia hover:bg-brand-fuchsia-dark text-white font-bold py-2 px-4 rounded-md transition duration-300 mx-1 purchase-trial-btn"
                                data-trial-index="${index}">
                            Compra
                        </button>
                        <button class="bg-brand-fuchsia hover:bg-brand-fuchsia-dark text-white font-bold py-2 px-4 rounded-md transition duration-300 mx-1 return-trial-btn"
                                data-trial-index="${index}">
                            Devuelve
                        </button>
                    </td>
                `;
                trialsList.appendChild(row);
            });
        }
    }

    // Agregar event listeners para los botones
    trialsList.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('purchase-trial-btn')) {
            const trialIndex = parseInt(target.dataset.trialIndex);
            handleTrialPurchase(client, trialIndex);
        } else if (target.classList.contains('return-trial-btn')) {
            const trialIndex = parseInt(target.dataset.trialIndex);
            handleTrialReturn(client, trialIndex);
        }
    });

    // Mostrar el modal
    openModal('trialsModal');
}

function handleTrialPurchase(client, trialIndex) {
    console.log('Intentando comprar prueba:', { clientId: client.id, trialIndex });
    
    // Obtener todas las pruebas del cliente
    const trials = client.movements.filter(movement => movement.type === 'prueba');
    
    // Verificar que el índice sea válido
    if (trialIndex < 0 || trialIndex >= trials.length) {
        console.error('Índice de prueba inválido:', { trialIndex, trialsLength: trials.length });
        showMessage('Error: No se encontró la prueba', 'error', 'trialsMessageArea');
        return;
    }

    const trial = trials[trialIndex];

    // Cerrar el modal de pruebas
    closeModal('trialsModal');

    // Configurar el modal de compra con los datos de la prueba
    const purchaseModal = document.getElementById('purchaseModal');
    const purchaseForm = document.getElementById('purchaseForm');
    const purchaseClientName = document.getElementById('purchaseClientName');
    const purchaseDate = document.getElementById('purchaseDate');
    const purchaseItemSelect = document.getElementById('purchaseItemSelect');
    const purchaseSizeSelect = document.getElementById('purchaseSizeSelect');
    const purchaseQuantity = document.getElementById('purchaseQuantity');

    // Crear o actualizar el input hidden para el ID del cliente
    let clientIdInput = document.getElementById('purchaseClientId');
    if (!clientIdInput) {
        clientIdInput = document.createElement('input');
        clientIdInput.type = 'hidden';
        clientIdInput.id = 'purchaseClientId';
        purchaseForm.appendChild(clientIdInput);
    }
    clientIdInput.value = client.id;

    // Crear o actualizar el input hidden para indicar que viene de una prueba
    let isFromTrialInput = document.getElementById('isFromTrial');
    if (!isFromTrialInput) {
        isFromTrialInput = document.createElement('input');
        isFromTrialInput.type = 'hidden';
        isFromTrialInput.id = 'isFromTrial';
        purchaseForm.appendChild(isFromTrialInput);
    }
    isFromTrialInput.value = 'true';

    // Establecer los valores del formulario
    purchaseClientName.textContent = client.name;
    purchaseDate.value = new Date().toISOString().split('T')[0];

    // Poblar y configurar el select de prendas
    purchaseItemSelect.innerHTML = '<option value="">-- Selecciona una prenda --</option>';
    const stockData = getStockData();
    stockData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = `${item.name} - ${formatCurrency(item.price)}`;
        option.dataset.price = item.price;
        purchaseItemSelect.appendChild(option);
    });

    // Seleccionar la prenda de la prueba
    purchaseItemSelect.value = trial.item;

    // Habilitar y poblar el select de talles
    purchaseSizeSelect.disabled = false;
    purchaseSizeSelect.innerHTML = '<option value="">-- Selecciona un talle --</option>';
    const selectedItem = stockData.find(i => i.name === trial.item);
    if (selectedItem) {
        SIZES.forEach(size => {
            if (selectedItem.sizes[size] > 0 || size === trial.size) {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = `${size} (${selectedItem.sizes[size]} disponibles)`;
                purchaseSizeSelect.appendChild(option);
            }
        });

        // Seleccionar el talle de la prueba
        purchaseSizeSelect.value = trial.size;
        
        // Actualizar cantidad y precios
        purchaseQuantity.value = trial.quantity;
        document.getElementById('purchaseItemPrice').textContent = formatCurrency(selectedItem.price);
        document.getElementById('purchaseAvailableStock').textContent = selectedItem.sizes[trial.size] || 0;
        document.getElementById('purchaseTotal').textContent = formatCurrency(selectedItem.price * trial.quantity);
    }

    // Mostrar el modal de compra
    openModal('purchaseModal');

    // Eliminar el movimiento de prueba original después de abrir el modal de compra
    const realIndex = client.movements.findIndex(movement => 
        movement.type === 'prueba' && 
        movement.item === trial.item && 
        movement.size === trial.size && 
        movement.quantity === trial.quantity
    );

    if (realIndex !== -1) {
        client.movements.splice(realIndex, 1);
        let clients = getClientsData();
        const clientIndex = clients.findIndex(c => c.id === client.id);
        if (clientIndex !== -1) {
            clients[clientIndex] = client;
            saveClientsData(clients);
        }
    }
}

function handleTrialReturn(client, trialIndex) {
    console.log('Intentando devolver prueba:', { clientId: client.id, trialIndex });
    
    // Obtener todas las pruebas del cliente
    const trials = client.movements.filter(movement => movement.type === 'prueba');
    
    // Verificar que el índice sea válido
    if (trialIndex < 0 || trialIndex >= trials.length) {
        console.error('Índice de prueba inválido:', { trialIndex, trialsLength: trials.length });
        showMessage('Error: No se encontró la prueba', 'error', 'trialsMessageArea');
        return;
    }

    const trial = trials[trialIndex];

    // Encontrar el índice real en el array de movimientos
    const realIndex = client.movements.findIndex(movement => 
        movement.type === 'prueba' && 
        movement.item === trial.item && 
        movement.size === trial.size && 
        movement.quantity === trial.quantity
    );

    if (realIndex === -1) {
        console.error('No se pudo encontrar el movimiento original');
        showMessage('Error: No se pudo procesar la devolución', 'error', 'trialsMessageArea');
        return;
    }

    // Devolver el stock
    let stockData = getStockData();
    const itemIndex = stockData.findIndex(item => item.name === trial.item);
    if (itemIndex !== -1) {
        stockData[itemIndex].sizes[trial.size] = (stockData[itemIndex].sizes[trial.size] || 0) + trial.quantity;
        saveStockData(stockData);
    }

    // Eliminar el movimiento de prueba
    client.movements.splice(realIndex, 1);

    // Actualizar los datos del cliente
    let clients = getClientsData();
    const clientIndex = clients.findIndex(c => c.id === client.id);
    if (clientIndex !== -1) {
        clients[clientIndex] = client;
        saveClientsData(clients);
    }

    // Cerrar el modal de pruebas
    closeModal('trialsModal');

    // Actualizar la vista
    renderClientsTable();
    showMessage(`Prueba devuelta: ${trial.item} (${trial.size})`, 'success');
}

// ==========================================================================
// --- INICIALIZADOR PRINCIPAL ---
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    const pageId = document.body.id; // Obtener el ID del body para saber qué página es

    console.log(`DOM Loaded. Page ID: ${pageId}`);

    // Ejecutar la inicialización correspondiente a la página actual
    switch (pageId) {
        case 'page-stock':
            initStockPage();
            break;
        case 'page-clientes':
            initClientsPage();
            break;
        case 'page-ventas':
            initVentasPage();
            break;
        case 'page-index':
            // No hay JS específico para index.html por ahora
            console.log("Index page loaded.");
            break;
        default:
            console.warn("Page ID not recognized or not set on body tag.");
    }
});

function initVentasPage() {
    console.log('Inicializando página de ventas...');

    // Obtener elementos del DOM
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyFiltersBtn = document.getElementById('applyFilters');

    // Establecer fechas por defecto (último mes)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    startDateInput.value = lastMonth.toISOString().split('T')[0];
    endDateInput.value = today.toISOString().split('T')[0];

    // Inicializar gráficos vacíos
    let prendasChart = null;
    let tallesChart = null;

    function actualizarEstadisticas(ventas) {
        // Obtener datos del stock actual
        const stockData = getStockData();
        const clientsData = getClientsData();
        
        // Calcular dinero invertido y proyectado según el stock actual
        let dineroInvertido = 0;
        let dineroProyectado = 0;
        
        stockData.forEach(item => {
            // Sumar cantidades de todos los talles
            const cantidadTotal = Object.values(item.sizes).reduce((sum, cantidad) => sum + cantidad, 0);
            dineroInvertido += cantidadTotal * item.costPrice;
            dineroProyectado += cantidadTotal * item.price;
        });
        
        // Calcular ganancia proyectada
        const gananciaProyectada = dineroProyectado - dineroInvertido;

        // Calcular total de deudas
        const totalDeudas = clientsData.reduce((sum, client) => sum + (client.debt || 0), 0);

        // Actualizar los nuevos indicadores
        document.getElementById('dineroInvertido').textContent = formatCurrency(dineroInvertido);
        document.getElementById('dineroProyectado').textContent = formatCurrency(dineroProyectado);
        document.getElementById('gananciaProyectada').textContent = formatCurrency(gananciaProyectada);
        document.getElementById('totalDeudas').textContent = formatCurrency(totalDeudas);

        // Actualizar totales existentes
        const totalVentas = ventas.reduce((sum, venta) => sum + venta.price, 0);
        const cantidadVentas = ventas.length;

        document.getElementById('totalVentas').textContent = formatCurrency(totalVentas);
        document.getElementById('cantidadVentas').textContent = cantidadVentas;
    }

    function actualizarTablaVentas(ventas) {
        const tbody = document.getElementById('ventasTableBody');
        tbody.innerHTML = '';

        if (ventas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
                        No hay ventas en el período seleccionado
                    </td>
                </tr>
            `;
            return;
        }

        ventas.forEach(venta => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            const estadoPago = venta.payment === 'total' ? 'Pago total' :
                             venta.payment === 'partial' ? 'Pago parcial' :
                             'Sin pagar';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${new Date(venta.date).toLocaleDateString('es-AR')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${venta.clientName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${venta.item}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${venta.size}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${venta.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(venta.price)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${
                    venta.payment === 'total' ? 'text-green-600' :
                    venta.payment === 'partial' ? 'text-yellow-600' :
                    'text-red-600'
                }">${estadoPago}</td>
            `;
            tbody.appendChild(row);
        });
    }

    function obtenerVentasEnPeriodo(startDate, endDate) {
        const clients = getClientsData();
        const ventas = [];

        clients.forEach(client => {
            if (client.movements) {
                client.movements.forEach(movement => {
                    if (movement.type === 'compra') {
                        const moveDate = new Date(movement.date);
                        if (moveDate >= startDate && moveDate <= endDate) {
                            ventas.push({
                                ...movement,
                                clientName: client.name
                            });
                        }
                    }
                });
            }
        });

        return ventas.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function actualizarDatos() {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        endDate.setHours(23, 59, 59, 999); // Incluir todo el día final

        if (startDate > endDate) {
            showMessage('La fecha de inicio debe ser anterior a la fecha final', 'error');
            return;
        }

        const ventas = obtenerVentasEnPeriodo(startDate, endDate);
        actualizarEstadisticas(ventas);
        actualizarTablaVentas(ventas);
    }

    // Event listeners
    applyFiltersBtn.addEventListener('click', actualizarDatos);

    // Cargar datos iniciales
    actualizarDatos();
}

