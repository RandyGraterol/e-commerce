/**
 * Script de prueba para verificar el sistema de carrito
 * Ejecutar con: node test-cart.js
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { Product, syncDatabase } = require('./models');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use(session({
  store: new SQLiteStore({
    db: 'test-sessions.sqlite',
    dir: './'
  }),
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Importar controlador
const cartController = require('./controllers/cartController');

// Rutas de prueba
app.post('/cart/add', cartController.addToCart);
app.get('/cart', cartController.getCart);

// Función de prueba
async function testCart() {
  console.log('🧪 Iniciando pruebas del carrito...\n');
  
  try {
    // Sincronizar base de datos
    await syncDatabase();
    console.log('✓ Base de datos sincronizada\n');
    
    // Obtener un producto de prueba
    const product = await Product.findOne();
    if (!product) {
      console.error('✗ No hay productos en la base de datos');
      console.log('  Ejecuta: npm run seed\n');
      process.exit(1);
    }
    
    console.log(`📦 Producto de prueba:`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Nombre: ${product.name}`);
    console.log(`   Precio: $${product.price}`);
    console.log(`   Stock: ${product.stock}\n`);
    
    // Iniciar servidor de prueba
    const server = app.listen(0, async () => {
      const port = server.address().port;
      console.log(`🚀 Servidor de prueba en puerto ${port}\n`);
      
      // Realizar pruebas
      const fetch = (await import('node-fetch')).default;
      const baseUrl = `http://localhost:${port}`;
      
      // Crear una sesión simulada
      const agent = require('superagent');
      const request = agent.agent();
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('TEST 1: Agregar producto al carrito (primera vez)');
      console.log('═══════════════════════════════════════════════════════\n');
      
      try {
        const res1 = await request
          .post(`${baseUrl}/cart/add`)
          .send({ productId: product.id, quantity: 1 })
          .set('Content-Type', 'application/json');
        
        console.log('Respuesta:', res1.body);
        
        if (res1.body.success) {
          console.log('✓ TEST 1 PASADO: Producto agregado correctamente\n');
        } else {
          console.log('✗ TEST 1 FALLIDO:', res1.body.error, '\n');
        }
      } catch (error) {
        console.log('✗ TEST 1 ERROR:', error.message, '\n');
      }
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('TEST 2: Agregar mismo producto (incrementar cantidad)');
      console.log('═══════════════════════════════════════════════════════\n');
      
      try {
        const res2 = await request
          .post(`${baseUrl}/cart/add`)
          .send({ productId: product.id, quantity: 2 })
          .set('Content-Type', 'application/json');
        
        console.log('Respuesta:', res2.body);
        
        if (res2.body.success) {
          console.log('✓ TEST 2 PASADO: Cantidad incrementada correctamente\n');
        } else {
          console.log('✗ TEST 2 FALLIDO:', res2.body.error, '\n');
        }
      } catch (error) {
        console.log('✗ TEST 2 ERROR:', error.message, '\n');
      }
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('TEST 3: Agregar producto con productId como string');
      console.log('═══════════════════════════════════════════════════════\n');
      
      try {
        const res3 = await request
          .post(`${baseUrl}/cart/add`)
          .send({ productId: String(product.id), quantity: 1 })
          .set('Content-Type', 'application/json');
        
        console.log('Respuesta:', res3.body);
        
        if (res3.body.success) {
          console.log('✓ TEST 3 PASADO: ProductId como string funciona\n');
        } else {
          console.log('✗ TEST 3 FALLIDO:', res3.body.error, '\n');
        }
      } catch (error) {
        console.log('✗ TEST 3 ERROR:', error.message, '\n');
      }
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('TEST 4: Verificar contenido del carrito');
      console.log('═══════════════════════════════════════════════════════\n');
      
      try {
        const res4 = await request.get(`${baseUrl}/cart`);
        
        console.log('Status:', res4.status);
        console.log('Content-Type:', res4.headers['content-type']);
        
        if (res4.status === 200) {
          console.log('✓ TEST 4 PASADO: Carrito cargado correctamente\n');
          
          // Intentar extraer información del HTML
          if (res4.text.includes('Carrito de Compras')) {
            console.log('✓ Página del carrito renderizada correctamente\n');
          }
        } else {
          console.log('✗ TEST 4 FALLIDO: Status', res4.status, '\n');
        }
      } catch (error) {
        console.log('✗ TEST 4 ERROR:', error.message, '\n');
      }
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('TEST 5: Agregar producto sin stock');
      console.log('═══════════════════════════════════════════════════════\n');
      
      try {
        const res5 = await request
          .post(`${baseUrl}/cart/add`)
          .send({ productId: product.id, quantity: 99999 })
          .set('Content-Type', 'application/json');
        
        console.log('Respuesta:', res5.body);
        
        if (!res5.body.success && res5.body.error.includes('Stock insuficiente')) {
          console.log('✓ TEST 5 PASADO: Validación de stock funciona\n');
        } else {
          console.log('✗ TEST 5 FALLIDO: Debería rechazar por falta de stock\n');
        }
      } catch (error) {
        console.log('✗ TEST 5 ERROR:', error.message, '\n');
      }
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('TEST 6: Agregar producto inexistente');
      console.log('═══════════════════════════════════════════════════════\n');
      
      try {
        const res6 = await request
          .post(`${baseUrl}/cart/add`)
          .send({ productId: 99999, quantity: 1 })
          .set('Content-Type', 'application/json');
        
        console.log('Respuesta:', res6.body);
        
        if (!res6.body.success && res6.body.error.includes('no encontrado')) {
          console.log('✓ TEST 6 PASADO: Validación de producto existente funciona\n');
        } else {
          console.log('✗ TEST 6 FALLIDO: Debería rechazar producto inexistente\n');
        }
      } catch (error) {
        console.log('✗ TEST 6 ERROR:', error.message, '\n');
      }
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('RESUMEN DE PRUEBAS');
      console.log('═══════════════════════════════════════════════════════\n');
      console.log('✓ Pruebas completadas');
      console.log('  Revisa los resultados arriba para ver si hay fallos\n');
      
      // Cerrar servidor
      server.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('✗ Error en las pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar pruebas
testCart();
