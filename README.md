# Plataforma E-commerce con Express.js

Una plataforma de comercio electrónico completa construida con Express.js, SQLite, Sequelize ORM, EJS y Tailwind CSS.

## 📋 Características

### Funcionalidades Públicas
- 🏠 Landing page con productos destacados y categorías
- 🔍 Búsqueda y filtrado de productos por categoría
- 📦 Visualización detallada de productos con galería de imágenes
- 🛒 Carrito de compras con gestión de cantidades
- ❤️ Sistema de favoritos para usuarios registrados
- 💳 Proceso de checkout con simulación de pago

### Panel de Administración
- 📊 Dashboard con estadísticas (productos, órdenes, usuarios, ingresos)
- 📁 Gestión completa de categorías (CRUD)
- 🏷️ Gestión de productos con múltiples imágenes
- 📋 Gestión de órdenes con actualización de estados
- 👥 Gestión de usuarios y roles

### Panel de Cliente
- 📜 Historial de órdenes
- ❤️ Lista de productos favoritos
- 👤 Información de perfil

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: SQLite con Sequelize ORM
- **Vistas**: EJS (Embedded JavaScript Templates)
- **Estilos**: Tailwind CSS (vía CDN)
- **Sesiones**: express-session con connect-sqlite3
- **Autenticación**: bcrypt para hash de contraseñas
- **Upload de Archivos**: Multer

## 📦 Requisitos Previos

- Node.js (v14 o superior)
- npm (v6 o superior)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd sergio
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   PORT=3000
   SESSION_SECRET=tu-secreto-super-seguro-aqui
   NODE_ENV=development
   ```

4. **Ejecutar seeders (datos de prueba)**
   ```bash
   npm run seed
   ```

   Esto creará:
   - 1 usuario administrador
   - 8 usuarios clientes
   - 8 categorías
   - 29 productos con imágenes
   - 12 órdenes de ejemplo

5. **Iniciar el servidor**
   ```bash
   npm start
   ```

   El servidor estará disponible en `http://localhost:3000`

## 👤 Credenciales de Acceso

### Administrador
- **Email**: admin@example.com
- **Contraseña**: admin123

### Clientes de Prueba
- **Email**: juan@example.com, maria@example.com, carlos@example.com, etc.
- **Contraseña**: password123

## 📁 Estructura del Proyecto

```
sergio/
├── config/
│   └── database.js          # Configuración de Sequelize
├── controllers/
│   ├── adminController.js   # Lógica del panel admin
│   ├── authController.js    # Autenticación
│   ├── cartController.js    # Carrito de compras
│   ├── favoriteController.js # Favoritos
│   ├── orderController.js   # Órdenes y checkout
│   └── productController.js # Productos públicos
├── middleware/
│   ├── auth.js             # Middleware de autenticación
│   ├── errorHandler.js     # Manejo de errores
│   └── upload.js           # Configuración de Multer
├── models/
│   ├── Category.js         # Modelo de categorías
│   ├── Favorite.js         # Modelo de favoritos
│   ├── Order.js            # Modelo de órdenes
│   ├── OrderItem.js        # Modelo de items de orden
│   ├── Product.js          # Modelo de productos
│   ├── ProductImage.js     # Modelo de imágenes
│   ├── User.js             # Modelo de usuarios
│   └── index.js            # Inicialización de modelos
├── routes/
│   ├── admin.js            # Rutas del admin
│   ├── auth.js             # Rutas de autenticación
│   ├── client.js           # Rutas del cliente
│   └── public.js           # Rutas públicas
├── seeders/
│   ├── seed-categories.js  # Seeder de categorías
│   ├── seed-orders.js      # Seeder de órdenes
│   ├── seed-products.js    # Seeder de productos
│   ├── seed-users.js       # Seeder de usuarios
│   └── index.js            # Script principal de seeding
├── views/
│   ├── admin/              # Vistas del panel admin
│   ├── auth/               # Vistas de autenticación
│   ├── client/             # Vistas del panel cliente
│   ├── errors/             # Páginas de error
│   ├── layouts/            # Layouts principales
│   └── public/             # Vistas públicas
├── public/
│   ├── assets/             # Assets estáticos (favicon, etc.)
│   └── uploads/            # Imágenes subidas
├── .env                    # Variables de entorno
├── .gitignore             # Archivos ignorados por Git
├── package.json           # Dependencias y scripts
├── server.js              # Punto de entrada de la aplicación
└── README.md              # Este archivo
```

## 🔧 Scripts Disponibles

```bash
# Iniciar servidor en producción
npm start

# Ejecutar seeders (datos de prueba)
npm run seed
```

## 🌐 Rutas Principales

### Públicas
- `GET /` - Landing page
- `GET /products` - Lista de productos
- `GET /products/:id` - Detalle de producto
- `GET /cart` - Carrito de compras
- `GET /checkout` - Proceso de pago (requiere autenticación)

### Autenticación
- `GET /auth/login` - Formulario de login
- `POST /auth/login` - Procesar login
- `GET /auth/register` - Formulario de registro
- `POST /auth/register` - Procesar registro
- `POST /auth/logout` - Cerrar sesión

### Admin (requiere rol admin)
- `GET /admin/dashboard` - Dashboard principal
- `GET /admin/products` - Gestión de productos
- `GET /admin/categories` - Gestión de categorías
- `GET /admin/orders` - Gestión de órdenes
- `GET /admin/users` - Gestión de usuarios

### Cliente (requiere autenticación)
- `GET /client/orders` - Historial de órdenes
- `GET /client/favorites` - Lista de favoritos

## 💳 Proceso de Pago

El sistema incluye una simulación de gateway de pago:

- **Tarjeta de prueba exitosa**: 4242424242424242
- **Cualquier otra tarjeta**: Pago rechazado

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Sesiones almacenadas en SQLite
- Middleware de autenticación y autorización
- Validación de roles (admin/customer)
- Protección de rutas sensibles

## 📝 Modelos de Datos

### User
- email (único)
- password (hasheado)
- name
- role (admin/customer)

### Category
- name (único)
- description
- slug (generado automáticamente)

### Product
- name
- description
- price
- stock
- categoryId
- featured (boolean)

### ProductImage
- productId
- imageUrl
- isMain (boolean)

### Order
- userId
- total
- status (pending/completed/cancelled)
- paymentMethod
- shippingAddress

### OrderItem
- orderId
- productId
- quantity
- price

### Favorite
- userId
- productId
- Constraint único (userId, productId)

## 🎨 Características de UI/UX

- Diseño responsive mobile-first
- Navegación intuitiva
- Feedback visual en operaciones AJAX
- Validación de formularios
- Mensajes de error claros
- Indicadores de stock
- Paginación en listados
- Búsqueda y filtros

## 🐛 Solución de Problemas

### El servidor no inicia
- Verifica que el puerto 3000 esté disponible
- Asegúrate de que las dependencias estén instaladas: `npm install`
- Verifica que el archivo `.env` exista y tenga las variables correctas

### No se muestran productos
- Ejecuta los seeders: `npm run seed`
- Verifica que la base de datos `database.sqlite` exista

### Error de sesión
- Elimina el archivo `sessions.sqlite` y reinicia el servidor
- Verifica que `SESSION_SECRET` esté configurado en `.env`

### Imágenes no se cargan
- Verifica que la carpeta `public/uploads/products/` exista
- Asegúrate de que haya al menos una imagen `product.jpg` en esa carpeta

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Desarrollo

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si encuentras algún problema o tienes preguntas, por favor abre un issue en el repositorio.

---

**Nota**: Este proyecto usa Tailwind CSS vía CDN para desarrollo. Para producción, se recomienda instalar Tailwind CSS como PostCSS plugin para optimizar el tamaño del bundle.
