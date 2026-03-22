/**
 * server.js
 * Express.js API Server
 * Presentation Layer: Receives HTTP requests and delegates to business logic
 * 
 * Port: 3000 (default)
 * Base URL: http://localhost:3000
 */

require('dotenv').config();
const express = require('express');
const orderController = require('./controllers/orderController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Lab 3 - Business Logic API',
    status: 'running',
    endpoints: {
      products: 'GET /api/products',
      product: 'GET /api/products/:id',
      placeOrder: 'POST /api/orders',
      reset: 'POST /api/reset'
    }
  });
});

// ==================== API Routes ====================

/**
 * GET /api/products
 * Retrieve all products with current inventory
 */
app.get('/api/products', orderController.getAllProducts);

/**
 * GET /api/products/:id
 * Retrieve specific product by ID
 */
app.get('/api/products/:id', orderController.getProductById);

/**
 * POST /api/orders
 * Place an order with business logic validation
 * 
 * Request Body:
 * {
 *   "productId": number,
 *   "quantity": number
 * }
 * 
 * Validates:
 * - Required fields present
 * - Quantity is positive integer
 * - Product exists
 * - Stock available
 */
app.post('/api/orders', orderController.placeOrder);

/**
 * POST /api/reset
 * Reset products to seed baseline (testing utility)
 */
app.post('/api/reset', orderController.resetProducts);

// ==================== 404 Handler ====================
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint not found'
  });
});

// ==================== Error Handler ====================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'SERVER_ERROR',
    message: 'Internal server error'
  });
});

// ==================== Server Startup ====================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     Lab 3 - Business Logic API Server                      ║
║     ITSAR2 313 - System Architecture & Integration 2       ║
╚════════════════════════════════════════════════════════════╝

✓ Server running on: http://localhost:${PORT}
✓ API Base URL: http://localhost:${PORT}/api

Available Endpoints:
  GET  /api/products          - List all products
  GET  /api/products/:id      - Get product by ID
  POST /api/orders            - Place an order
  POST /api/reset             - Reset to baseline (testing)

Ready to accept curl requests...
  `);
});

module.exports = app;
