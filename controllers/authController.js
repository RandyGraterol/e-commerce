const { User } = require('../models');

// Show register form
const showRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Registro',
    layout: 'layouts/main-layout',
    error: null
  });
};

// Process registration
const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Validate required fields
    if (!email || !password || !name) {
      return res.render('auth/register', {
        title: 'Registro',
        layout: 'layouts/main-layout',
        error: 'Todos los campos son requeridos'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Registro',
        layout: 'layouts/main-layout',
        error: 'El email ya está registrado'
      });
    }
    
    // Create user (password will be hashed by beforeCreate hook)
    await User.create({
      email,
      password,
      name,
      role: role || 'customer'
    });
    
    // Redirect to login with success message
    res.redirect('/auth/login?registered=true');
    
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', {
      title: 'Registro',
      layout: 'layouts/main-layout',
      error: 'Error al registrar usuario'
    });
  }
};

// Show login form
const showLogin = (req, res) => {
  const registered = req.query.registered === 'true';
  res.render('auth/login', {
    title: 'Iniciar Sesión',
    layout: 'layouts/main-layout',
    error: null,
    success: registered ? 'Registro exitoso. Por favor inicia sesión.' : null
  });
};

// Process login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.render('auth/login', {
        title: 'Iniciar Sesión',
        layout: 'layouts/main-layout',
        error: 'Email y contraseña son requeridos',
        success: null
      });
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render('auth/login', {
        title: 'Iniciar Sesión',
        layout: 'layouts/main-layout',
        error: 'Credenciales inválidas',
        success: null
      });
    }
    
    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.render('auth/login', {
        title: 'Iniciar Sesión',
        layout: 'layouts/main-layout',
        error: 'Credenciales inválidas',
        success: null
      });
    }
    
    // Create session
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.role = user.role;
    
    // Redirect based on role
    const returnTo = req.session.returnTo || (user.role === 'admin' ? '/admin/dashboard' : '/');
    delete req.session.returnTo;
    res.redirect(returnTo);
    
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', {
      title: 'Iniciar Sesión',
      layout: 'layouts/main-layout',
      error: 'Error al iniciar sesión',
      success: null
    });
  }
};

// Process logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
};

module.exports = {
  showRegister,
  register,
  showLogin,
  login,
  logout
};
