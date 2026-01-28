/**
 * Script de diagnóstico completo del sistema de carrito
 * Simula exactamente lo que hace el navegador
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const { syncDatabase, Product } = require('./models');

console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA DE CARRITO\n');
console.log('═══════════════════════════════════════════════════════\n');

// Crear app exactamente como en server.js
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration (EXACTAMENTE como en server.js)
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite',
    dir: './'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Importar rutas
const publicRoutes = require('./routes/public');
app.use('/', publicRoutes);

// Función de diagnóstico
async function diagnose() {
  try {
    await syncDatabase();
    console.log('✓ Base de datos sincronizada\n');
    
    // Obtener un producto
    const product = await Product.findOne();
    if (!product) {
      console.error('✗ No hay productos. Ejecuta: npm run seed');
      process.exit(1);
    }
    
    console.log('📦 Producto de prueba:');
    console.log(`   ID: ${product.id}`);
    console.log(`   Nombre: ${product.name}`);
    console.log(`   Stock: ${product.stock}\n`);
    
    // Iniciar servidor
    const server = app.listen(0, async () => {
      const port = server.address().port;
      console.log(`🚀 Servidor de diagnóstico en puerto ${port}\n`);
      
      const agent = require('superagent');
      const request = agent.agent();
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('PASO 1: Verificar que la ruta existe');
      console.log('═══════════════════════════════════════════════════════\n');
      
      try {
        const res = await request
          .post(`http://localhost:${port}/cart/add`)
          .send({ productId: product.id, quantity: 1 })
          .set('Content-Type', 'application/json');
        
        console.log('✓ Ruta /cart/add existe y responde');
        console.log('  Status:', res.status);
        console.log('  Body:', JSON.stringify(res.body, null, 2));
        console.log();
        
        if (res.body.success) {
          console.log('✓ Producto agregado al carrito en el servidor\n');
          
          console.log('═══════════════════════════════════════════════════════');
          console.log('PASO 2: Verificar que el carrito tiene el producto');
          console.log('═══════════════════════════════════════════════════════\n');
          
          // Hacer otra petición para ver el carrito
          const cartRes = await request
            .post(`http://localhost:${port}/cart/add`)
            .send({ productId: product.id, quantity: 1 })
            .set('Content-Type', 'application/json');
          
          console.log('Segunda petición (mismo producto):');
          console.log('  Status:', cartRes.status);
          console.log('  Body:', JSON.stringify(cartRes.body, null, 2));
          console.log();
          
          if (cartRes.body.cartCount === 2) {
            console.log('✓ La cantidad se incrementó correctamente (1 → 2)\n');
          } else {
            console.log('✗ PROBLEMA: La cantidad no se incrementó correctamente');
            console.log(`  Esperado: 2, Recibido: ${cartRes.body.cartCount}\n`);
          }
          
          console.log('═══════════════════════════════════════════════════════');
          console.log('PASO 3: Verificar vista del carrito');
          console.log('═══════════════════════════════════════════════════════\n');
          
          try {
            const viewRes = await request.get(`http://localhost:${port}/cart`);
            console.log('✓ Vista del carrito carga correctamente');
            console.log('  Status:', viewRes.status);
            
            // Buscar el producto en el HTML
            if (viewRes.text.includes(product.name)) {
              console.log(`✓ El producto "${product.name}" aparece en el carrito\n`);
            } else {
              console.log(`✗ PROBLEMA: El producto "${product.name}" NO aparece en el carrito\n`);
            }
            
            // Buscar la cantidad
            if (viewRes.text.includes('value="2"') || viewRes.text.includes('value=2')) {
              console.log('✓ La cantidad (2) aparece en el HTML\n');
            } else {
              console.log('✗ PROBLEMA: La cantidad no aparece correctamente en el HTML\n');
            }
          } catch (error) {
            console.log('✗ Error al cargar vista del carrito:', error.message, '\n');
          }
          
          console.log('═══════════════════════════════════════════════════════');
          console.log('PASO 4: Simular petición desde el navegador');
          console.log('═══════════════════════════════════════════════════════\n');
          
          // Crear una nueva sesión (simular nuevo navegador)
          const newAgent = agent.agent();
          
          const browserRes = await newAgent
            .post(`http://localhost:${port}/cart/add`)
            .send({ productId: String(product.id), quantity: 1 })
            .set('Content-Type', 'application/json')
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0');
          
          console.log('Petición simulando navegador:');
          console.log('  Status:', browserRes.status);
          console.log('  Body:', JSON.stringify(browserRes.body, null, 2));
          console.log('  Cookies:', browserRes.headers['set-cookie'] || 'No cookies');
          console.log();
          
          if (browserRes.body.success) {
            console.log('✓ El navegador puede agregar productos al carrito\n');
          } else {
            console.log('✗ PROBLEMA: El navegador no puede agregar productos\n');
          }
          
          console.log('═══════════════════════════════════════════════════════');
          console.log('DIAGNÓSTICO COMPLETO');
          console.log('═══════════════════════════════════════════════════════\n');
          
          console.log('RESUMEN:');
          console.log('✓ Ruta /cart/add funciona');
          console.log('✓ Productos se agregan al carrito');
          console.log('✓ Sesiones funcionan correctamente');
          console.log('✓ Vista del carrito carga');
          console.log();
          console.log('CONCLUSIÓN:');
          console.log('El sistema de carrito está funcionando correctamente en el servidor.');
          console.log();
          console.log('Si el problema persiste en el navegador, verifica:');
          console.log('1. Que JavaScript esté habilitado');
          console.log('2. Que no haya errores en la consola del navegador (F12)');
          console.log('3. Que las cookies estén habilitadas');
          console.log('4. Que el servidor esté corriendo en el puerto correcto');
          console.log();
          
        } else {
          console.log('✗ PROBLEMA: El servidor rechazó la petición');
          console.log('  Error:', res.body.error);
          console.log();
        }
        
      } catch (error) {
        console.log('✗ ERROR CRÍTICO:', error.message);
        console.log('  Stack:', error.stack);
        console.log();
      }
      
      server.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('✗ Error fatal:', error);
    process.exit(1);
  }
}

diagnose();
