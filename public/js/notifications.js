/**
 * Sistema de Notificaciones Modales
 * Incluye Toast Notifications y Modal Dialogs
 */

// ============================================
// TOAST NOTIFICATIONS (Auto-dismiss)
// ============================================

/**
 * Muestra una notificación toast desde el lado derecho
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duración en ms (default: 4000)
 */
function showToast(message, type = 'info', duration = 4000) {
  // Crear contenedor de toasts si no existe
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
  }

  // Crear toast
  const toast = document.createElement('div');
  toast.className = `toast-notification pointer-events-auto transform translate-x-full opacity-0 transition-all duration-500 ease-out`;
  
  // Estilos según tipo
  const styles = {
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    error: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
  };

  // Iconos según tipo
  const icons = {
    success: '<i class="fas fa-check-circle text-xl"></i>',
    error: '<i class="fas fa-times-circle text-xl"></i>',
    warning: '<i class="fas fa-exclamation-triangle text-xl"></i>',
    info: '<i class="fas fa-info-circle text-xl"></i>'
  };

  toast.innerHTML = `
    <div class="${styles[type]} rounded-xl shadow-2xl px-5 py-4 flex items-center gap-4 min-w-[320px] max-w-md">
      <div class="flex-shrink-0">
        ${icons[type]}
      </div>
      <div class="flex-1 text-sm font-medium leading-relaxed">
        ${message}
      </div>
      <button onclick="this.closest('.toast-notification').remove()" class="flex-shrink-0 hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors">
        <i class="fas fa-times text-sm"></i>
      </button>
    </div>
  `;

  container.appendChild(toast);

  // Animar entrada
  setTimeout(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
  }, 10);

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

// Funciones de conveniencia
function showSuccess(message, duration) {
  showToast(message, 'success', duration);
}

function showError(message, duration) {
  showToast(message, 'error', duration);
}

function showWarning(message, duration) {
  showToast(message, 'warning', duration);
}

function showInfo(message, duration) {
  showToast(message, 'info', duration);
}

// ============================================
// MODAL DIALOGS (Require user interaction)
// ============================================

/**
 * Muestra un modal de confirmación
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje del modal
 * @param {Object} options - Opciones: confirmText, cancelText, type
 * @returns {Promise<boolean>} - true si confirma, false si cancela
 */
function showConfirm(title, message, options = {}) {
  return new Promise((resolve) => {
    const {
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      type = 'warning', // 'warning', 'danger', 'info'
      confirmButtonClass = ''
    } = options;

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300';
    
    // Estilos de botón según tipo
    const buttonStyles = {
      warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      info: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
    };

    // Iconos según tipo
    const icons = {
      warning: '<i class="fas fa-exclamation-triangle text-yellow-500 text-5xl"></i>',
      danger: '<i class="fas fa-exclamation-circle text-red-500 text-5xl"></i>',
      info: '<i class="fas fa-info-circle text-blue-500 text-5xl"></i>',
      success: '<i class="fas fa-check-circle text-green-500 text-5xl"></i>'
    };

    overlay.innerHTML = `
      <div class="modal-content bg-white rounded-2xl shadow-2xl max-w-md w-full transform scale-95 opacity-0 transition-all duration-300">
        <div class="p-6 text-center">
          <div class="mb-4">
            ${icons[type]}
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-3">${title}</h3>
          <p class="text-gray-600 text-base leading-relaxed mb-6">${message}</p>
          <div class="flex gap-3 justify-center">
            <button class="modal-cancel-btn px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors duration-200">
              ${cancelText}
            </button>
            <button class="modal-confirm-btn px-6 py-3 ${confirmButtonClass || buttonStyles[type]} text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
              ${confirmText}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animar entrada
    setTimeout(() => {
      overlay.classList.remove('opacity-0');
      overlay.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
    }, 10);

    // Función para cerrar modal
    const closeModal = (result) => {
      overlay.classList.add('opacity-0');
      overlay.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 300);
    };

    // Event listeners
    overlay.querySelector('.modal-cancel-btn').addEventListener('click', () => closeModal(false));
    overlay.querySelector('.modal-confirm-btn').addEventListener('click', () => closeModal(true));
    
    // Cerrar al hacer click en el overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(false);
      }
    });

    // Cerrar con ESC
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal(false);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  });
}

/**
 * Muestra un modal de alerta (solo OK)
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje del modal
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 */
function showAlert(title, message, type = 'info') {
  return new Promise((resolve) => {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300';
    
    // Iconos según tipo
    const icons = {
      success: '<i class="fas fa-check-circle text-green-500 text-5xl"></i>',
      error: '<i class="fas fa-times-circle text-red-500 text-5xl"></i>',
      warning: '<i class="fas fa-exclamation-triangle text-yellow-500 text-5xl"></i>',
      info: '<i class="fas fa-info-circle text-blue-500 text-5xl"></i>'
    };

    overlay.innerHTML = `
      <div class="modal-content bg-white rounded-2xl shadow-2xl max-w-md w-full transform scale-95 opacity-0 transition-all duration-300">
        <div class="p-6 text-center">
          <div class="mb-4">
            ${icons[type]}
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-3">${title}</h3>
          <p class="text-gray-600 text-base leading-relaxed mb-6">${message}</p>
          <button class="modal-ok-btn px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
            Entendido
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animar entrada
    setTimeout(() => {
      overlay.classList.remove('opacity-0');
      overlay.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
    }, 10);

    // Función para cerrar modal
    const closeModal = () => {
      overlay.classList.add('opacity-0');
      overlay.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, 300);
    };

    // Event listeners
    overlay.querySelector('.modal-ok-btn').addEventListener('click', closeModal);
    
    // Cerrar al hacer click en el overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });

    // Cerrar con ESC
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  });
}

/**
 * Muestra un modal con input de texto
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje del modal
 * @param {Object} options - Opciones: placeholder, defaultValue, confirmText, cancelText
 * @returns {Promise<string|null>} - Valor ingresado o null si cancela
 */
function showPrompt(title, message, options = {}) {
  return new Promise((resolve) => {
    const {
      placeholder = '',
      defaultValue = '',
      confirmText = 'Aceptar',
      cancelText = 'Cancelar'
    } = options;

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300';
    
    overlay.innerHTML = `
      <div class="modal-content bg-white rounded-2xl shadow-2xl max-w-md w-full transform scale-95 opacity-0 transition-all duration-300">
        <div class="p-6">
          <h3 class="text-2xl font-bold text-gray-800 mb-3">${title}</h3>
          <p class="text-gray-600 text-base mb-4">${message}</p>
          <input type="text" class="modal-input w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors mb-6" placeholder="${placeholder}" value="${defaultValue}">
          <div class="flex gap-3 justify-end">
            <button class="modal-cancel-btn px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors duration-200">
              ${cancelText}
            </button>
            <button class="modal-confirm-btn px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
              ${confirmText}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector('.modal-input');

    // Animar entrada y focus en input
    setTimeout(() => {
      overlay.classList.remove('opacity-0');
      overlay.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
      input.focus();
      input.select();
    }, 10);

    // Función para cerrar modal
    const closeModal = (result) => {
      overlay.classList.add('opacity-0');
      overlay.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 300);
    };

    // Event listeners
    overlay.querySelector('.modal-cancel-btn').addEventListener('click', () => closeModal(null));
    overlay.querySelector('.modal-confirm-btn').addEventListener('click', () => {
      closeModal(input.value);
    });

    // Enter para confirmar
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        closeModal(input.value);
      }
    });

    // Cerrar con ESC
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal(null);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  });
}

// ============================================
// LOADING OVERLAY
// ============================================

let loadingOverlay = null;

/**
 * Muestra un overlay de carga
 * @param {string} message - Mensaje a mostrar
 */
function showLoading(message = 'Cargando...') {
  if (loadingOverlay) return;

  loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center opacity-0 transition-opacity duration-300';
  
  loadingOverlay.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 transform scale-95 transition-all duration-300">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      <p class="text-gray-700 font-semibold text-lg">${message}</p>
    </div>
  `;

  document.body.appendChild(loadingOverlay);

  setTimeout(() => {
    loadingOverlay.classList.remove('opacity-0');
    loadingOverlay.querySelector('div').classList.remove('scale-95');
  }, 10);
}

/**
 * Oculta el overlay de carga
 */
function hideLoading() {
  if (!loadingOverlay) return;

  loadingOverlay.classList.add('opacity-0');
  loadingOverlay.querySelector('div').classList.add('scale-95');
  
  setTimeout(() => {
    loadingOverlay.remove();
    loadingOverlay = null;
  }, 300);
}

// ============================================
// COMPATIBILIDAD CON alert() y confirm()
// ============================================

// Guardar referencias originales
window._originalAlert = window.alert;
window._originalConfirm = window.confirm;

// Reemplazar alert() global (opcional - comentar si no se desea)
// window.alert = function(message) {
//   showAlert('Atención', message, 'info');
// };

// Reemplazar confirm() global (opcional - comentar si no se desea)
// window.confirm = function(message) {
//   return showConfirm('Confirmación', message);
// };
