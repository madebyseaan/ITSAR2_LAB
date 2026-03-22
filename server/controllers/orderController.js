/**
 * orderController.js
 * Business Logic Layer
 * 
 * Enforces all business rules for order processing:
 * - Validates product existence
 * - Validates quantity constraints
 * - Checks stock availability
 * - Persists state changes to products.json
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

/**
 * Read current products from JSON file
 */
function loadProducts() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products file:', error);
    return [];
  }
}

/**
 * Save products to JSON file (persist state)
 */
function saveProducts(products) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving products file:', error);
    return false;
  }
}

/**
 * Get all products
 * GET /api/products
 */
function getAllProducts(req, res) {
  try {
    const products = loadProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to retrieve products'
    });
  }
}

/**
 * Get product by ID
 * GET /api/products/:id
 */
function getProductById(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const products = loadProducts();
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({
        error: 'PRODUCT_NOT_FOUND',
        message: `Product with ID ${productId} does not exist`
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to retrieve product'
    });
  }
}

/**
 * Place an order
 * POST /api/orders
 * 
 * Business Logic: Enforces all validation rules
 */
function placeOrder(req, res) {
  try {
    // RULE 1: Check for required fields
    const { productId, quantity } = req.body;

    if (productId === undefined || quantity === undefined) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Missing required fields: productId, quantity'
      });
    }

    // RULE 2: Validate quantity is an integer (no floats)
    if (!Number.isInteger(quantity)) {
      return res.status(400).json({
        error: 'INVALID_QUANTITY',
        message: 'Quantity must be an integer'
      });
    }

    // RULE 3: Validate quantity is positive (> 0)
    if (quantity <= 0) {
      return res.status(400).json({
        error: 'INVALID_QUANTITY',
        message: 'Quantity must be a positive integer greater than zero'
      });
    }

    // Load products from file
    const products = loadProducts();

    // RULE 4: Verify product exists
    const product = products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({
        error: 'PRODUCT_NOT_FOUND',
        message: `Product with ID ${productId} does not exist`
      });
    }

    // RULE 5: Check if stock is available (general check)
    if (product.stock === 0) {
      return res.status(400).json({
        error: 'OUT_OF_STOCK',
        message: `Product '${product.name}' is out of stock`
      });
    }

    // RULE 6 & 7: Check if requested quantity exceeds available stock
    if (quantity > product.stock) {
      return res.status(400).json({
        error: 'STOCK_EXCEEDED',
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`
      });
    }

    // ✅ ALL BUSINESS RULES PASSED - Process the order
    const totalPrice = product.price * quantity;
    const remainingStock = product.stock - quantity;

    // Update product stock
    product.stock = remainingStock;

    // Persist changes to file
    const saved = saveProducts(products);
    if (!saved) {
      return res.status(500).json({
        error: 'SERVER_ERROR',
        message: 'Failed to process order'
      });
    }

    // Return success response
    res.status(201).json({
      message: 'Order successful',
      product: product.name,
      quantity: quantity,
      pricePerUnit: product.price,
      totalPrice: totalPrice,
      remainingStock: remainingStock
    });

  } catch (error) {
    console.error('Unexpected error in placeOrder:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred'
    });
  }
}

/**
 * Reset products to seed baseline (utility for testing)
 * POST /api/reset
 */
function resetProducts(req, res) {
  try {
    const seedData = fs.readFileSync(path.join(__dirname, '../data/products.seed.json'), 'utf8');
    fs.writeFileSync(PRODUCTS_FILE, seedData, 'utf8');
    
    const products = JSON.parse(seedData);
    res.status(200).json({
      message: 'Products reset to baseline',
      products: products
    });
  } catch (error) {
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to reset products'
    });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  placeOrder,
  resetProducts
};
