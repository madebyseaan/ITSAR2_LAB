# Lab 3 — Systems on Business Logic

### ITSAR2 313 – System Architecture and Integration 2
### Section: BIST 3B

## Members

| # | Name |
| --- | --- |
| 1 | Roma, Sean Justin |
| 2 | Labrador, Mariene |
| 3 | Garcia, Sophia Christi |
| 4 | Bermejo, Kate Nicole |
| 5 | Andura, Carla |

## GitHub

> **Repository (Lab 3):** [./](./)

---

## Objective

Students will understand and implement the role of business logic in system architecture by:
- Separating presentation, business logic, and data layers
- Implementing a simple Product Ordering API
- Validating business rules using curl-based testing
- Handling invalid input and rule violations

---

## Introduction

Business logic refers to the rules and processes that control how data is created, modified, and validated within a system. It acts as the decision-making layer of an application.

**Example:** In an online store system:
- **Presentation Layer** (curl client): Handles HTTP requests
- **Business Logic Layer** (API): Processes orders and validates rules
- **Data Layer** (products.json): Stores products and inventory

**Common Business Rule:** A customer cannot place an order if stock is zero or if the quantity exceeds available inventory.

---

## System Architecture

| Layer | Component | Responsibility |
| --- | --- | --- |
| Presentation | curl client | Sends HTTP requests to API |
| Business Logic | server/controllers/orderController.js | Validates rules, processes orders, enforces constraints |
| Data | server/data/products.json | Stores products and current stock levels |

---

## Stack

| Layer | Technology |
| --- | --- |
| API Server | Node.js + Express |
| Data Storage | JSON file (products.json) |
| Testing | curl |

---

## Seeded Data (Products Inventory)

Initial products reset on every setup from `server/data/products.seed.json`:

| Product | Stock | Price |
| --- | --- | --- |
| Laptop | 10 | $999 |
| Smartphone | 25 | $599 |
| Tablet | 15 | $399 |
| Monitor | 8 | $299 |
| Keyboard | 50 | $79 |

---

## Prerequisites

- Node.js 18+
- npm
- curl
- PowerShell or Git Bash

---

## Setup (Windows · Mac · Linux)

From the Lab3 root:

### Option 1: Quick Setup

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab3\server
npm install
```

### Option 2: Manual Setup

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab3\server
npm install
cp .env.example .env
```

Setup does:
- Installs Node.js dependencies if needed
- Copies `.env` from `.env.example` if missing
- Resets `server/data/products.json` to seeded baseline (5 products, original stock)

> Why first run can take time: npm must download packages
> 
> Reruns are faster because `node_modules/` is reused

---

## Running the API

From the server folder:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab3\server
node server.js
```

API runs on: **http://localhost:3000**

---

## Terminal Note (Windows)

Use **PowerShell** directly. If using Command Prompt, switch to PowerShell or use Git Bash.

---

## API Endpoints

| Method | Endpoint | Description | Response |
| --- | --- | --- | --- |
| GET | `/api/products` | List all products with current stock | Array of products |
| GET | `/api/products/:id` | Get specific product by ID | Product object |
| POST | `/api/orders` | Place an order (business logic) | Success/Error message |

### GET /api/products
Returns all available products with current inventory levels.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Laptop",
    "price": 999,
    "stock": 10
  },
  {
    "id": 2,
    "name": "Smartphone",
    "price": 599,
    "stock": 25
  }
]
```

### GET /api/products/:id
Returns a specific product by ID.

**Response (200):**
```json
{
  "id": 1,
  "name": "Laptop",
  "price": 999,
  "stock": 10
}
```

### POST /api/orders
**Business Logic Layer:** Processes order requests and enforces all validation rules.

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 5
}
```

**Response (201 - Success):**
```json
{
  "message": "Order successful",
  "product": "Laptop",
  "quantity": 5,
  "totalPrice": 4995,
  "remainingStock": 5
}
```

**Response (400/404 - Business Rule Violation):**
```json
{
  "error": "ERROR_CODE",
  "message": "Descriptive error message"
}
```

---

## Business Rules & Validation

The business logic layer enforces the following rules:

| Rule | Validation | Error Code | HTTP Status |
| --- | --- | --- | --- |
| Product must exist | Check if productId is in database | PRODUCT_NOT_FOUND | 404 |
| Quantity must be provided | Check if quantity field exists | VALIDATION_ERROR | 400 |
| Quantity must be positive integer | qty > 0 and integer | INVALID_QUANTITY | 400 |
| Quantity cannot be zero | qty !== 0 | INVALID_QUANTITY | 400 |
| Quantity cannot be negative | qty >= 0 | INVALID_QUANTITY | 400 |
| Stock must be available | qty <= current stock | OUT_OF_STOCK | 400 |
| Stock cannot be exceeded | qty <= stock | STOCK_EXCEEDED | 400 |

**All rules must return immediately with error if violated.** Valid orders deduct from stock and persist to `products.json`.

---

## Edge Case Testing

Your test suite must cover these scenarios:

| Test Case | Input | Expected Result | Status Code |
| --- | --- | --- | --- |
| Valid Order | productId=1, qty=2 | Stock updated, success response | 201 |
| Invalid Product ID | productId=9999, qty=1 | Error: PRODUCT_NOT_FOUND | 404 |
| Quantity = Zero | productId=1, qty=0 | Error: INVALID_QUANTITY | 400 |
| Negative Quantity | productId=1, qty=-5 | Error: INVALID_QUANTITY | 400 |
| Non-integer Quantity | productId=1, qty=2.5 | Error: INVALID_QUANTITY | 400 |
| Stock Exceeded | productId=1, qty=100 (when stock=10) | Error: STOCK_EXCEEDED | 400 |
| Missing Product ID | quantity=1 | Error: VALIDATION_ERROR | 400 |
| Missing Quantity | productId=1 | Error: VALIDATION_ERROR | 400 |
| Multiple Valid Orders | Sequential orders | Stock decreases each time | 201 |

Each valid order should deduct from stock and persist to `products.json`.

---

## Running Tests

### 1. Start the API (Terminal 1)

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab3\server
npm install
node server.js
```

API runs on: **http://localhost:3000**

### 2. Run curl Commands (Terminal 2)

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab3
```

All test commands are in [tests/curl-tests.md](tests/curl-tests.md)

Evidence output files are saved in [docs/evidence/](docs/evidence/)

### Example curl Commands

**Get all products:**
```powershell
curl.exe -i http://localhost:3000/api/products | Tee-Object .\docs\evidence\01-get-products.txt
```

**Get single product:**
```powershell
curl.exe -i http://localhost:3000/api/products/1 | Tee-Object .\docs\evidence\02-get-product-1.txt
```

**Place valid order:**
```powershell
'{"productId":1,"quantity":2}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\03-order-valid.txt
```

**Test invalid product (404):**
```powershell
'{"productId":9999,"quantity":1}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\04-order-invalid-product.txt
```

**Test stock exceeded (400):**
```powershell
'{"productId":1,"quantity":100}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\05-order-stock-exceeded.txt
```

### Why `curl.exe` instead of `curl`?

We use **`curl.exe`** (the explicit executable) on Windows for these reasons:

1. **Windows Compatibility**: On Windows, `curl.exe` is the explicit system binary. Using just `curl` can cause PowerShell to redirect to `Invoke-WebRequest` alias or shell built-ins.

2. **Avoid PowerShell Aliases**: PowerShell may alias `curl` differently. By using `curl.exe`, we force execution of the actual curl utility, bypassing any aliases.

3. **Explicit & Clear**: `curl.exe` makes it explicit we're calling the Windows binary, improving code clarity and reducing ambiguity across different terminal environments.

4. **Cross-Platform Consistency**: While Linux/Mac users use `curl`, Windows users benefit from the explicit `.exe` designation—a standard Windows best practice.

5. **Portable Output**: All evidence files generated with `curl.exe` produce consistent, reproducible results across team environments.

---

## Project Structure

```
Lab3/
├── README.md                    ← Lab 3 setup & docs
├── server/
│   ├── server.js               ← Express API entry point
│   ├── controllers/
│   │   └── orderController.js  ← Business Logic Layer
│   ├── data/
│   │   ├── products.json       ← Current product state (persists orders)
│   │   └── products.seed.json  ← Seed baseline (5 products)
│   ├── package.json
│   ├── .env.example
│   └── .env
├── tests/
│   └── curl-tests.md           ← 17-step sequential curl test suite
└── docs/
    ├── lab3-report.pdf         ← Final report (PDF)
    ├── report.md               ← Report markdown
    └── evidence/               ← curl test output files
        ├── 01-get-products.txt                  ← GET /api/products
        ├── 02-get-product-1.txt                 ← GET /api/products/1
        ├── 03-order-valid.txt                   ← POST with valid order (201)
        ├── 04-order-invalid-product-404.txt     ← Invalid product ID (404)
        ├── 05-order-qty-zero-400.txt            ← Quantity = 0 (400)
        ├── 06-order-qty-negative-400.txt        ← Negative quantity (400)
        ├── 07-order-qty-non-integer-400.txt     ← Non-integer quantity (400)
        ├── 08-order-stock-exceeded-400.txt      ← Stock exceeded (400)
        ├── 09-order-missing-fields-400.txt      ← Missing productId/quantity (400)
        ├── 10-order-missing-productId-400.txt   ← Missing productId (400)
        ├── 11-order-missing-quantity-400.txt    ← Missing quantity (400)
        ├── 12-order-valid-2.txt                 ← Another valid order (201)
        ├── 13-verify-smartphone-stock.txt       ← Verify stock updated (200)
        ├── 14-order-drain-keyboard.txt          ← Drain stock to zero (201)
        ├── 15-order-from-empty-stock-400.txt    ← Out of stock (400)
        ├── 16-reset-products.txt                ← Reset baseline (200)
        └── 17-verify-reset.txt                  ← Verify reset (200)
```

---

## Deliverables

| Item | Location | Description |
| --- | --- | --- |
| API Source Code | `server/` | Express.js server with business logic |
| Order Controller | `server/controllers/orderController.js` | Business logic implementation |
| Product Data | `server/data/products.json` | Persisted product inventory |
| curl Test Suite | `tests/curl-tests.md` | 17-step sequential curl suite covering edge cases |
| Test Evidence | `docs/evidence/` | Output files from all curl test steps |
| Lab 3 Report (PDF) | `docs/lab3-report.pdf` | Final formal report |
| Lab 3 Report (MD) | `docs/report.md` | Report markdown version |

---

## Prerequisites

- Node.js 18+
- npm
- curl
- PowerShell or Git Bash

---

## Setup (Windows · Mac · Linux)

From the Lab3 server folder:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab3\server
npm install
```

This installs dependencies and prepares the environment.

---

## Guide Questions

Students should be able to answer these questions:

1. **What is business logic in software architecture?**
   - Business logic is the set of rules and processes that govern how data is created, modified, and validated within a system. It's the decision-making layer that enforces constraints and validates operations.

2. **Why should business logic not be placed in the UI layer?**
   - Separating business logic from the UI layer ensures:
     - Reusability across multiple interfaces (web, mobile, API)
     - Testability of rules independent of UI
     - Security (rules cannot be bypassed by frontend manipulation)
     - Maintainability and consistency

3. **How does business logic improve data integrity?**
   - Business logic enforces validation rules that prevent invalid data from being stored:
     - Prevents zero or negative quantities
     - Ensures stock availability before orders are placed
     - Validates all required fields
     - Maintains consistent system state

4. **What happens if business logic is not implemented?**
   - Without business logic:
     - Invalid data can be stored (negative stock, missing product references)
     - System state becomes inconsistent
     - Security vulnerabilities arise
     - Users can bypass constraints
     - Data becomes unreliable

---

## Expected Output Examples

### Successful Order (201)
```json
{
  "message": "Order successful",
  "product": "Laptop",
  "quantity": 2,
  "totalPrice": 1998,
  "remainingStock": 8
}
```

### Product Not Found (404)
```json
{
  "error": "PRODUCT_NOT_FOUND",
  "message": "Product with ID 9999 does not exist"
}
```

### Invalid Quantity (400)
```json
{
  "error": "INVALID_QUANTITY",
  "message": "Quantity must be a positive integer greater than zero"
}
```

### Stock Exceeded (400)
```json
{
  "error": "STOCK_EXCEEDED",
  "message": "Insufficient stock. Available: 10, Requested: 100"
}
```

### Missing Fields (400)
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Missing required fields: productId, quantity"
}
```

---

## Requirements

See **Prerequisites** above.
