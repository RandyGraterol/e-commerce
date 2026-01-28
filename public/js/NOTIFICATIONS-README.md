# Sistema de Notificaciones Modales

Sistema completo de notificaciones con Toast Notifications y Modal Dialogs para la plataforma de e-commerce.

## 🎯 Características

### Toast Notifications (Auto-dismiss)
- ✅ Aparecen desde el lado derecho con animación suave
- ✅ Desaparecen automáticamente después de 4 segundos (configurable)
- ✅ Se pueden cerrar manualmente
- ✅ 4 tipos: Success, Error, Warning, Info
- ✅ Diseño moderno con gradientes y iconos Font Awesome
- ✅ Responsive y mobile-friendly

### Modal Dialogs (Require interaction)
- ✅ Ventanas modales centradas con overlay
- ✅ Animaciones de entrada y salida
- ✅ Se cierran con ESC, click fuera, o botones
- ✅ 3 tipos principales: Confirm, Alert, Prompt
- ✅ Estilos personalizables según tipo (warning, danger, info, success)
- ✅ Soporte para inputs de texto (Prompt)

### Loading Overlay
- ✅ Overlay de carga con spinner animado
- ✅ Mensaje personalizable
- ✅ Bloquea interacción durante operaciones asíncronas

## 📦 Instalación

El sistema ya está incluido en todos los layouts:
- `main-layout.ejs` (público)
- `admin-layout.ejs` (administración)
- `client-layout.ejs` (cliente)

```html
<!-- Ya incluido en los layouts -->
<script src="/js/notifications.js"></script>
```

## 🚀 Uso

### Toast Notifications

```javascript
// Success
showSuccess('¡Operación exitosa!');
showSuccess('Producto guardado', 5000); // 5 segundos

// Error
showError('Error al procesar la solicitud');

// Warning
showWarning('Verifica los datos antes de continuar');

// Info
showInfo('Esta es una notificación informativa');

// Genérico (con tipo personalizado)
showToast('Mensaje personalizado', 'success', 3000);
```

### Modal Confirm

```javascript
const result = await showConfirm(
  'Título del modal',
  'Mensaje de confirmación',
  {
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    type: 'warning' // 'warning', 'danger', 'info', 'success'
  }
);

if (result) {
  // Usuario confirmó
  console.log('Confirmado');
} else {
  // Usuario canceló
  console.log('Cancelado');
}
```

### Modal Alert

```javascript
await showAlert(
  'Título',
  'Mensaje de alerta',
  'success' // 'success', 'error', 'warning', 'info'
);

// Continúa después de que el usuario cierre el modal
console.log('Modal cerrado');
```

### Modal Prompt

```javascript
const value = await showPrompt(
  'Ingresa tu nombre',
  'Por favor escribe tu nombre completo:',
  {
    placeholder: 'Ej: Juan Pérez',
    defaultValue: '',
    confirmText: 'Guardar',
    cancelText: 'Cancelar'
  }
);

if (value !== null) {
  console.log('Valor ingresado:', value);
} else {
  console.log('Usuario canceló');
}
```

### Loading Overlay

```javascript
// Mostrar loading
showLoading('Procesando...');

// Realizar operación asíncrona
await fetch('/api/endpoint');

// Ocultar loading
hideLoading();
```

## 💡 Ejemplos Prácticos

### Agregar al carrito con confirmación

```javascript
async function addToCart(productId) {
  try {
    const response = await fetch('/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    
    const data = await response.json();
    
    if (data.success) {
      const goToCart = await showConfirm(
        '¡Producto agregado!',
        '¿Deseas ir al carrito ahora?',
        {
          confirmText: 'Ir al carrito',
          cancelText: 'Seguir comprando',
          type: 'success'
        }
      );
      
      if (goToCart) {
        window.location.href = '/cart';
      } else {
        showSuccess('Producto agregado al carrito');
      }
    } else {
      showError(data.error || 'Error al agregar al carrito');
    }
  } catch (error) {
    showError('Error al procesar la solicitud');
  }
}
```

### Eliminar con confirmación y loading

```javascript
async function deleteProduct(id, name) {
  const shouldDelete = await showConfirm(
    'Eliminar producto',
    `¿Estás seguro de eliminar "${name}"?`,
    {
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    }
  );
  
  if (!shouldDelete) return;
  
  try {
    showLoading('Eliminando producto...');
    
    const response = await fetch(`/admin/products/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    hideLoading();
    
    if (data.success) {
      showSuccess('Producto eliminado correctamente');
      setTimeout(() => window.location.reload(), 800);
    } else {
      showError(data.error);
    }
  } catch (error) {
    hideLoading();
    showError('Error al eliminar el producto');
  }
}
```

### Checkout con flujo completo

```javascript
async function processCheckout(formData) {
  try {
    showLoading('Procesando pago...');
    
    const response = await fetch('/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    hideLoading();
    
    if (result.success) {
      await showAlert(
        '¡Pago exitoso!',
        `Transacción completada.\nID: ${result.transactionId}`,
        'success'
      );
      window.location.href = `/orders/${result.orderId}`;
    } else {
      showError(result.error);
    }
  } catch (error) {
    hideLoading();
    showError('Error al procesar el pago');
  }
}
```

## 🎨 Personalización

### Tipos de Toast

| Tipo | Color | Icono | Uso |
|------|-------|-------|-----|
| `success` | Verde | ✓ | Operaciones exitosas |
| `error` | Rojo | ✗ | Errores y fallos |
| `warning` | Amarillo/Naranja | ⚠ | Advertencias |
| `info` | Azul | ℹ | Información general |

### Tipos de Modal Confirm

| Tipo | Color del botón | Uso |
|------|-----------------|-----|
| `warning` | Amarillo/Naranja | Confirmaciones generales |
| `danger` | Rojo | Acciones destructivas |
| `info` | Azul | Información |
| `success` | Verde | Acciones positivas |

## 🔧 Configuración Avanzada

### Duración personalizada de Toast

```javascript
showSuccess('Mensaje', 10000); // 10 segundos
showError('Error', 2000); // 2 segundos
```

### Botones personalizados en Confirm

```javascript
const result = await showConfirm(
  'Título',
  'Mensaje',
  {
    confirmText: 'Texto personalizado',
    cancelText: 'Otro texto',
    type: 'warning',
    confirmButtonClass: 'bg-gradient-to-r from-purple-500 to-pink-500'
  }
);
```

## 📱 Responsive

El sistema está completamente optimizado para dispositivos móviles:
- Toast notifications se adaptan al ancho de pantalla
- Modales son responsive con padding adecuado
- Textos y botones escalables
- Touch-friendly (botones grandes en móvil)

## 🎭 Demo

Visita `/demo-notifications.html` para ver todas las funcionalidades en acción.

## 🔄 Migración desde alert() y confirm()

### Antes (alert/confirm nativo)
```javascript
alert('Producto agregado');
if (confirm('¿Eliminar?')) {
  // eliminar
}
```

### Después (nuevo sistema)
```javascript
showSuccess('Producto agregado');
if (await showConfirm('Confirmar', '¿Eliminar?')) {
  // eliminar
}
```

## ⚡ Performance

- Animaciones con CSS transitions (hardware accelerated)
- Sin dependencias externas (vanilla JavaScript)
- Tamaño mínimo (~15KB sin comprimir)
- Lazy loading de elementos (se crean solo cuando se necesitan)

## 🐛 Troubleshooting

### Las notificaciones no aparecen
- Verifica que `/js/notifications.js` esté cargado
- Revisa la consola del navegador por errores
- Asegúrate de que Tailwind CSS esté cargado

### Los modales no se cierran con ESC
- Verifica que no haya otros event listeners bloqueando ESC
- Revisa que el modal esté en el z-index correcto

### Múltiples toasts se superponen
- Esto es normal, se apilan verticalmente
- Puedes limitar la cantidad modificando el código

## 📄 Licencia

Parte del proyecto E-commerce Platform - 2026
