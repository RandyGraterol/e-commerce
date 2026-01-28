// 404 Not Found handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Determine status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Handle different response types
  const acceptHeader = req.headers.accept || '';
  if (req.xhr || acceptHeader.indexOf('json') > -1) {
    // JSON response for API requests
    return res.status(statusCode).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  
  // HTML response for browser requests
  if (statusCode === 404) {
    return res.status(404).render('errors/404', {
      title: 'Page Not Found',
      message: err.message,
      layout: 'layouts/main-layout'
    });
  }
  
  // 500 Internal Server Error
  res.status(statusCode).render('errors/500', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    layout: 'layouts/main-layout'
  });
};

// Multer error handler
const handleMulterError = (err, req, res, next) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum is 5 files.'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next(err);
};

module.exports = {
  notFound,
  errorHandler,
  handleMulterError
};
