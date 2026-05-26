module.exports = function(app) {
  app.use(function(req, res, next) {
    // This explicitly tells the browser to allow external popups (Firebase)
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
    next();
  });
};