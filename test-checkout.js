/**
 * Script de prueba para el proceso de checkout
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const { syncDatabase, Product, User } = require('./models');

console.log('🧪 PRUEBA DEL PROCESO DE CHECKOUT\n');
console.log('═══════════════════════════════════════════════════════\n');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
app.use('/auth', authRoutes);
app.use('/', publicRoutes);

async function testCheckout() {
  try {
    await syncDatabase();
    console.log('✓ Base de datos sincronizada\n');
    
    const product = await Product.findOne();
    const user = await User.findOne({ where: { role: 'customer' } });
    
    if (!product || !user) {
      console.error('✗ Faltan datos. Ejecuta: npm run seed');
      process.exit(1);
    }
    
    console.log('📦 Producto:', product.name, `($${product.price})`);
    console.log('👤 Usuario:', user.email);
    console.log();
    
    const server = app.listen(0, async () => {
      const port = server.address().port;
      console.log(`🚀 Servidor en puerto ${port}\n`);
      
      const agent = require('superagent');
      const request = agent.agent();
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('PASO 1: Agregar producto al carrito');
      console.log('═══════════════════════════════════════════════════════\n');
      
      const addRes = await request
        .post(`http://localhost:${port}/cart/add`)
        .send({ productId: product.id, quantity: 2 })
        .set('Content-Type', 'application/json');
      
      console.log('Respuesta:', addRes.body);
      console.log();
      
      if (!addRes.body.success) {
        console.log('✗ No se pudo agregar al carrito');
        server.close();
        process.exit(1);
      }
      
      console.log('✓ Producto agregado (cantidad: 2)\n');
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('PASO 2: Simular login (agregar userId a sesión)');
      console.log('═══════════════════════════════════════════════════════\n');
      
      // Necesitamos hacer login real
      const loginRes = await request
        .post(`http://localhost:${port}/auth/login`)
        .send({ email: user.email, password: 'password123' })
        .set('Content-Type', 'application/json');
      
      console.log('Login status:', loginRes.status);
      console.log();
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('PASO 3: Cargar página de checkout');
      console.log('═══════════════════════════════════════════════════════\n');
      
      try {
        const checkoutPageRes = await request.get(`http://localhost:${port}/checkout`);
        console.log('✓ Página de checkout cargada');
        console.log('  Status:', checkoutPageRes.status);
        
        // Buscar el total en el HTML
        const totalMatch = checkoutPageRes.text.match(/Total:\s*\$?([\d,]+\.?\d*)/i);
        if (totalMatch) {
          console.log(`  Total encontrado en HTML: $${totalMatch[1]}`);
          const expectedTotal = (parseFloat(product.price) * 2).toFixed(2);
          console.log(`  Total esperado: $${expectedTotal}`);
          
          if (totalMatch[1].replace(',', '') === expectedTotal) {
            console.log('✓ El total se calcula correctamente\n');
          } else {
            console.log('✗ El total NO coincide\n');
          }
        } else {
          console.log('✗ No se encontró el total en el HTML\n');
        }
      } catch (error) {
        console.log('✗ Error al cargar checkout:', error.message, '\n');
      }
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('PASO 4: Procesar pago');
      console.log('═══════════════════════════════════════════════════════\n');
      
      const checkoutData = {
        shippingAddress: 'Calle Principal 123',
        city: 'San Juan de los Morros',
        postalCode: '2301',
        cardNumber: '4242424242424242',
        cardName: 'Test User',
        cardExpiry: '12/25',
        cardCVV: '123'
      };
      
      console.log('Datos del checkout:', checkoutData);
      console.log();
      
      try {
        const paymentRes = await request
          .post(`http://localhost:${port}/checkout`)
          .send(checkoutData)
          .set('Content-Type', 'application/json');
        
        console.log('Respuesta del pago:');
        console.log('  Status:', paymentRes.status);
        console.log('  Body:', JSON.stringify(paymentRes.body, null, 2));
        console.log();
        
        if (paymentRes.body.success) {
          console.log('✓ PAGO PROCESADO EXITOSAMENTE');
          console.log(`  Order ID: ${paymentRes.body.orderId}`);
          console.log(`  Transaction ID: ${paymentRes.body.transactionId}`);
          console.log();
        } else {
          console.log('✗ PAGO RECHAZADO');
          console.log(`  Error: ${paymentRes.body.error}`);
          console.log();
        }
      } catch (error) {
        console.log('✗ ERROR AL PROCESAR PAGO');
        console.log('  Error:', error.message);
        if (error.response) {
          console.log('  Response:', error.response.body);
        }
        console.log();
      }
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('RESUMEN');
      console.log('═══════════════════════════════════════════════════════\n');
      console.log('Prueba completada. Revisa los resultados arriba.\n');
      
      server.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('✗ Error fatal:', error);
    process.exit(1);
  }
}

testCheckout();
