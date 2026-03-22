# Lab 3 curl Test Suite - Product Ordering API

## Pre-conditions (Reset Before Every Run)

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab3\server
npm install
```

## Service Startup

Run in this exact order:

1. Open Terminal 1 and run only the server command there.
2. Keep Terminal 1 running (do not run test commands in Terminal 1).
3. Open Terminal 2 and run all curl test steps there.
4. Use the exact absolute paths below (do not use relative `cd .\\Lab3\\...`).
5. If any step fails with connection error, re-run Terminal 1 startup first.

Terminal 1:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab3\server
npm run start
```

Terminal 2 (run all curl commands here):

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab3
New-Item -ItemType Directory -Force .\docs\evidence | Out-Null
```

Quick smoke check from Terminal 2 (optional):

```powershell
curl.exe -i http://localhost:3000/
```

Expected: HTTP 200 with `status: "running"`.

If smoke check fails, do this recovery sequence and try again:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
cd C:\Users\Sean\Desktop\SAR2\Lab3\server
npm run start
```

If port 3000 is already in use, stop old Node processes before restart:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## Test Suite Overview

This test suite covers 12+ scenarios testing:
- ✓ Happy path (valid orders)
- ✓ All validation rules
- ✓ All error codes (VALIDATION_ERROR, INVALID_QUANTITY, PRODUCT_NOT_FOUND, OUT_OF_STOCK, STOCK_EXCEEDED)
- ✓ Stock persistence across orders
- ✓ Edge cases

---

## Sequential Test Steps (Terminal 2)

### Step 1 - GET all products (200)

```powershell
curl.exe -i http://localhost:3000/api/products | Tee-Object .\docs\evidence\01-get-products.txt
```

**Expected:** HTTP 200, array of 5 products with initial stock levels.

---

### Step 2 - GET specific product by ID (200)

```powershell
curl.exe -i http://localhost:3000/api/products/1 | Tee-Object .\docs\evidence\02-get-product-1.txt
```

**Expected:** HTTP 200, Laptop product with stock=10.

---

### Step 3 - POST valid order (201)

```powershell
'{"productId":1,"quantity":2}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\03-order-valid.txt
```

**Expected:** 
- HTTP 201
- Message: "Order successful"
- totalPrice: 1998 (999 * 2)
- remainingStock: 8 (10 - 2)

---

### Step 4 - Verify stock was updated (200)

```powershell
curl.exe -i http://localhost:3000/api/products/1 | Tee-Object .\docs\evidence\04-verify-stock-updated.txt
```

**Expected:** HTTP 200, Laptop stock=8 (stock persisted).

---

### Step 5 - POST invalid product ID (404)

```powershell
'{"productId":9999,"quantity":1}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\05-order-invalid-product-404.txt
```

**Expected:**
- HTTP 404
- error: "PRODUCT_NOT_FOUND"
- Stock should remain unchanged

---

### Step 6 - POST quantity = 0 (400)

```powershell
'{"productId":1,"quantity":0}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\06-order-qty-zero-400.txt
```

**Expected:**
- HTTP 400
- error: "INVALID_QUANTITY"
- message: "Quantity must be a positive integer greater than zero"

---

### Step 7 - POST negative quantity (400)

```powershell
'{"productId":1,"quantity":-5}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\07-order-qty-negative-400.txt
```

**Expected:**
- HTTP 400
- error: "INVALID_QUANTITY"

---

### Step 8 - POST non-integer quantity / decimal (400)

```powershell
'{"productId":1,"quantity":2.5}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\08-order-qty-decimal-400.txt
```

**Expected:**
- HTTP 400
- error: "INVALID_QUANTITY"
- message: "Quantity must be an integer"

---

### Step 9 - POST stock exceeded (400)

```powershell
'{"productId":1,"quantity":100}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\09-order-stock-exceeded-400.txt
```

**Expected:**
- HTTP 400
- error: "STOCK_EXCEEDED"
- message: "Insufficient stock. Available: 8, Requested: 100"
- (Note: stock=8 from Step 3, not 10)

---

### Step 10 - POST missing productId field (400)

```powershell
'{"quantity":5}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\10-order-missing-productId-400.txt
```

**Expected:**
- HTTP 400
- error: "VALIDATION_ERROR"
- message: "Missing required fields: productId, quantity"

---

### Step 11 - POST missing quantity field (400)

```powershell
'{"productId":1}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\11-order-missing-quantity-400.txt
```

**Expected:**
- HTTP 400
- error: "VALIDATION_ERROR"

---

### Step 12 - POST another valid order to test stock deduction (201)

```powershell
'{"productId":2,"quantity":5}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\12-order-valid-2.txt
```

**Expected:**
- HTTP 201
- Message: "Order successful"
- Product: "Smartphone"
- totalPrice: 2995 (599 * 5)
- remainingStock: 20 (25 - 5)

---

### Step 13 - Verify Smartphone stock was updated (200)

```powershell
curl.exe -i http://localhost:3000/api/products/2 | Tee-Object .\docs\evidence\13-verify-smartphone-stock.txt
```

**Expected:** HTTP 200, Smartphone stock=20.

---

### Step 14 - POST order for out-of-stock scenario (first drain Keyboard)

```powershell
'{"productId":5,"quantity":50}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\14-order-drain-keyboard.txt
```

**Expected:**
- HTTP 201
- remainingStock: 0

---

### Step 15 - Try to order from empty stock (400)

```powershell
'{"productId":5,"quantity":1}' | curl.exe -i -X POST "http://localhost:3000/api/orders" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\15-order-from-empty-stock-400.txt
```

**Expected:**
- HTTP 400
- error: "OUT_OF_STOCK"
- message: "Product 'Keyboard' is out of stock"

---

### Step 16 - Reset products to baseline (201)

```powershell
curl.exe -i -X POST "http://localhost:3000/api/reset" | Tee-Object .\docs\evidence\16-reset-products.txt
```

**Expected:**
- HTTP 200
- All products reset to original stock levels
- Laptop stock=10, Smartphone stock=25, etc.

---

### Step 17 - Verify reset worked (200)

```powershell
curl.exe -i http://localhost:3000/api/products | Tee-Object .\docs\evidence\17-verify-reset.txt
```

**Expected:** HTTP 200, all products back to initial stock.

---

## Summary of Business Rules Tested

| Rule | Test Step | Status Code |
|------|-----------|------------|
| Valid order | Step 3, 12 | 201 ✓ |
| Stock updated (persisted) | Step 4, 13 | 200 ✓ |
| Invalid product ID | Step 5 | 404 ✓ |
| Quantity = 0 | Step 6 | 400 ✓ |
| Negative quantity | Step 7 | 400 ✓ |
| Decimal/non-integer quantity | Step 8 | 400 ✓ |
| Stock exceeded | Step 9 | 400 ✓ |
| Missing productId | Step 10 | 400 ✓ |
| Missing quantity | Step 11 | 400 ✓ |
| Out of stock (after drain) | Step 15 | 400 ✓ |
| Reset to baseline | Step 16 | 200 ✓ |

---

## Expected HTTP Status Codes

- **201 Created** - Valid order, stock updated
- **200 OK** - GET requests, reset successful
- **400 Bad Request** - Validation/business rule violations
- **404 Not Found** - Product doesn't exist
- **500 Internal Server Error** - Server errors (should not occur)

---

## Note: curl.exe on Windows

All commands use `curl.exe` (explicit Windows executable) to avoid conflicts with PowerShell's `Invoke-WebRequest` alias or shell built-ins.

## Common Startup Fix

If you see `Cannot find module '...\\server.js'`, you are in the wrong folder.

Use one of these:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab3\server
npm run start
```

or

```powershell
node C:\Users\Sean\Desktop\SAR2\Lab3\server\server.js
```
