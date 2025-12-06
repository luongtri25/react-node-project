// Source - https://stackoverflow.com/a
// Posted by josipat, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-25, License - CC BY-SA 4.0

const { createProxyMiddleware } = require('http-proxy-middleware');

const target = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
