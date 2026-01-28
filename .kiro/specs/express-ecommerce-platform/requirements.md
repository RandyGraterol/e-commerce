# Requirements Document

## Introduction

Esta especificación define una plataforma de e-commerce completa construida con Express.js, que permite a los administradores gestionar productos, categorías y órdenes, mientras que los clientes pueden navegar, buscar, agregar productos al carrito, gestionar favoritos y realizar compras con un sistema de pago simulado.

## Glossary

- **System**: La plataforma de e-commerce Express.js
- **Admin**: Usuario con rol de administrador que gestiona la plataforma
- **Customer**: Usuario con rol de cliente que realiza compras
- **Product**: Artículo disponible para la venta con imágenes, precio y stock
- **Category**: Clasificación de productos
- **Cart**: Carrito de compras temporal del usuario
- **Order**: Pedido confirmado con items y estado de pago
- **Favorite**: Lista de productos marcados como favoritos por un usuario
- **Session**: Sesión de usuario autenticado mediante cookies
- **Gateway**: Sistema simulado de procesamiento de pagos

## Requirements

### Requirement 1: Configuración y Estructura del Proyecto

**User Story:** Como desarrollador, quiero una estructura de proyecto bien organizada con todas las dependencias necesarias, para que el código sea mantenible y escalable.

#### Acceptance Criteria

1. THE System SHALL use Express.js with express-ejs-layouts for view rendering
2. THE System SHALL use Tailwind CSS via CDN for styling
3. THE System SHALL organize code into folders: controllers, models, routes, middleware, public/uploads, views
4. THE System SHALL use SQLite3 with Sequelize ORM for data persistence
5. THE System SHALL use Multer for file upload handling
6. THE System SHALL load configuration from environment variables

### Requirement 2: Modelos de Datos

**User Story:** Como desarrollador, quiero modelos de datos bien definidos con relaciones apropiadas, para que la base de datos represente correctamente el dominio del negocio.

#### Acceptance Criteria

1. THE System SHALL define a User model with id, email, password, role, name, and timestamps
2. THE System SHALL define a Category model with id, name, description, and slug
3. THE System SHALL define a Product model with id, name, description, price, stock, categoryId, featured, and createdAt
4. THE System SHALL define a ProductImage model with id, productId, imageUrl, and isMain
5. THE System SHALL define a Favorite model with id, userId, and productId
6. THE System SHALL define an Order model with id, userId, total, status, and paymentMethod
7. THE System SHALL define an OrderItem model with id, orderId, productId, quantity, and price
8. THE System SHALL establish proper foreign key relationships between models

### Requirement 3: Autenticación y Autorización

**User Story:** Como usuario, quiero poder registrarme, iniciar sesión y acceder a funcionalidades según mi rol, para que mis datos estén protegidos y tenga acceso apropiado.

#### Acceptance Criteria

1. WHEN a user registers with valid credentials, THE System SHALL create a new user account with hashed password
2. WHEN a user logs in with valid credentials, THE System SHALL create a session and store user information
3. WHEN an unauthenticated user attempts to access protected routes, THE System SHALL redirect to login page
4. WHEN a customer attempts to access admin routes, THE System SHALL deny access and return error
5. WHEN an admin accesses admin routes, THE System SHALL grant access
6. THE System SHALL store session data securely using cookies

### Requirement 4: Gestión de Productos (Admin)

**User Story:** Como administrador, quiero gestionar productos con múltiples imágenes, para que pueda mantener el catálogo actualizado.

#### Acceptance Criteria

1. WHEN an admin creates a product with valid data and images, THE System SHALL store the product and associate uploaded images
2. WHEN an admin uploads multiple images for a product, THE System SHALL store all images and mark one as main
3. WHEN an admin updates a product, THE System SHALL modify the product data and handle image changes
4. WHEN an admin deletes a product, THE System SHALL remove the product and its associated images from storage
5. WHEN an admin views the product list, THE System SHALL display products with pagination
6. WHEN an admin searches or filters products, THE System SHALL return matching results
7. THE System SHALL validate product data including price, stock, and required fields

### Requirement 5: Gestión de Categorías (Admin)

**User Story:** Como administrador, quiero gestionar categorías de productos, para que los clientes puedan navegar el catálogo de forma organizada.

#### Acceptance Criteria

1. WHEN an admin creates a category with valid data, THE System SHALL store the category with auto-generated slug
2. WHEN an admin updates a category, THE System SHALL modify the category data
3. WHEN an admin deletes a category, THE System SHALL remove the category if no products are associated
4. WHEN an admin views categories, THE System SHALL display all categories with product counts
5. THE System SHALL validate category names for uniqueness

### Requirement 6: Gestión de Órdenes (Admin)

**User Story:** Como administrador, quiero gestionar órdenes de clientes, para que pueda procesar y hacer seguimiento de las ventas.

#### Acceptance Criteria

1. WHEN an admin views the order list, THE System SHALL display all orders with user, total, and status information
2. WHEN an admin views order details, THE System SHALL display all order items with product information
3. WHEN an admin changes an order status, THE System SHALL update the order status to pending, completed, or cancelled
4. THE System SHALL display order statistics in the admin dashboard

### Requirement 7: Gestión de Usuarios (Admin)

**User Story:** Como administrador, quiero gestionar usuarios y sus roles, para que pueda controlar el acceso a la plataforma.

#### Acceptance Criteria

1. WHEN an admin views the user list, THE System SHALL display all users with their roles
2. WHEN an admin changes a user role, THE System SHALL update the user role between admin and customer
3. THE System SHALL prevent an admin from removing their own admin role

### Requirement 8: Landing Page y Navegación (Cliente)

**User Story:** Como cliente, quiero navegar una landing page atractiva con productos destacados, para que pueda descubrir productos fácilmente.

#### Acceptance Criteria

1. WHEN a user visits the landing page, THE System SHALL display a hero section, featured categories, and product grid
2. WHEN a user views the product grid, THE System SHALL display product cards with image, name, price, and action buttons
3. WHEN a user clicks on a category, THE System SHALL filter products by that category
4. WHEN a user searches for products, THE System SHALL return matching products
5. THE System SHALL render all client pages responsive and mobile-first

### Requirement 9: Detalle de Producto (Cliente)

**User Story:** Como cliente, quiero ver información detallada de un producto con galería de imágenes, para que pueda tomar decisiones de compra informadas.

#### Acceptance Criteria

1. WHEN a user views a product detail page, THE System SHALL display product name, description, price, stock, and image gallery
2. WHEN a user selects a quantity, THE System SHALL validate against available stock
3. WHEN a user clicks on a product image, THE System SHALL display the full-size image
4. THE System SHALL display related products from the same category

### Requirement 10: Sistema de Favoritos

**User Story:** Como cliente, quiero marcar productos como favoritos, para que pueda guardar productos de interés para más tarde.

#### Acceptance Criteria

1. WHEN a logged-in user adds a product to favorites, THE System SHALL create a favorite record
2. WHEN a logged-in user removes a product from favorites, THE System SHALL delete the favorite record
3. WHEN a user views their favorites page, THE System SHALL display all favorited products
4. WHEN an unauthenticated user attempts to add favorites, THE System SHALL prompt for login
5. THE System SHALL prevent duplicate favorites for the same user and product

### Requirement 11: Carrito de Compras

**User Story:** Como cliente, quiero agregar productos a un carrito de compras, para que pueda revisar mi selección antes de comprar.

#### Acceptance Criteria

1. WHEN a user adds a product to cart, THE System SHALL store the cart item with quantity in session
2. WHEN a user updates cart item quantity, THE System SHALL validate against stock and update the cart
3. WHEN a user removes a cart item, THE System SHALL delete the item from cart
4. WHEN a user views the cart, THE System SHALL display all items with subtotals and total
5. THE System SHALL calculate cart totals correctly including all items
6. THE System SHALL persist cart data across sessions for logged-in users

### Requirement 12: Checkout y Pagos

**User Story:** Como cliente, quiero completar una compra con información de envío y pago, para que pueda recibir mis productos.

#### Acceptance Criteria

1. WHEN a user proceeds to checkout, THE System SHALL display a form for shipping information
2. WHEN a user submits payment with card number 4242 4242 4242 4242, THE System SHALL simulate successful payment
3. WHEN a user submits payment with other card numbers, THE System SHALL simulate payment failure
4. WHEN payment is successful, THE System SHALL create an order with all cart items and clear the cart
5. WHEN payment is successful, THE System SHALL display order confirmation with order number
6. THE System SHALL simulate gateway processing with timeout delay
7. THE System SHALL validate all checkout form fields before processing

### Requirement 13: API REST

**User Story:** Como desarrollador frontend, quiero endpoints API REST, para que pueda construir interfaces dinámicas con JavaScript.

#### Acceptance Criteria

1. WHEN a request is made to GET /api/products, THE System SHALL return all products in JSON format
2. WHEN a request is made to GET /api/products/:id, THE System SHALL return the specific product in JSON format
3. WHEN a request is made to GET /api/categories, THE System SHALL return all categories in JSON format
4. WHEN a request is made to POST /api/cart, THE System SHALL add the item to cart and return updated cart
5. WHEN a request is made to DELETE /api/cart/:id, THE System SHALL remove the item and return updated cart
6. WHEN a request is made to POST /api/favorites, THE System SHALL add the favorite and return success
7. WHEN a request is made to DELETE /api/favorites/:id, THE System SHALL remove the favorite and return success
8. WHEN a request is made to POST /api/orders, THE System SHALL create the order and return order details
9. THE System SHALL validate all API requests and return appropriate error codes

### Requirement 14: Búsqueda y Filtros

**User Story:** Como cliente, quiero buscar y filtrar productos, para que pueda encontrar exactamente lo que necesito.

#### Acceptance Criteria

1. WHEN a user searches by keyword, THE System SHALL return products matching name or description
2. WHEN a user filters by category, THE System SHALL return only products in that category
3. WHEN a user combines search and filters, THE System SHALL return products matching all criteria
4. WHEN a user sorts products, THE System SHALL order results by price, name, or date
5. THE System SHALL display search results with pagination

### Requirement 15: Validaciones y Seguridad

**User Story:** Como usuario, quiero que mis datos estén protegidos y validados, para que la plataforma sea segura.

#### Acceptance Criteria

1. WHEN a user submits a form, THE System SHALL validate all required fields on backend
2. WHEN a user submits a form, THE System SHALL sanitize inputs to prevent XSS attacks
3. WHEN a user uploads a file, THE System SHALL validate file type and size
4. THE System SHALL hash passwords before storing in database
5. THE System SHALL protect against CSRF attacks using tokens
6. THE System SHALL log errors and security events
7. THE System SHALL optimize uploaded images for web display

### Requirement 16: Experiencia de Usuario

**User Story:** Como usuario, quiero una interfaz intuitiva con feedback claro, para que pueda usar la plataforma fácilmente.

#### Acceptance Criteria

1. WHEN a user performs an action, THE System SHALL display flash messages for success or error
2. WHEN a user encounters an error, THE System SHALL display a user-friendly error page
3. WHEN a user visits a non-existent page, THE System SHALL display a 404 error page
4. WHEN a server error occurs, THE System SHALL display a 500 error page
5. THE System SHALL include meta tags for basic SEO
6. THE System SHALL display a favicon
7. THE System SHALL provide loading indicators for async operations

### Requirement 17: Datos de Prueba

**User Story:** Como desarrollador, quiero scripts de seeds para poblar la base de datos, para que pueda probar la aplicación con datos realistas.

#### Acceptance Criteria

1. THE System SHALL provide seed scripts to create sample users
2. THE System SHALL provide seed scripts to create sample categories
3. THE System SHALL provide seed scripts to create sample products with images
4. THE System SHALL provide seed scripts to create sample orders
5. THE System SHALL allow running seeds in development environment only
