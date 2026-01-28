# Implementation Plan: Express E-commerce Platform

## Overview

Este plan de implementación desglosa la plataforma de e-commerce en tareas incrementales y ejecutables. Cada tarea construye sobre las anteriores, comenzando con la configuración del proyecto y los modelos de datos, luego implementando la autenticación, las funcionalidades de administrador y cliente, y finalmente las características avanzadas como checkout, API REST y testing.

El plan sigue un enfoque de desarrollo incremental donde cada fase entrega funcionalidad verificable. Las tareas de testing están marcadas como opcionales (*) para permitir un MVP más rápido, pero se recomienda implementarlas para garantizar la calidad del código.

## Tasks

- [x] 1. Configuración inicial del proyecto
  - Inicializar proyecto Node.js con npm
  - Instalar dependencias: express, ejs, express-ejs-layouts, sequelize, sqlite3, bcrypt, express-session, connect-sqlite3, multer, dotenv
  - Crear estructura de carpetas: controllers, models, routes, middleware, views, public/uploads, config, seeders
  - Configurar archivo .env con variables de entorno (PORT, SESSION_SECRET, NODE_ENV)
  - Crear server.js con configuración básica de Express
  - Configurar express-ejs-layouts y Tailwind CSS via CDN
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_

- [-] 2. Configuración de base de datos y modelos
  - [x] 2.1 Configurar Sequelize con SQLite
    - Crear config/database.js con configuración de Sequelize
    - Inicializar conexión a base de datos SQLite
    - _Requirements: 1.4_

  - [x] 2.2 Crear modelo User
    - Definir esquema: id, email, password, name, role, timestamps
    - Agregar validaciones: email único, password requerido, role enum
    - Implementar hook beforeCreate para hashear password con bcrypt
    - _Requirements: 2.1_

  - [x] 2.3 Crear modelo Category
    - Definir esquema: id, name, description, slug, timestamps
    - Agregar validación: name único
    - Implementar hook beforeSave para generar slug desde name
    - _Requirements: 2.2_

  - [x] 2.4 Crear modelo Product
    - Definir esquema: id, name, description, price, stock, categoryId, featured, timestamps
    - Agregar validaciones: price > 0, stock >= 0
    - Establecer relación belongsTo Category
    - _Requirements: 2.3_

  - [x] 2.5 Crear modelos ProductImage, Favorite, Order, OrderItem
    - ProductImage: id, productId, imageUrl, isMain, timestamps
    - Favorite: id, userId, productId, timestamps con unique constraint
    - Order: id, userId, total, status, paymentMethod, shippingAddress, timestamps
    - OrderItem: id, orderId, productId, quantity, price, timestamps
    - _Requirements: 2.4, 2.5, 2.6, 2.7_

  - [x] 2.6 Establecer relaciones entre modelos
    - User hasMany Order, Favorite
    - Category hasMany Product
    - Product hasMany ProductImage, Favorite, OrderItem
    - Order hasMany OrderItem
    - Configurar cascade deletes apropiados
    - _Requirements: 2.8_

  - [x] 2.7 Crear archivo models/index.js
    - Importar todos los modelos
    - Sincronizar modelos con base de datos
    - Exportar modelos y sequelize instance
    - _Requirements: 2.8_

  - [ ] 2.8 Escribir property test para completitud de esquemas de modelos
    - **Property 1: Model Schema Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

  - [ ] 2.9 Escribir property test para integridad de relaciones
    - **Property 2: Model Relationships Integrity**
    - **Validates: Requirements 2.8**

- [x] 3. Checkpoint - Verificar modelos
  - Ejecutar sincronización de base de datos
  - Verificar que todas las tablas se crean correctamente
  - Preguntar al usuario si hay dudas


- [-] 4. Implementar middleware de autenticación y autorización
  - [x] 4.1 Crear middleware/auth.js
    - Implementar isAuthenticated: verificar req.session.userId
    - Implementar isAdmin: verificar req.session.role === 'admin'
    - Implementar isCustomer: verificar req.session.role === 'customer'
    - _Requirements: 3.3, 3.4, 3.5_

  - [x] 4.2 Crear middleware/upload.js
    - Configurar Multer con diskStorage en public/uploads/products
    - Implementar fileFilter para validar tipos de imagen (jpeg, png, gif, webp)
    - Configurar límite de tamaño de archivo (5MB)
    - Exportar uploadSingle y uploadMultiple
    - _Requirements: 1.5, 15.3_

  - [x] 4.3 Crear middleware/errorHandler.js
    - Implementar error handler global
    - Manejar diferentes tipos de respuesta (HTML, JSON, text)
    - Renderizar páginas de error apropiadas (404, 500)
    - Logging de errores
    - _Requirements: 16.2, 16.3, 16.4_

  - [ ] 4.4 Escribir property test para autorización basada en roles
    - **Property 5: Role-Based Authorization**
    - **Validates: Requirements 3.3, 3.4, 3.5**

  - [ ] 4.5 Escribir property test para validación de uploads
    - **Property 35: File Upload Validation**
    - **Validates: Requirements 15.3**

- [-] 5. Implementar autenticación de usuarios
  - [x] 5.1 Crear controllers/authController.js
    - Implementar register: validar datos, hashear password, crear usuario
    - Implementar login: validar credenciales, crear sesión, redirigir según rol
    - Implementar logout: destruir sesión, redirigir a landing
    - _Requirements: 3.1, 3.2_

  - [x] 5.2 Crear routes/auth.js
    - GET /auth/register - mostrar formulario de registro
    - POST /auth/register - procesar registro
    - GET /auth/login - mostrar formulario de login
    - POST /auth/login - procesar login
    - POST /auth/logout - cerrar sesión
    - _Requirements: 3.1, 3.2_

  - [x] 5.3 Crear vistas de autenticación
    - views/auth/register.ejs - formulario de registro
    - views/auth/login.ejs - formulario de login
    - Usar Tailwind CSS para estilos
    - _Requirements: 3.1, 3.2_

  - [ ] 5.4 Escribir property test para hashing de passwords
    - **Property 3: Password Hashing Invariant**
    - **Validates: Requirements 3.1, 15.4**

  - [ ] 5.5 Escribir property test para creación de sesión en login
    - **Property 4: Session Creation on Login**
    - **Validates: Requirements 3.2**

  - [ ] 5.6 Escribir unit tests para authController
    - Test registro exitoso
    - Test registro con email duplicado
    - Test login exitoso
    - Test login con credenciales inválidas
    - Test logout
    - _Requirements: 3.1, 3.2_

- [x] 6. Checkpoint - Verificar autenticación
  - Probar registro de usuario
  - Probar login y logout
  - Verificar que las sesiones funcionan correctamente
  - Preguntar al usuario si hay dudas

- [x] 7. Implementar layouts y vistas base
  - [x] 7.1 Crear views/layouts/main-layout.ejs
    - Header con navegación (Home, Products, Cart)
    - Mostrar usuario logueado y botón logout
    - Footer con información básica
    - Incluir Tailwind CSS via CDN
    - Responsive design
    - _Requirements: 1.2_

  - [x] 7.2 Crear views/layouts/admin-layout.ejs
    - Sidebar con menú de administración (Dashboard, Products, Categories, Orders, Users)
    - Área de contenido principal
    - Header con usuario y logout
    - Responsive design
    - _Requirements: 1.2_

  - [x] 7.3 Crear views/layouts/client-layout.ejs
    - Sidebar con menú de cliente (Profile, Orders, Favorites)
    - Área de contenido principal
    - Header con navegación
    - Responsive design
    - _Requirements: 1.2_

  - [x] 7.4 Crear vistas de error
    - views/errors/404.ejs - página no encontrada
    - views/errors/500.ejs - error del servidor
    - _Requirements: 16.3, 16.4_

- [-] 8. Implementar panel de administración - Dashboard
  - [x] 8.1 Crear controllers/adminController.js con getDashboard
    - Contar total de productos, órdenes, usuarios
    - Calcular revenue total de órdenes completadas
    - Obtener últimas 10 órdenes
    - _Requirements: 6.4_

  - [x] 8.2 Crear routes/admin.js
    - GET /admin/dashboard - mostrar dashboard (requiere isAdmin)
    - _Requirements: 6.4_

  - [x] 8.3 Crear views/admin/dashboard.ejs
    - Mostrar estadísticas en cards
    - Tabla de órdenes recientes
    - Gráficos básicos (opcional)
    - _Requirements: 6.4_

  - [ ] 8.4 Escribir property test para precisión de estadísticas
    - **Property 17: Dashboard Statistics Accuracy**
    - **Validates: Requirements 6.4**

- [-] 9. Implementar gestión de categorías (Admin)
  - [x] 9.1 Agregar métodos de categorías a adminController
    - getCategories: listar todas las categorías con conteo de productos
    - createCategory: validar, generar slug, crear categoría
    - updateCategory: validar unicidad, actualizar, regenerar slug
    - deleteCategory: verificar productos asociados, eliminar
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 9.2 Agregar rutas de categorías a routes/admin.js
    - GET /admin/categories - listar categorías
    - GET /admin/categories/new - formulario crear
    - POST /admin/categories - crear categoría
    - GET /admin/categories/:id/edit - formulario editar
    - PUT /admin/categories/:id - actualizar categoría
    - DELETE /admin/categories/:id - eliminar categoría
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 9.3 Crear vistas de categorías
    - views/admin/categories/list.ejs - tabla de categorías
    - views/admin/categories/form.ejs - formulario crear/editar
    - _Requirements: 5.4_

  - [ ] 9.4 Escribir property test para generación de slug
    - **Property 12: Category Slug Generation**
    - **Validates: Requirements 5.1**

  - [ ] 9.5 Escribir property test para restricción de eliminación
    - **Property 13: Category Deletion Constraint**
    - **Validates: Requirements 5.3**

  - [ ] 9.6 Escribir property test para unicidad de nombres
    - **Property 15: Category Name Uniqueness**
    - **Validates: Requirements 5.5**

  - [ ] 9.7 Escribir property test para precisión de conteo de productos
    - **Property 14: Category Product Count Accuracy**
    - **Validates: Requirements 5.4**

- [x] 10. Checkpoint - Verificar categorías
  - Probar CRUD completo de categorías
  - Verificar validaciones y restricciones
  - Preguntar al usuario si hay dudas


- [-] 11. Implementar gestión de productos (Admin)
  - [x] 11.1 Agregar métodos de productos a adminController
    - getProducts: listar con paginación, búsqueda y filtros
    - getProductForm: mostrar formulario crear/editar
    - createProduct: validar, crear producto, asociar imágenes con transacción
    - updateProduct: validar, actualizar producto, manejar nuevas imágenes
    - deleteProduct: eliminar producto, imágenes asociadas y archivos
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 11.2 Agregar rutas de productos a routes/admin.js
    - GET /admin/products - listar productos (con query params: page, search, category)
    - GET /admin/products/new - formulario crear
    - POST /admin/products - crear producto (con uploadMultiple)
    - GET /admin/products/:id/edit - formulario editar
    - PUT /admin/products/:id - actualizar producto (con uploadMultiple)
    - DELETE /admin/products/:id - eliminar producto
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 11.3 Crear vistas de productos admin
    - views/admin/products/list.ejs - tabla con paginación, búsqueda, filtros
    - views/admin/products/form.ejs - formulario con upload múltiple de imágenes
    - Incluir preview de imágenes y selección de imagen principal
    - _Requirements: 4.5, 4.6_

  - [ ] 11.4 Escribir property test para asociación de imágenes
    - **Property 6: Product Image Association**
    - **Validates: Requirements 4.1, 4.2**

  - [ ] 11.5 Escribir property test para preservación en actualización
    - **Property 7: Product Update Preservation**
    - **Validates: Requirements 4.3**

  - [ ] 11.6 Escribir property test para eliminación en cascada
    - **Property 8: Cascade Deletion**
    - **Validates: Requirements 4.4**

  - [ ] 11.7 Escribir property test para paginación
    - **Property 9: Pagination Consistency**
    - **Validates: Requirements 4.5, 14.5**

  - [ ] 11.8 Escribir property test para búsqueda
    - **Property 10: Search Result Matching**
    - **Validates: Requirements 4.6, 8.4, 14.1**

  - [ ] 11.9 Escribir property test para validación de formularios
    - **Property 11: Form Validation Rejection**
    - **Validates: Requirements 4.7, 12.7, 15.1**

- [-] 12. Implementar gestión de órdenes (Admin)
  - [x] 12.1 Agregar métodos de órdenes a adminController
    - getOrders: listar órdenes con filtro por status y paginación
    - getOrderDetail: mostrar detalle de orden con items
    - updateOrderStatus: validar y actualizar status
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 12.2 Agregar rutas de órdenes a routes/admin.js
    - GET /admin/orders - listar órdenes (con query params: status, page)
    - GET /admin/orders/:id - detalle de orden
    - PUT /admin/orders/:id/status - actualizar status
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 12.3 Crear vistas de órdenes admin
    - views/admin/orders/list.ejs - tabla con filtros y paginación
    - views/admin/orders/detail.ejs - detalle completo con items
    - _Requirements: 6.1, 6.2_

  - [ ] 12.4 Escribir property test para validación de status
    - **Property 16: Order Status Validation**
    - **Validates: Requirements 6.3**

- [-] 13. Implementar gestión de usuarios (Admin)
  - [x] 13.1 Agregar métodos de usuarios a adminController
    - getUsers: listar usuarios con paginación
    - updateUserRole: validar rol, prevenir auto-demotion, actualizar
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 13.2 Agregar rutas de usuarios a routes/admin.js
    - GET /admin/users - listar usuarios
    - PUT /admin/users/:id/role - actualizar rol
    - _Requirements: 7.1, 7.2_

  - [x] 13.3 Crear views/admin/users/list.ejs
    - Tabla de usuarios con roles
    - Botones para cambiar roles
    - _Requirements: 7.1_

  - [ ] 13.4 Escribir property test para validación de actualización de rol
    - **Property 18: User Role Update Validation**
    - **Validates: Requirements 7.2, 7.3**

- [x] 14. Checkpoint - Verificar panel admin completo
  - Probar todas las funcionalidades de administración
  - Verificar que las validaciones funcionan
  - Verificar que los permisos están correctos
  - Preguntar al usuario si hay dudas

- [-] 15. Implementar landing page y navegación pública
  - [x] 15.1 Crear controllers/productController.js
    - getLanding: obtener categorías destacadas y productos featured
    - getProducts: listar productos con búsqueda, filtros, ordenamiento, paginación
    - getProductDetail: mostrar producto con imágenes, categoría, productos relacionados
    - searchProducts: búsqueda AJAX para autocompletado
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1, 9.4_

  - [x] 15.2 Crear routes/public.js
    - GET / - landing page
    - GET /products - grid de productos
    - GET /products/:id - detalle de producto
    - GET /search - búsqueda AJAX
    - _Requirements: 8.1, 8.2, 9.1_

  - [x] 15.3 Crear vistas públicas
    - views/public/landing.ejs - hero, categorías, productos destacados
    - views/public/products.ejs - grid con filtros y paginación
    - views/public/product-detail.ejs - galería, descripción, botones
    - Responsive design mobile-first
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1_

  - [ ] 15.4 Escribir property test para filtro por categoría
    - **Property 19: Category Filter Completeness**
    - **Validates: Requirements 8.3, 14.2**

  - [ ] 15.5 Escribir property test para completitud de detalle de producto
    - **Property 20: Product Detail Completeness**
    - **Validates: Requirements 8.2, 9.1**

  - [ ] 15.6 Escribir property test para productos relacionados
    - **Property 22: Related Products Category Match**
    - **Validates: Requirements 9.4**

  - [x] 16.4 Agregar botones de favoritos en vistas de productos
    - Botón "Add to Favorites" en product cards
    - Botón "Add to Favorites" en product detail
    - Indicador visual si ya está en favoritos
    - _Requirements: 10.1_

  - [ ]* 16.5 Escribir property test para idempotencia de favoritos
    - **Property 23: Favorite Creation Idempotence**
    - **Validates: Requirements 10.5**

  - [ ]* 16.6 Escribir property test para ownership de favoritos
    - **Property 24: Favorite Ownership**
    - **Validates: Requirements 10.1, 10.2, 10.3**

- [x] 16. Implementar sistema de favoritos

- [x] 17. Checkpoint - Verificar funcionalidades públicas y favoritos
  - Probar navegación de landing y productos
  - Probar sistema de favoritos
  - Verificar responsive design
  - Preguntar al usuario si hay dudas


- [x] 18. Implementar carrito de compras
  - [x] 18.1 Crear controllers/cartController.js
    - getCart: obtener cart de sesión, calcular totales
    - addToCart: validar stock, agregar o actualizar item en sesión
    - updateCartItem: validar stock, actualizar cantidad
    - removeFromCart: eliminar item de sesión
    - clearCart: vaciar cart de sesión
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [x] 18.2 Agregar rutas de carrito a routes/public.js
    - GET /cart - mostrar carrito
    - POST /cart/add - agregar producto
    - PUT /cart/:productId - actualizar cantidad
    - DELETE /cart/:productId - remover item
    - POST /cart/clear - vaciar carrito
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 18.3 Crear views/public/cart.ejs
    - Tabla responsive de items del carrito
    - Controles para actualizar cantidad
    - Botones para remover items
    - Mostrar subtotales y total
    - Botón "Proceed to Checkout"
    - _Requirements: 11.4_

  - [x] 18.4 Agregar botones "Add to Cart" en vistas de productos
    - Botón en product cards
    - Selector de cantidad en product detail
    - Feedback visual al agregar
    - _Requirements: 11.1_

  - [ ]* 18.5 Escribir property test para almacenamiento de items
    - **Property 25: Cart Item Storage**
    - **Validates: Requirements 11.1, 11.6**

  - [ ]* 18.6 Escribir property test para validación de stock
    - **Property 21: Stock Validation**
    - **Validates: Requirements 9.2, 11.2**

  - [ ]* 18.7 Escribir property test para remoción de items
    - **Property 26: Cart Item Removal**
    - **Validates: Requirements 11.3**

  - [ ]* 18.8 Escribir property test para cálculo de totales
    - **Property 27: Cart Total Calculation**
    - **Validates: Requirements 11.4, 11.5**

- [x] 19. Implementar checkout y procesamiento de pagos
  - [x] 19.1 Crear controllers/orderController.js
    - getCheckout: validar cart no vacío, mostrar formulario
    - processCheckout: validar formulario, simular gateway, crear orden con transacción
    - getClientOrders: listar órdenes del usuario
    - getOrderDetail: mostrar detalle verificando ownership
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [x] 19.2 Implementar simulación de payment gateway
    - Función simulatePayment con timeout de 1-2 segundos
    - Retornar success si cardNumber === '4242424242424242'
    - Retornar failure para otros números
    - _Requirements: 12.2, 12.3, 12.6_

  - [x] 19.3 Agregar rutas de checkout y órdenes
    - GET /checkout - formulario checkout (requiere isAuthenticated)
    - POST /checkout - procesar pago (requiere isAuthenticated)
    - GET /client/orders - listar órdenes del usuario (requiere isAuthenticated)
    - GET /client/orders/:id - detalle de orden (requiere isAuthenticated)
    - _Requirements: 12.1, 12.4_

  - [x] 19.4 Crear vistas de checkout y órdenes
    - views/public/checkout.ejs - formulario con shipping y payment
    - views/client/orders.ejs - tabla de órdenes del usuario
    - views/client/order-detail.ejs - detalle completo de orden
    - _Requirements: 12.1, 12.5_

  - [x] 19.5 Implementar lógica de creación de orden con transacción
    - Calcular total desde cart
    - Crear Order record
    - Crear OrderItems desde cart items
    - Decrementar stock de productos
    - Commit transaction o rollback en error
    - Limpiar cart después de orden exitosa
    - _Requirements: 12.4_

  - [ ]* 19.6 Escribir property test para lógica de simulación de pago
    - **Property 28: Payment Simulation Logic**
    - **Validates: Requirements 12.2, 12.3**

  - [ ]* 19.7 Escribir property test para creación de orden desde cart
    - **Property 29: Order Creation from Cart**
    - **Validates: Requirements 12.4**

  - [ ]* 19.8 Escribir unit tests para checkout
    - Test checkout con cart vacío
    - Test pago exitoso con tarjeta válida
    - Test pago fallido con tarjeta inválida
    - Test creación de orden y limpieza de cart
    - Test decremento de stock
    - _Requirements: 12.2, 12.3, 12.4_

- [ ] 20. Checkpoint - Verificar carrito y checkout
  - Probar flujo completo de agregar al carrito
  - Probar proceso de checkout con pago simulado
  - Verificar creación de órdenes y decremento de stock
  - Preguntar al usuario si hay dudas

- [ ] 21. Implementar API REST
  - [ ] 21.1 Crear controllers/apiController.js
    - getProducts: retornar productos en JSON con paginación
    - getProductById: retornar producto específico en JSON
    - getCategories: retornar categorías en JSON
    - addToCartAPI: agregar item y retornar cart actualizado
    - removeFromCartAPI: remover item y retornar cart actualizado
    - addFavoriteAPI: crear favorito y retornar success
    - removeFavoriteAPI: eliminar favorito y retornar success
    - createOrderAPI: procesar orden y retornar order data
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

  - [ ] 21.2 Crear routes/api.js
    - GET /api/products - listar productos
    - GET /api/products/:id - obtener producto
    - GET /api/categories - listar categorías
    - POST /api/cart - agregar a carrito
    - DELETE /api/cart/:id - remover de carrito
    - POST /api/favorites - agregar favorito (requiere isAuthenticated)
    - DELETE /api/favorites/:id - remover favorito (requiere isAuthenticated)
    - POST /api/orders - crear orden (requiere isAuthenticated)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

  - [ ] 21.3 Implementar manejo de errores para API
    - Retornar JSON con { success: false, error: message }
    - Códigos de estado apropiados (400, 401, 404, 500)
    - Validación de inputs
    - _Requirements: 13.9_

  - [ ] 21.4 Escribir property test para formato de respuestas API
    - **Property 30: API Response Format**
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8**

  - [ ] 21.5 Escribir property test para manejo de errores API
    - **Property 31: API Error Handling**
    - **Validates: Requirements 13.9**

  - [ ] 21.6 Escribir unit tests para endpoints API
    - Test GET /api/products con y sin filtros
    - Test GET /api/products/:id con ID válido e inválido
    - Test POST /api/cart con datos válidos e inválidos
    - Test endpoints de favoritos y órdenes
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9_

- [ ] 22. Implementar búsqueda y filtros avanzados
  - [ ] 22.1 Mejorar búsqueda en productController
    - Implementar búsqueda por keyword en name y description
    - Implementar filtro por categoría
    - Implementar combinación de filtros
    - Implementar ordenamiento (price-asc, price-desc, name, date)
    - Mantener paginación con filtros
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ] 22.2 Actualizar vistas con filtros mejorados
    - Sidebar con filtros de categoría
    - Barra de búsqueda
    - Selector de ordenamiento
    - Mantener filtros en paginación
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ] 22.3 Escribir property test para intersección de filtros
    - **Property 32: Combined Filter Intersection**
    - **Validates: Requirements 14.3**

  - [ ] 22.4 Escribir property test para correctitud de ordenamiento
    - **Property 33: Sort Order Correctness**
    - **Validates: Requirements 14.4**

- [ ] 23. Implementar validaciones y seguridad
  - [ ] 23.1 Agregar sanitización de inputs
    - Instalar y configurar express-validator o sanitize-html
    - Aplicar sanitización en todos los controllers
    - Escapar outputs en vistas EJS
    - _Requirements: 15.2_

  - [ ] 23.2 Implementar protección CSRF
    - Instalar csurf middleware
    - Agregar tokens CSRF a formularios
    - Validar tokens en POST requests
    - _Requirements: 15.5_

  - [ ] 23.3 Agregar logging
    - Configurar winston o morgan para logging
    - Log de errores y eventos de seguridad
    - Diferentes niveles de log según ambiente
    - _Requirements: 15.6_

  - [ ] 23.4 Escribir property test para sanitización de inputs
    - **Property 34: Input Sanitization**
    - **Validates: Requirements 15.2**

- [ ] 24. Checkpoint - Verificar API y seguridad
  - Probar todos los endpoints API
  - Verificar validaciones y sanitización
  - Verificar protección CSRF
  - Preguntar al usuario si hay dudas


- [ ] 25. Implementar mejoras de UX
  - [ ] 25.1 Implementar sistema de flash messages
    - Configurar connect-flash
    - Agregar middleware para pasar messages a vistas
    - Crear componente de mensajes en layouts
    - Mostrar mensajes de success, error, info, warning
    - _Requirements: 16.1_

  - [ ] 25.2 Agregar meta tags para SEO
    - Meta description en todas las páginas
    - Open Graph tags para compartir en redes sociales
    - Title tags descriptivos
    - _Requirements: 16.5_

  - [ ] 25.3 Agregar favicon y assets
    - Crear o descargar favicon.ico
    - Colocar en public/assets/
    - Referenciar en layouts
    - _Requirements: 16.6_

  - [ ] 25.4 Agregar indicadores de carga
    - Spinner para operaciones async
    - Deshabilitar botones durante submit
    - Feedback visual en AJAX requests
    - _Requirements: 16.7_

- [x] 26. Crear scripts de seeds
  - [x] 26.1 Crear seeders/seed-users.js
    - Crear admin user (admin@example.com / admin123)
    - Crear 5-10 customer users
    - Usar bcrypt para hashear passwords
    - _Requirements: 17.1_

  - [x] 26.2 Crear seeders/seed-categories.js
    - Crear 5-8 categorías de ejemplo
    - Generar slugs automáticamente
    - _Requirements: 17.2_

  - [x] 26.3 Crear seeders/seed-products.js
    - Crear 20-30 productos de ejemplo
    - Asociar a categorías aleatorias
    - Crear 2-4 imágenes por producto
    - Marcar algunos como featured
    - _Requirements: 17.3_

  - [x] 26.4 Crear seeders/seed-orders.js
    - Crear 10-15 órdenes de ejemplo
    - Asociar a usuarios aleatorios
    - Crear order items con productos
    - Variar status (pending, completed, cancelled)
    - _Requirements: 17.4_

  - [x] 26.5 Crear script principal de seeding
    - Archivo seeders/index.js que ejecuta todos los seeds
    - Verificar NODE_ENV === 'development'
    - Limpiar base de datos antes de seed
    - Ejecutar seeds en orden correcto
    - _Requirements: 17.5_

- [ ] 27. Configurar scripts npm y documentación
  - [ ] 27.1 Actualizar package.json con scripts
    - "start": iniciar servidor en producción
    - "dev": iniciar con nodemon para desarrollo
    - "seed": ejecutar seeds
    - "test": ejecutar todos los tests
    - "test:unit": ejecutar unit tests
    - "test:property": ejecutar property tests
    - "test:coverage": ejecutar tests con coverage
    - _Requirements: 17.5_

  - [ ] 27.2 Crear archivo README.md
    - Descripción del proyecto
    - Requisitos y dependencias
    - Instrucciones de instalación
    - Instrucciones para ejecutar seeds
    - Instrucciones para ejecutar tests
    - Credenciales de usuario admin por defecto
    - Estructura del proyecto
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ] 27.3 Crear archivo .gitignore
    - node_modules/
    - .env
    - *.sqlite
    - public/uploads/*
    - coverage/
    - .DS_Store

  - [ ] 27.4 Crear archivo .env.example
    - Template con todas las variables necesarias
    - Comentarios explicativos
    - Valores de ejemplo (no sensibles)

- [ ] 28. Testing comprehensivo
  - [ ] 28.1 Completar suite de property tests
    - Verificar que todas las 35 propiedades tienen tests
    - Configurar cada test con mínimo 100 iteraciones
    - Agregar tags de referencia a propiedades del diseño
    - _Requirements: Todas las propiedades del diseño_

  - [ ] 28.2 Completar suite de unit tests
    - Tests para todos los controllers
    - Tests para todos los middleware
    - Tests para modelos y validaciones
    - Tests para casos edge y errores
    - _Requirements: 3.1, 3.2, 4.1-4.7, 5.1-5.5, 6.1-6.4, etc._

  - [ ] 28.3 Crear integration tests
    - Test flujo completo de registro y login
    - Test flujo completo de crear producto (admin)
    - Test flujo completo de agregar al carrito y checkout
    - Test flujo completo de favoritos
    - Test flujo completo de búsqueda y filtros
    - _Requirements: 3.1, 3.2, 4.1, 11.1, 12.4, 10.1, 14.1_

  - [ ] 28.4 Configurar test coverage
    - Configurar Jest para coverage reporting
    - Objetivo: 80%+ code coverage
    - Generar reportes HTML
    - _Requirements: Todas_

- [ ] 29. Optimizaciones finales
  - [ ] 29.1 Optimizar imágenes subidas
    - Instalar sharp para procesamiento de imágenes
    - Redimensionar imágenes grandes automáticamente
    - Generar thumbnails para listados
    - Comprimir imágenes para web
    - _Requirements: 15.7_

  - [ ] 29.2 Agregar índices a base de datos
    - Índice en User.email
    - Índice en Category.slug
    - Índice en Product.categoryId
    - Índice en Order.userId
    - Índice compuesto en Favorite (userId, productId)

  - [ ] 29.3 Implementar rate limiting
    - Instalar express-rate-limit
    - Aplicar límites a rutas de autenticación
    - Aplicar límites a API endpoints
    - _Requirements: 15.5_

  - [ ] 29.4 Agregar compresión de respuestas
    - Instalar compression middleware
    - Aplicar a todas las respuestas
    - Configurar nivel de compresión

- [ ] 30. Checkpoint final - Verificación completa
  - Ejecutar todos los tests y verificar que pasan
  - Probar todas las funcionalidades manualmente
  - Verificar responsive design en diferentes dispositivos
  - Verificar que los seeds funcionan correctamente
  - Verificar que la documentación está completa
  - Preguntar al usuario si hay dudas o ajustes finales

## Notes

- Cada tarea referencia los requisitos específicos que implementa para trazabilidad
- Los checkpoints aseguran validación incremental del progreso
- Los property tests validan propiedades universales de correctitud
- Los unit tests validan ejemplos específicos y casos edge
- Los integration tests validan flujos completos de usuario
- Se recomienda ejecutar tests frecuentemente durante el desarrollo
- El proyecto usa JavaScript/Node.js con Express.js como se especificó
- La base de datos SQLite facilita el desarrollo y testing
- Tailwind CSS via CDN simplifica el styling sin build process
- Todas las tareas son requeridas para un desarrollo comprehensivo desde el inicio
