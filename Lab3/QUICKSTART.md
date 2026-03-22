# Lab 3 - Quick Start Guide

## 1. Install Dependencies

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab3\server
npm install
```

This installs Express.js and dotenv.

---

## 2. Start the API Server

```powershell
# Terminal 1
cd C:\Users\Sean\Desktop\SAR2\Lab3\server
node server.js
```

You should see:

```
╔════════════════════════════════════════════════════════════╗
║     Lab 3 - Business Logic API Server                      ║
║     ITSAR2 313 - System Architecture & Integration 2       ║
╚════════════════════════════════════════════════════════════╝

✓ Server running on: http://localhost:3000
✓ API Base URL: http://localhost:3000/api

Available Endpoints:
  GET  /api/products          - List all products
  GET  /api/products/:id      - Get product by ID
  POST /api/orders            - Place an order
  POST /api/reset             - Reset to baseline (testing)

Ready to accept curl requests...
```

---

## 3. Run curl Tests

```powershell
# Terminal 2
cd C:\Users\Sean\Desktop\SAR2\Lab3

# All test commands are in tests/curl-tests.md
# Examples:

curl.exe -i http://localhost:3000/api/products
curl.exe -i http://localhost:3000/api/products/1
'{"productId":1,"quantity":2}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-"
```

All test evidence files save to `docs/evidence/`

---

## 4. Business Logic Validation Rules

The API enforces these rules in order:

1. **Check required fields** → 400 VALIDATION_ERROR
2. **Validate quantity is integer** → 400 INVALID_QUANTITY
3. **Validate quantity > 0** → 400 INVALID_QUANTITY
4. **Product must exist** → 404 PRODUCT_NOT_FOUND
5. **Product must have stock > 0** → 400 OUT_OF_STOCK
6. **Quantity must not exceed stock** → 400 STOCK_EXCEEDED
7. ✓ **Process order, deduct stock, persist to file** → 201 Created

---

## 5. Project Structure

```
Lab3/
├── README.md                  ← Full documentation
├── server/
│   ├── server.js              ← Express app (port 3000)
│   ├── controllers/
│   │   └── orderController.js ← All business logic
│   ├── data/
│   │   ├── products.seed.json ← Baseline (5 products)
│   │   └── products.json      ← Current state (persists orders)
│   └── package.json
├── tests/
│   └── curl-tests.md          ← 17 test scenarios
└── docs/
    ├── evidence/              ← curl test output files
    └── report.md              ← Your findings
```

---

## 6. Products

| ID | Name | Price | Initial Stock |
|----|------|-------|---------------|
| 1 | Laptop | $999 | 10 |
| 2 | Smartphone | $599 | 25 |
| 3 | Tablet | $399 | 15 |
| 4 | Monitor | $299 | 8 |
| 5 | Keyboard | $79 | 50 |

---

## 7. Example Success Response

```json
{
  "message": "Order successful",
  "product": "Laptop",
  "quantity": 2,
  "pricePerUnit": 999,
  "totalPrice": 1998,
  "remainingStock": 8
}
```

---

## 8. Example Error Response

```json
{
  "error": "STOCK_EXCEEDED",
  "message": "Insufficient stock. Available: 8, Requested: 100"
}
```

---

## Ready to Test!

All the infrastructure is set. Follow the curl test commands in `tests/curl-tests.md` to validate the API.
