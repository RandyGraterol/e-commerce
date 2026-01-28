# Design Document: Express E-commerce Platform

## Overview

Esta plataforma de e-commerce es una aplicación web full-stack construida con Express.js que implementa un sistema completo de comercio electrónico con dos interfaces principales: un panel de administración para gestionar productos, categorías, órdenes y usuarios, y una interfaz de cliente para navegar, buscar, comprar productos y gestionar favoritos.

La arquitectura sigue el patrón MVC (Model-View-Controller) con separación clara de responsabilidades:
- **Models**: Sequelize ORM para definir esquemas y relaciones de datos
- **Views**: EJS templates con layouts reutilizables
- **Controllers**: Lógica de negocio y manejo de requests
- **Routes**: Definición de endpoints y middleware
- **Middleware**: Autenticación, autorización, manejo de errores

El sistema utiliza SQLite como base de datos para simplicidad en desarrollo, sesiones basadas en cookies para autenticación, y Multer para manejo de uploads de imágenes.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│  (HTML/CSS/JS + Tailwind CSS via CDN)                   │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/HTTPS
                 ▼
┌─────────────────────────────────────────────────────────┐
│                   Express.js Server                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Middleware Layer                     │  │
│  │  • Session Management                             │  │
│  │  • Authentication (isAuthenticated)               │  │
│  │  • Authorization (isAdmin, isCustomer)            │  │
│  │  • Multer (File Upload)                           │  │
│  │  • Error Handler                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                                │
│  ┌──────────────────────┴──────────────────────────┐  │
│  │              Routes Layer                        │  │
│  │  • /auth (login, register, logout)               │  │
│  │  • /admin (dashboard, products, orders, users)   │  │
│  │  • /client (profile, orders, favorites)          │  │
│  │  • / (landing, products, cart, checkout)         │  │
│  │  • /api (REST endpoints)                         │  │
│  └──────────────────────┬──────────────────────────┘  │
│                         │                                │
│  ┌──────────────────────┴──────────────────────────┐  │
│  │           Controllers Layer                      │  │
│  │  • authController                                 │  │
│  │  • adminController                                │  │
│  │  • productController                              │  │
│  │  • cartController                                 │  │
│  │  • orderController                                │  │
│  │  • favoriteController                             │  │
│  │  • apiController                                  │  │
│  └──────────────────────┬──────────────────────────┘  │
│                         │                                │
│  ┌──────────────────────┴──────────────────────────┐  │
│  │              Models Layer                        │  │
│  │  • User, Category, Product, ProductImage         │  │
│  │  • Favorite, Order, OrderItem                    │  │
│  │  (Sequelize ORM)                                 │  │
│  └──────────────────────┬──────────────────────────┘  │
└─────────────────────────┼────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  SQLite Database                         │
│  • Users, Categories, Products, ProductImages            │
│  • Favorites, Orders, OrderItems                         │
└─────────────────────────────────────────────────────────┘
```


### Technology Stack

- **Backend Framework**: Express.js 4.x
- **Template Engine**: EJS with express-ejs-layouts
- **Database**: SQLite3
- **ORM**: Sequelize 6.x
- **Authentication**: express-session with connect-sqlite3
- **File Upload**: Multer
- **Password Hashing**: bcrypt
- **Styling**: Tailwind CSS (via CDN)
- **Environment**: dotenv for configuration

### Directory Structure

```
express-ecommerce-platform/
├── controllers/
│   ├── authController.js
│   ├── adminController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── favoriteController.js
│   └── apiController.js
├── models/
│   ├── index.js
│   ├── User.js
│   ├── Category.js
│   ├── Product.js
│   ├── ProductImage.js
│   ├── Favorite.js
│   ├── Order.js
│   └── OrderItem.js
├── routes/
│   ├── auth.js
│   ├── admin.js
│   ├── client.js
│   ├── public.js
│   └── api.js
├── middleware/
│   ├── auth.js
│   ├── upload.js
│   └── errorHandler.js
├── views/
│   ├── layouts/
│   │   ├── main-layout.ejs
│   │   ├── admin-layout.ejs
│   │   └── client-layout.ejs
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   ├── admin/
│   │   ├── dashboard.ejs
│   │   ├── products/
│   │   ├── categories/
│   │   ├── orders/
│   │   └── users/
│   ├── client/
│   │   ├── profile.ejs
│   │   ├── orders.ejs
│   │   └── favorites.ejs
│   ├── public/
│   │   ├── landing.ejs
│   │   ├── products.ejs
│   │   ├── product-detail.ejs
│   │   ├── cart.ejs
│   │   └── checkout.ejs
│   └── errors/
│       ├── 404.ejs
│       └── 500.ejs
├── public/
│   ├── uploads/
│   │   └── products/
│   └── assets/
│       └── favicon.ico
├── config/
│   └── database.js
├── seeders/
│   ├── seed-users.js
│   ├── seed-categories.js
│   ├── seed-products.js
│   └── seed-orders.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

## Components and Interfaces

### Middleware Components

#### Authentication Middleware (`middleware/auth.js`)

```javascript
// isAuthenticated: Verifica que el usuario tenga sesión activa
function isAuthenticated(req, res, next)
  Input: req (request object con session)
  Output: next() o redirect a /auth/login
  Behavior:
    IF req.session.userId exists THEN
      call next()
    ELSE
      redirect to '/auth/login'

// isAdmin: Verifica que el usuario sea administrador
function isAdmin(req, res, next)
  Input: req (request object con session)
  Output: next() o error 403
  Behavior:
    IF req.session.role == 'admin' THEN
      call next()
    ELSE
      return 403 error

// isCustomer: Verifica que el usuario sea cliente
function isCustomer(req, res, next)
  Input: req (request object con session)
  Output: next() o error 403
  Behavior:
    IF req.session.role == 'customer' THEN
      call next()
    ELSE
      return 403 error
```

#### Upload Middleware (`middleware/upload.js`)

```javascript
// Configuración de Multer para múltiples imágenes
const upload = multer({
  storage: diskStorage({
    destination: 'public/uploads/products',
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
      cb(null, uniqueName)
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    IF file.mimetype IN allowedTypes THEN
      cb(null, true)
    ELSE
      cb(new Error('Invalid file type'), false)
  },
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB max
  }
})

// Exportar configuraciones
module.exports = {
  uploadSingle: upload.single('image'),
  uploadMultiple: upload.array('images', 5)  // Max 5 images
}
```

#### Error Handler Middleware (`middleware/errorHandler.js`)

```javascript
function errorHandler(err, req, res, next)
  Input: err (error object), req, res, next
  Output: rendered error page o JSON error
  Behavior:
    log error to console
    IF req.accepts('html') THEN
      render error page with status code
    ELSE IF req.accepts('json') THEN
      return JSON error response
    ELSE
      return plain text error
```


### Controller Components

#### Auth Controller (`controllers/authController.js`)

```javascript
async function register(req, res)
  Input: { email, password, name, role }
  Output: redirect to login o error
  Behavior:
    validate input fields
    check if email already exists
    hash password using bcrypt
    create user in database
    IF success THEN
      flash success message
      redirect to '/auth/login'
    ELSE
      flash error message
      redirect back

async function login(req, res)
  Input: { email, password }
  Output: redirect to dashboard/landing o error
  Behavior:
    find user by email
    IF user not found THEN
      return error 'Invalid credentials'
    compare password with hashed password
    IF password matches THEN
      create session with userId and role
      IF role == 'admin' THEN
        redirect to '/admin/dashboard'
      ELSE
        redirect to '/'
    ELSE
      return error 'Invalid credentials'

function logout(req, res)
  Input: req with session
  Output: redirect to landing
  Behavior:
    destroy session
    redirect to '/'
```

#### Admin Controller (`controllers/adminController.js`)

```javascript
async function getDashboard(req, res)
  Input: req
  Output: rendered dashboard with statistics
  Behavior:
    count total products
    count total orders
    count total users
    calculate total revenue from completed orders
    get recent orders (last 10)
    render 'admin/dashboard' with data

async function getProducts(req, res)
  Input: { page, search, category }
  Output: rendered product list with pagination
  Behavior:
    parse page number (default 1)
    build query filters from search and category
    fetch products with pagination (10 per page)
    count total products matching filters
    calculate total pages
    render 'admin/products/list' with products and pagination

async function createProduct(req, res)
  Input: { name, description, price, stock, categoryId, featured }, files
  Output: redirect to products list o error
  Behavior:
    validate all required fields
    start database transaction
    create product record
    FOR EACH uploaded file DO
      create ProductImage record with productId
      IF first image THEN set isMain = true
    commit transaction
    flash success message
    redirect to '/admin/products'
    IF error THEN rollback transaction

async function updateProduct(req, res)
  Input: productId, { name, description, price, stock, categoryId, featured }, files
  Output: redirect to products list o error
  Behavior:
    find product by id
    validate all fields
    start transaction
    update product fields
    IF new files uploaded THEN
      FOR EACH file DO
        create ProductImage record
    commit transaction
    flash success message
    redirect to '/admin/products'

async function deleteProduct(req, res)
  Input: productId
  Output: redirect to products list
  Behavior:
    find product with images
    start transaction
    FOR EACH image DO
      delete file from filesystem
      delete ProductImage record
    delete product record
    commit transaction
    flash success message
    redirect to '/admin/products'

async function getCategories(req, res)
  Input: req
  Output: rendered category list
  Behavior:
    fetch all categories with product counts
    render 'admin/categories/list' with categories

async function createCategory(req, res)
  Input: { name, description }
  Output: redirect to categories list o error
  Behavior:
    validate name is unique
    generate slug from name
    create category record
    flash success message
    redirect to '/admin/categories'

async function updateCategory(req, res)
  Input: categoryId, { name, description }
  Output: redirect to categories list o error
  Behavior:
    find category by id
    validate name uniqueness (excluding current)
    update category fields
    regenerate slug if name changed
    flash success message
    redirect to '/admin/categories'

async function deleteCategory(req, res)
  Input: categoryId
  Output: redirect to categories list o error
  Behavior:
    count products in category
    IF product count > 0 THEN
      flash error 'Cannot delete category with products'
      redirect back
    ELSE
      delete category
      flash success message
      redirect to '/admin/categories'

async function getOrders(req, res)
  Input: { status, page }
  Output: rendered order list with pagination
  Behavior:
    build query filters from status
    fetch orders with user info and pagination
    render 'admin/orders/list' with orders

async function getOrderDetail(req, res)
  Input: orderId
  Output: rendered order detail
  Behavior:
    find order with user, items, and product info
    render 'admin/orders/detail' with order

async function updateOrderStatus(req, res)
  Input: orderId, { status }
  Output: redirect to order detail
  Behavior:
    validate status is 'pending', 'completed', or 'cancelled'
    find order by id
    update order status
    flash success message
    redirect to order detail

async function getUsers(req, res)
  Input: { page }
  Output: rendered user list with pagination
  Behavior:
    fetch users with pagination
    render 'admin/users/list' with users

async function updateUserRole(req, res)
  Input: userId, { role }
  Output: redirect to users list
  Behavior:
    validate role is 'admin' or 'customer'
    IF userId == current user AND role == 'customer' THEN
      flash error 'Cannot remove own admin role'
      redirect back
    ELSE
      update user role
      flash success message
      redirect to '/admin/users'
```


#### Product Controller (`controllers/productController.js`)

```javascript
async function getLanding(req, res)
  Input: req
  Output: rendered landing page
  Behavior:
    fetch featured categories (first 6)
    fetch featured products (featured = true, limit 8)
    render 'public/landing' with categories and products

async function getProducts(req, res)
  Input: { search, category, sort, page }
  Output: rendered product grid with filters
  Behavior:
    build query filters from search and category
    apply sorting (price-asc, price-desc, name, date)
    fetch products with pagination (12 per page)
    fetch all categories for filter sidebar
    render 'public/products' with products, categories, filters

async function getProductDetail(req, res)
  Input: productId
  Output: rendered product detail page
  Behavior:
    find product with category and images
    IF product not found THEN
      return 404 error
    fetch related products (same category, limit 4)
    check if product is in user favorites (if logged in)
    render 'public/product-detail' with product and related

async function searchProducts(req, res)
  Input: { q }
  Output: JSON array of products
  Behavior:
    search products by name or description containing query
    return products as JSON (limit 20)
```

#### Cart Controller (`controllers/cartController.js`)

```javascript
async function getCart(req, res)
  Input: req with session
  Output: rendered cart page
  Behavior:
    get cart from session (or empty array)
    FOR EACH cart item DO
      fetch product details with current price
      calculate subtotal = quantity * price
    calculate total
    render 'public/cart' with cart items and total

async function addToCart(req, res)
  Input: { productId, quantity }
  Output: redirect to cart o JSON response
  Behavior:
    validate quantity > 0
    find product by id
    check stock availability
    IF quantity > stock THEN
      return error 'Insufficient stock'
    get cart from session
    find existing item in cart
    IF item exists THEN
      update quantity (add to existing)
    ELSE
      add new item to cart
    save cart to session
    flash success message
    redirect to '/cart' or return JSON success

async function updateCartItem(req, res)
  Input: productId, { quantity }
  Output: redirect to cart o JSON response
  Behavior:
    validate quantity > 0
    find product by id
    check stock availability
    get cart from session
    find item in cart
    IF quantity > stock THEN
      return error 'Insufficient stock'
    update item quantity
    save cart to session
    redirect to '/cart' or return JSON success

async function removeFromCart(req, res)
  Input: productId
  Output: redirect to cart o JSON response
  Behavior:
    get cart from session
    filter out item with matching productId
    save updated cart to session
    flash success message
    redirect to '/cart' or return JSON success

async function clearCart(req, res)
  Input: req with session
  Output: redirect to cart
  Behavior:
    set session cart to empty array
    flash success message
    redirect to '/cart'
```

#### Order Controller (`controllers/orderController.js`)

```javascript
async function getCheckout(req, res)
  Input: req with session
  Output: rendered checkout page
  Behavior:
    get cart from session
    IF cart is empty THEN
      flash error 'Cart is empty'
      redirect to '/products'
    calculate total from cart items
    render 'public/checkout' with cart and total

async function processCheckout(req, res)
  Input: { shippingAddress, city, postalCode, cardNumber, paymentMethod }
  Output: redirect to order confirmation o error
  Behavior:
    validate all required fields
    get cart from session
    IF cart is empty THEN
      return error 'Cart is empty'
    
    // Simulate payment gateway
    simulate gateway delay (1-2 seconds)
    IF cardNumber == '4242424242424242' THEN
      payment_status = 'success'
    ELSE
      payment_status = 'failed'
    
    IF payment_status == 'failed' THEN
      flash error 'Payment failed'
      redirect to '/checkout'
    
    // Create order
    start transaction
    calculate total from cart
    create Order record with userId, total, status='pending', paymentMethod
    FOR EACH cart item DO
      fetch product
      create OrderItem with orderId, productId, quantity, price
      decrease product stock by quantity
    commit transaction
    
    clear cart from session
    flash success message with order number
    redirect to '/client/orders'

async function getClientOrders(req, res)
  Input: req with session
  Output: rendered user orders page
  Behavior:
    fetch orders for current user with items
    render 'client/orders' with orders

async function getOrderDetail(req, res)
  Input: orderId
  Output: rendered order detail
  Behavior:
    find order with items and products
    verify order belongs to current user
    IF not owner AND not admin THEN
      return 403 error
    render 'client/order-detail' with order
```


#### Favorite Controller (`controllers/favoriteController.js`)

```javascript
async function getFavorites(req, res)
  Input: req with session
  Output: rendered favorites page
  Behavior:
    fetch favorites for current user with product details
    render 'client/favorites' with favorites

async function addFavorite(req, res)
  Input: { productId }
  Output: redirect back o JSON response
  Behavior:
    validate user is authenticated
    find product by id
    IF product not found THEN
      return 404 error
    check if favorite already exists
    IF exists THEN
      return error 'Already in favorites'
    create Favorite record with userId and productId
    flash success message
    redirect back or return JSON success

async function removeFavorite(req, res)
  Input: favoriteId or productId
  Output: redirect back o JSON response
  Behavior:
    find favorite by id or by userId + productId
    verify favorite belongs to current user
    delete favorite record
    flash success message
    redirect back or return JSON success
```

#### API Controller (`controllers/apiController.js`)

```javascript
async function getProducts(req, res)
  Input: { search, category, page, limit }
  Output: JSON response with products
  Behavior:
    build query filters
    fetch products with pagination
    return JSON {
      success: true,
      data: products,
      pagination: { page, limit, total, totalPages }
    }

async function getProductById(req, res)
  Input: productId
  Output: JSON response with product
  Behavior:
    find product with images and category
    IF not found THEN
      return JSON { success: false, error: 'Product not found' }
    return JSON { success: true, data: product }

async function getCategories(req, res)
  Input: req
  Output: JSON response with categories
  Behavior:
    fetch all categories
    return JSON { success: true, data: categories }

async function addToCartAPI(req, res)
  Input: { productId, quantity }
  Output: JSON response
  Behavior:
    validate inputs
    find product and check stock
    add to session cart
    return JSON { success: true, cart: updatedCart }

async function removeFromCartAPI(req, res)
  Input: cartItemId or productId
  Output: JSON response
  Behavior:
    remove item from session cart
    return JSON { success: true, cart: updatedCart }

async function addFavoriteAPI(req, res)
  Input: { productId }
  Output: JSON response
  Behavior:
    validate authentication
    create favorite record
    return JSON { success: true, message: 'Added to favorites' }

async function removeFavoriteAPI(req, res)
  Input: favoriteId
  Output: JSON response
  Behavior:
    delete favorite record
    return JSON { success: true, message: 'Removed from favorites' }

async function createOrderAPI(req, res)
  Input: { shippingAddress, paymentMethod, cardNumber }
  Output: JSON response with order
  Behavior:
    validate inputs
    process payment simulation
    create order with items
    return JSON { success: true, order: orderData }
```

## Data Models

### User Model

```javascript
User {
  id: INTEGER PRIMARY KEY AUTOINCREMENT
  email: STRING UNIQUE NOT NULL
  password: STRING NOT NULL  // bcrypt hashed
  name: STRING NOT NULL
  role: ENUM('admin', 'customer') DEFAULT 'customer'
  createdAt: DATETIME
  updatedAt: DATETIME
}

Relationships:
  - User hasMany Order
  - User hasMany Favorite
```

### Category Model

```javascript
Category {
  id: INTEGER PRIMARY KEY AUTOINCREMENT
  name: STRING UNIQUE NOT NULL
  description: TEXT
  slug: STRING UNIQUE NOT NULL
  createdAt: DATETIME
  updatedAt: DATETIME
}

Relationships:
  - Category hasMany Product
```

### Product Model

```javascript
Product {
  id: INTEGER PRIMARY KEY AUTOINCREMENT
  name: STRING NOT NULL
  description: TEXT
  price: DECIMAL(10,2) NOT NULL
  stock: INTEGER DEFAULT 0
  categoryId: INTEGER FOREIGN KEY REFERENCES Category(id)
  featured: BOOLEAN DEFAULT false
  createdAt: DATETIME
  updatedAt: DATETIME
}

Relationships:
  - Product belongsTo Category
  - Product hasMany ProductImage
  - Product hasMany Favorite
  - Product hasMany OrderItem
```

### ProductImage Model

```javascript
ProductImage {
  id: INTEGER PRIMARY KEY AUTOINCREMENT
  productId: INTEGER FOREIGN KEY REFERENCES Product(id) ON DELETE CASCADE
  imageUrl: STRING NOT NULL
  isMain: BOOLEAN DEFAULT false
  createdAt: DATETIME
  updatedAt: DATETIME
}

Relationships:
  - ProductImage belongsTo Product
```

### Favorite Model

```javascript
Favorite {
  id: INTEGER PRIMARY KEY AUTOINCREMENT
  userId: INTEGER FOREIGN KEY REFERENCES User(id) ON DELETE CASCADE
  productId: INTEGER FOREIGN KEY REFERENCES Product(id) ON DELETE CASCADE
  createdAt: DATETIME
  updatedAt: DATETIME
}

Unique Constraint: (userId, productId)

Relationships:
  - Favorite belongsTo User
  - Favorite belongsTo Product
```

### Order Model

```javascript
Order {
  id: INTEGER PRIMARY KEY AUTOINCREMENT
  userId: INTEGER FOREIGN KEY REFERENCES User(id)
  total: DECIMAL(10,2) NOT NULL
  status: ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending'
  paymentMethod: STRING NOT NULL
  shippingAddress: TEXT
  createdAt: DATETIME
  updatedAt: DATETIME
}

Relationships:
  - Order belongsTo User
  - Order hasMany OrderItem
```

### OrderItem Model

```javascript
OrderItem {
  id: INTEGER PRIMARY KEY AUTOINCREMENT
  orderId: INTEGER FOREIGN KEY REFERENCES Order(id) ON DELETE CASCADE
  productId: INTEGER FOREIGN KEY REFERENCES Product(id)
  quantity: INTEGER NOT NULL
  price: DECIMAL(10,2) NOT NULL  // Price at time of purchase
  createdAt: DATETIME
  updatedAt: DATETIME
}

Relationships:
  - OrderItem belongsTo Order
  - OrderItem belongsTo Product
```

### Cart (Session-based)

```javascript
// Stored in req.session.cart as array
CartItem {
  productId: INTEGER
  quantity: INTEGER
}

// Cart is not a database model, stored in session
// When order is created, cart items are converted to OrderItems
```


## Correctness Properties

Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas de un sistema - esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de correctitud verificables por máquinas.

### Property 1: Model Schema Completeness
*Para cualquier* modelo de datos creado (User, Category, Product, ProductImage, Favorite, Order, OrderItem), el registro debe contener todos los campos requeridos definidos en el esquema.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

### Property 2: Model Relationships Integrity
*Para cualquier* modelo con relaciones de clave foránea, las relaciones deben resolverse correctamente y las operaciones en cascada deben funcionar según lo definido.

**Validates: Requirements 2.8**

### Property 3: Password Hashing Invariant
*Para cualquier* usuario registrado o actualizado, la contraseña almacenada en la base de datos nunca debe ser igual a la contraseña en texto plano proporcionada.

**Validates: Requirements 3.1, 15.4**

### Property 4: Session Creation on Login
*Para cualquier* intento de login exitoso con credenciales válidas, el sistema debe crear una sesión que contenga userId y role del usuario.

**Validates: Requirements 3.2**

### Property 5: Role-Based Authorization
*Para cualquier* ruta protegida, el acceso debe ser concedido o denegado basándose en el rol del usuario: rutas admin requieren role='admin', rutas customer requieren role='customer', y usuarios no autenticados deben ser redirigidos a login.

**Validates: Requirements 3.3, 3.4, 3.5**

### Property 6: Product Image Association
*Para cualquier* producto creado con imágenes, todas las imágenes subidas deben estar asociadas al producto y exactamente una imagen debe tener isMain=true.

**Validates: Requirements 4.1, 4.2**

### Property 7: Product Update Preservation
*Para cualquier* actualización de producto, todos los campos no modificados deben mantener sus valores originales y las relaciones con categorías e imágenes deben permanecer válidas.

**Validates: Requirements 4.3**

### Property 8: Cascade Deletion
*Para cualquier* producto eliminado, todas las imágenes asociadas (ProductImage) deben ser eliminadas de la base de datos y del sistema de archivos.

**Validates: Requirements 4.4**

### Property 9: Pagination Consistency
*Para cualquier* listado paginado (productos, órdenes, usuarios), el tamaño de página debe ser consistente (excepto la última página) y la suma de todos los items en todas las páginas debe igual al total de items.

**Validates: Requirements 4.5, 14.5**

### Property 10: Search Result Matching
*Para cualquier* búsqueda con keyword, todos los productos retornados deben contener el keyword en su nombre o descripción (case-insensitive).

**Validates: Requirements 4.6, 8.4, 14.1**

### Property 11: Form Validation Rejection
*Para cualquier* formulario con campos requeridos, si algún campo requerido está vacío o inválido, el sistema debe rechazar el envío y retornar un error de validación.

**Validates: Requirements 4.7, 12.7, 15.1**

### Property 12: Category Slug Generation
*Para cualquier* categoría creada o actualizada, el slug debe ser generado automáticamente desde el nombre, debe ser único, y debe contener solo caracteres lowercase, números y guiones.

**Validates: Requirements 5.1**

### Property 13: Category Deletion Constraint
*Para cualquier* categoría con productos asociados, el intento de eliminación debe ser rechazado con un error indicando que la categoría tiene productos.

**Validates: Requirements 5.3**

### Property 14: Category Product Count Accuracy
*Para cualquier* categoría mostrada en el listado, el contador de productos debe ser igual al número real de productos asociados a esa categoría.

**Validates: Requirements 5.4**

### Property 15: Category Name Uniqueness
*Para cualquier* intento de crear o actualizar una categoría, si el nombre ya existe en otra categoría, el sistema debe rechazar la operación con un error de duplicado.

**Validates: Requirements 5.5**

### Property 16: Order Status Validation
*Para cualquier* actualización de estado de orden, el nuevo estado debe ser uno de los valores válidos: 'pending', 'completed', o 'cancelled'.

**Validates: Requirements 6.3**

### Property 17: Dashboard Statistics Accuracy
*Para cualquier* cálculo de estadísticas en el dashboard, el total de revenue debe ser igual a la suma de todos los totales de órdenes con status='completed'.

**Validates: Requirements 6.4**

### Property 18: User Role Update Validation
*Para cualquier* actualización de rol de usuario, el nuevo rol debe ser 'admin' o 'customer', y un admin no debe poder cambiar su propio rol a customer.

**Validates: Requirements 7.2, 7.3**

### Property 19: Category Filter Completeness
*Para cualquier* filtro por categoría aplicado, todos los productos retornados deben pertenecer a la categoría especificada.

**Validates: Requirements 8.3, 14.2**

### Property 20: Product Detail Completeness
*Para cualquier* página de detalle de producto renderizada, el producto debe incluir name, description, price, stock, y al menos una imagen.

**Validates: Requirements 8.2, 9.1**

### Property 21: Stock Validation
*Para cualquier* operación que involucre cantidad (agregar al carrito, actualizar carrito, crear orden), si la cantidad solicitada excede el stock disponible, el sistema debe rechazar la operación con un error de stock insuficiente.

**Validates: Requirements 9.2, 11.2**

### Property 22: Related Products Category Match
*Para cualquier* conjunto de productos relacionados mostrados, todos los productos deben pertenecer a la misma categoría que el producto principal.

**Validates: Requirements 9.4**

### Property 23: Favorite Creation Idempotence
*Para cualquier* usuario y producto, si el usuario intenta agregar el mismo producto a favoritos múltiples veces, solo debe existir un registro de favorito para ese par usuario-producto.

**Validates: Requirements 10.5**

### Property 24: Favorite Ownership
*Para cualquier* operación de favoritos (agregar, remover, listar), el sistema debe verificar que el favorito pertenece al usuario autenticado actual.

**Validates: Requirements 10.1, 10.2, 10.3**

### Property 25: Cart Item Storage
*Para cualquier* producto agregado al carrito, el item debe ser almacenado en la sesión con productId y quantity, y debe persistir mientras la sesión esté activa.

**Validates: Requirements 11.1, 11.6**

### Property 26: Cart Item Removal
*Para cualquier* item removido del carrito, el item no debe aparecer en el carrito después de la operación de remoción.

**Validates: Requirements 11.3**

### Property 27: Cart Total Calculation
*Para cualquier* carrito con items, el total debe ser igual a la suma de (quantity × price) de todos los items en el carrito.

**Validates: Requirements 11.4, 11.5**

### Property 28: Payment Simulation Logic
*Para cualquier* intento de pago, si el número de tarjeta es exactamente '4242424242424242', el pago debe ser exitoso; para cualquier otro número, el pago debe fallar.

**Validates: Requirements 12.2, 12.3**

### Property 29: Order Creation from Cart
*Para cualquier* pago exitoso, el sistema debe crear una orden que contenga OrderItems correspondientes a todos los items del carrito, con las cantidades y precios correctos, y luego vaciar el carrito.

**Validates: Requirements 12.4**

### Property 30: API Response Format
*Para cualquier* endpoint API exitoso, la respuesta debe ser JSON válido con una estructura que incluya un campo 'success' y los datos solicitados.

**Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8**

### Property 31: API Error Handling
*Para cualquier* request API inválido (datos faltantes, formato incorrecto, recurso no encontrado), el sistema debe retornar un código de estado HTTP apropiado (400, 404, 500) y un mensaje de error en formato JSON.

**Validates: Requirements 13.9**

### Property 32: Combined Filter Intersection
*Para cualquier* combinación de filtros (búsqueda + categoría + ordenamiento), los productos retornados deben satisfacer todos los criterios simultáneamente.

**Validates: Requirements 14.3**

### Property 33: Sort Order Correctness
*Para cualquier* ordenamiento aplicado (por precio, nombre, o fecha), los resultados deben estar ordenados correctamente según el criterio especificado en orden ascendente o descendente.

**Validates: Requirements 14.4**

### Property 34: Input Sanitization
*Para cualquier* input de usuario en formularios, el sistema debe sanitizar el input para remover o escapar caracteres potencialmente peligrosos antes de almacenar o renderizar.

**Validates: Requirements 15.2**

### Property 35: File Upload Validation
*Para cualquier* archivo subido, el sistema debe validar que el tipo MIME esté en la lista de tipos permitidos (image/jpeg, image/png, image/gif, image/webp) y que el tamaño no exceda 5MB.

**Validates: Requirements 15.3**


## Error Handling

### Error Handling Strategy

El sistema implementa un manejo de errores en múltiples capas:

1. **Validation Layer**: Validación de inputs en controllers antes de operaciones de base de datos
2. **Database Layer**: Manejo de errores de Sequelize (constraints, foreign keys, etc.)
3. **Middleware Layer**: Error handler global que captura todos los errores no manejados
4. **API Layer**: Respuestas JSON estructuradas con códigos de estado apropiados

### Error Types and Handling

#### Validation Errors (400 Bad Request)
```javascript
// Triggered by invalid input data
{
  status: 400,
  message: 'Validation error',
  errors: [
    { field: 'email', message: 'Email is required' },
    { field: 'price', message: 'Price must be positive' }
  ]
}
```

#### Authentication Errors (401 Unauthorized)
```javascript
// Triggered when user is not authenticated
{
  status: 401,
  message: 'Authentication required',
  redirect: '/auth/login'
}
```

#### Authorization Errors (403 Forbidden)
```javascript
// Triggered when user lacks permissions
{
  status: 403,
  message: 'Access denied. Admin privileges required.'
}
```

#### Not Found Errors (404 Not Found)
```javascript
// Triggered when resource doesn't exist
{
  status: 404,
  message: 'Product not found'
}
```

#### Database Errors (500 Internal Server Error)
```javascript
// Triggered by database operations failures
{
  status: 500,
  message: 'Database error occurred',
  error: process.env.NODE_ENV === 'development' ? err.message : undefined
}
```

#### File Upload Errors (400 Bad Request)
```javascript
// Triggered by invalid file uploads
{
  status: 400,
  message: 'Invalid file type. Only images are allowed.'
}
```

### Error Handler Middleware

```javascript
function errorHandler(err, req, res, next) {
  // Log error
  console.error('[ERROR]', err.stack)
  
  // Determine status code
  const statusCode = err.statusCode || 500
  
  // Prepare error response
  const errorResponse = {
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  }
  
  // Handle different response types
  IF req.accepts('html') THEN
    // Render error page for web requests
    render appropriate error view (404.ejs, 500.ejs)
  ELSE IF req.accepts('json') THEN
    // Return JSON for API requests
    return JSON response with errorResponse
  ELSE
    // Fallback to plain text
    return plain text error
}
```

### Transaction Rollback

Para operaciones críticas que involucran múltiples cambios en la base de datos:

```javascript
async function criticalOperation() {
  const transaction = await sequelize.transaction()
  
  try {
    // Perform multiple database operations
    await Model1.create(data1, { transaction })
    await Model2.update(data2, { transaction })
    
    // Commit if all succeed
    await transaction.commit()
    return success
  } catch (error) {
    // Rollback on any error
    await transaction.rollback()
    throw error
  }
}
```

### Flash Messages

Para operaciones web (no API), el sistema usa flash messages para feedback al usuario:

```javascript
// Success messages
req.flash('success', 'Product created successfully')

// Error messages
req.flash('error', 'Failed to delete category. It has associated products.')

// Info messages
req.flash('info', 'Please login to continue')

// Warning messages
req.flash('warning', 'Stock is running low')
```

## Testing Strategy

### Dual Testing Approach

El sistema requiere tanto unit testing como property-based testing para cobertura completa:

- **Unit Tests**: Verifican ejemplos específicos, casos edge, y condiciones de error
- **Property Tests**: Verifican propiedades universales a través de todos los inputs

Ambos tipos de tests son complementarios y necesarios. Los unit tests capturan bugs concretos y casos específicos, mientras que los property tests verifican correctitud general a través de randomización.

### Testing Stack

- **Framework**: Jest para JavaScript/Node.js
- **Property-Based Testing**: fast-check library
- **Database Testing**: SQLite in-memory database para tests
- **HTTP Testing**: supertest para testing de endpoints
- **Mocking**: jest.mock() para dependencias externas

### Property-Based Testing Configuration

Cada property test debe:
- Ejecutar mínimo 100 iteraciones (debido a randomización)
- Incluir un comentario referenciando la propiedad del diseño
- Usar el formato de tag: `// Feature: express-ecommerce-platform, Property N: [property text]`
- Implementar exactamente UNA propiedad del documento de diseño

### Test Organization

```
tests/
├── unit/
│   ├── models/
│   │   ├── User.test.js
│   │   ├── Product.test.js
│   │   └── Order.test.js
│   ├── controllers/
│   │   ├── authController.test.js
│   │   ├── productController.test.js
│   │   └── cartController.test.js
│   └── middleware/
│       ├── auth.test.js
│       └── upload.test.js
├── property/
│   ├── models.property.test.js
│   ├── auth.property.test.js
│   ├── products.property.test.js
│   ├── cart.property.test.js
│   ├── orders.property.test.js
│   └── api.property.test.js
├── integration/
│   ├── auth.integration.test.js
│   ├── products.integration.test.js
│   └── checkout.integration.test.js
└── helpers/
    ├── testDb.js
    ├── generators.js
    └── fixtures.js
```

### Unit Testing Focus

Unit tests deben enfocarse en:
- Ejemplos específicos que demuestran comportamiento correcto
- Casos edge (empty inputs, boundary values, null/undefined)
- Condiciones de error (invalid data, missing fields, constraint violations)
- Puntos de integración entre componentes
- Lógica de negocio específica

**Evitar escribir demasiados unit tests** - los property tests manejan la cobertura de muchos inputs.

### Property Testing Focus

Property tests deben enfocarse en:
- Propiedades universales que se mantienen para todos los inputs
- Invariantes del sistema (ej: passwords siempre hasheados)
- Round-trip properties (ej: serialize → deserialize)
- Relaciones metamórficas (ej: filtrar reduce o mantiene tamaño)
- Cobertura comprehensiva a través de randomización

### Example Property Test Structure

```javascript
// Feature: express-ecommerce-platform, Property 3: Password Hashing Invariant
describe('Property 3: Password Hashing Invariant', () => {
  it('should never store passwords in plain text', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 50 }),
          name: fc.string({ minLength: 1, maxLength: 100 })
        }),
        async (userData) => {
          // Create user
          const user = await User.create(userData)
          
          // Fetch from database
          const savedUser = await User.findByPk(user.id)
          
          // Property: stored password must never equal plain text password
          expect(savedUser.password).not.toBe(userData.password)
          expect(savedUser.password).toMatch(/^\$2[aby]\$/) // bcrypt hash format
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Example Unit Test Structure

```javascript
describe('AuthController - Login', () => {
  it('should create session on successful login', async () => {
    // Arrange
    const user = await User.create({
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Test User',
      role: 'customer'
    })
    
    // Act
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
    
    // Assert
    expect(response.status).toBe(302) // Redirect
    expect(response.headers.location).toBe('/')
    expect(response.headers['set-cookie']).toBeDefined()
  })
  
  it('should reject login with invalid password', async () => {
    // Arrange
    await User.create({
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Test User'
    })
    
    // Act
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
    
    // Assert
    expect(response.status).toBe(401)
    expect(response.body.message).toContain('Invalid credentials')
  })
})
```

### Test Data Generators

Para property-based testing, crear generators reutilizables:

```javascript
// helpers/generators.js
const fc = require('fast-check')

const generators = {
  user: () => fc.record({
    email: fc.emailAddress(),
    password: fc.string({ minLength: 8, maxLength: 50 }),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    role: fc.constantFrom('admin', 'customer')
  }),
  
  product: () => fc.record({
    name: fc.string({ minLength: 1, maxLength: 200 }),
    description: fc.string({ maxLength: 1000 }),
    price: fc.float({ min: 0.01, max: 10000, noNaN: true }),
    stock: fc.integer({ min: 0, max: 10000 }),
    featured: fc.boolean()
  }),
  
  category: () => fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ maxLength: 500 })
  }),
  
  cartItem: () => fc.record({
    productId: fc.integer({ min: 1, max: 1000 }),
    quantity: fc.integer({ min: 1, max: 100 })
  })
}

module.exports = generators
```

### Integration Testing

Integration tests verifican que múltiples componentes trabajen juntos correctamente:

```javascript
describe('Checkout Integration', () => {
  it('should complete full checkout flow', async () => {
    // Setup: Create user, products, add to cart
    const user = await createTestUser()
    const product = await createTestProduct({ price: 100, stock: 10 })
    
    // Login
    const agent = request.agent(app)
    await agent.post('/auth/login').send({ 
      email: user.email, 
      password: 'password123' 
    })
    
    // Add to cart
    await agent.post('/cart/add').send({ 
      productId: product.id, 
      quantity: 2 
    })
    
    // Checkout
    const response = await agent.post('/checkout').send({
      shippingAddress: '123 Test St',
      city: 'Test City',
      postalCode: '12345',
      cardNumber: '4242424242424242',
      paymentMethod: 'credit_card'
    })
    
    // Verify order created
    expect(response.status).toBe(302)
    const order = await Order.findOne({ where: { userId: user.id } })
    expect(order).toBeDefined()
    expect(order.total).toBe(200)
    
    // Verify stock decreased
    const updatedProduct = await Product.findByPk(product.id)
    expect(updatedProduct.stock).toBe(8)
    
    // Verify cart cleared
    const cart = await agent.get('/cart')
    expect(cart.body.cart).toHaveLength(0)
  })
})
```

### Test Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Property Tests**: All 35 correctness properties implemented
- **Integration Tests**: All critical user flows covered
- **API Tests**: All endpoints tested with valid and invalid inputs

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run property tests only
npm run test:property

# Run integration tests only
npm run test:integration

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

