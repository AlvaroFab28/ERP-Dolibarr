/**
 * utils.js - Funciones de Utilidad Comunes para el Prototipo Dolibarr ERP
 */

/**
 * Formatear un valor numérico a moneda (Bs o USD).
 * @param {number} amount - El monto a formatear
 * @param {string} currency - Símbolo de moneda (por defecto: 'Bs.')
 */
function formatCurrency(amount, currency = 'Bs.') {
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }
  
  // Formato decimal con coma y miles con punto
  const formatted = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return `${currency} ${formatted}`;
}

/**
 * Formatear fecha de YYYY-MM-DD a DD/MM/YYYY
 * @param {string} dateStr - Fecha en formato ISO
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Generar un ID numérico correlativo único para un array de objetos
 * @param {Array} list - Lista de objetos
 */
function generateId(list) {
  if (!list || list.length === 0) return 1;
  const ids = list.map(item => parseInt(item.id) || 0);
  return Math.max(...ids) + 1;
}

/**
 * Mostrar una notificación dinámica tipo Toast en pantalla
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de toast: 'success' | 'error' | 'info' | 'warning'
 */
function showToast(message, type = 'success') {
  // Buscar contenedor de toasts, si no existe lo creamos
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';

  toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <div class="toast-content">${message}</div>
  `;
  
  container.appendChild(toast);

  // Animación entrada
  setTimeout(() => toast.classList.add('show'), 10);

  // Autoeliminar después de 3.5 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/**
 * Generar HTML para insignias de estado (status badges) estilo Dolibarr.
 * @param {string} status - El estado del objeto
 */
function renderBadge(status) {
  if (!status) return '';
  
  const cleanStatus = status.toLowerCase().trim();
  let badgeClass = 'badge-default';
  
  switch(cleanStatus) {
    case 'activo':
    case 'al día':
    case 'aprobado':
    case 'pagado':
    case 'entregado':
    case 'resuelto':
    case 'publicado':
    case 'finalizado':
    case 'aceptado':
      badgeClass = 'badge-success';
      break;
    
    case 'borrador':
    case 'inactivo':
    case 'nuevo':
    case 'por hacer':
      badgeClass = 'badge-secondary';
      break;
      
    case 'validado':
    case 'en proceso':
    case 'en curso':
    case 'asignado':
    case 'abierta':
      badgeClass = 'badge-primary';
      break;
      
    case 'pago parcial':
    case 'pendiente':
    case 'no al día':
      badgeClass = 'badge-warning';
      break;
      
    case 'rechazado':
    case 'no pagado':
    case 'cancelado':
    case 'excluido':
    case 'suspendido':
    case 'alta':
      badgeClass = 'badge-danger';
      break;
      
    case 'cerrado':
    case 'cerrada':
    case 'media':
      badgeClass = 'badge-info';
      break;
      
    case 'baja':
      badgeClass = 'badge-dark';
      break;
  }
  
  return `<span class="badge ${badgeClass}">${status}</span>`;
}

// Exportar globalmente
window.DolibarrUtils = {
  formatCurrency,
  formatDate,
  generateId,
  showToast,
  renderBadge
};
