// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  
  // Store the original URL to redirect after login
  req.session.returnTo = req.originalUrl;
  
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  
  res.redirect('/auth/login');
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'admin') {
    return next();
  }
  
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  
  res.status(403).render('errors/403', { 
    title: 'Access Denied',
    message: 'You do not have permission to access this page.'
  });
};

// Middleware to check if user is customer
const isCustomer = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'customer') {
    return next();
  }
  
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(403).json({ success: false, error: 'Customer access required' });
  }
  
  res.status(403).render('errors/403', { 
    title: 'Access Denied',
    message: 'This page is only accessible to customers.'
  });
};

// Middleware to attach user info to res.locals for views
const attachUser = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.user = {
      id: req.session.userId,
      name: req.session.userName,
      email: req.session.userEmail,
      role: req.session.role
    };
  } else {
    res.locals.user = null;
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isCustomer,
  attachUser
};
