require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const { syncDatabase } = require('./models');
const { attachUser } = require('./middleware/auth');
const { notFound, errorHandler, handleMulterError } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Serve .well-known directory explicitly (for Chrome DevTools and other tools)
app.use('/.well-known', express.static(path.join(__dirname, 'public/.well-known'), {
  dotfiles: 'allow'
}));

// Session configuration
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite',
    dir: './'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main-layout');

// Attach user to res.locals
app.use(attachUser);

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const clientRoutes = require('./routes/client');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/client', clientRoutes);
app.use('/', publicRoutes);

// Multer error handler
app.use(handleMulterError);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  await syncDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

module.exports = app;
