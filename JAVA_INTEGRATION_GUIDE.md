# Java Integration Setup Guide

## Overview
This project integrates Java business logic with a Node.js/Express backend. The Java service handles order processing, calculations, and validation.

## File Structure
```
d:\My Project\
├── java-service/
│   ├── OrderProcessor.java       (Java source code)
│   ├── OrderProcessor.class      (Compiled Java class - generated after compile)
│   └── compile.bat               (Batch script to compile)
├── server.js                     (Updated with Java integration)
├── package.json
└── ... (other project files)
```

## Setup Instructions

### Step 1: Compile Java Code
Open Command Prompt and run:
```cmd
cd d:\My Project\java-service
compile.bat
```

**OR** manually:
```cmd
cd d:\My Project\java-service
javac OrderProcessor.java
```

This creates `OrderProcessor.class` in the same directory.

### Step 2: Verify Java Installation
Ensure Java is installed and accessible from command line:
```cmd
java -version
```

### Step 3: Install Node Dependencies
```cmd
cd d:\My Project
npm install
```

### Step 4: Start the Server
```cmd
npm start
```

Server runs on http://localhost:5000

---

## API Endpoints

### 1. Calculate Order (Java Processing)
**Endpoint:** `POST /api/order/calculate`

**Request:**
```json
{
  "items": [
    { "price": 50, "quantity": 2 },
    { "price": 30, "quantity": 1 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "subtotal": 130,
  "discount": 13,
  "tax": 9.36,
  "total": 126.36
}
```

**Features:**
- Calculates subtotal from items
- Applies 10% bulk discount if subtotal > $100
- Adds 8% tax
- Returns formatted total

### 2. Validate Order (Java Processing)
**Endpoint:** `POST /api/order/validate`

**Request:**
```json
{
  "customerId": 123,
  "items": [
    { "price": 50, "quantity": 1 }
  ]
}
```

**Response (Valid):**
```json
{
  "success": true,
  "message": "Order is valid"
}
```

**Response (Invalid):**
```json
{
  "success": false,
  "error": "Missing items array"
}
```

### 3. Java Service Status
**Endpoint:** `GET /api/java-service/status`

**Response:**
```json
{
  "status": "available",
  "message": "Java business logic service is ready"
}
```

---

## Example Frontend Usage

### JavaScript/Fetch API
```javascript
// Calculate order total
async function calculateOrder() {
  const orderData = {
    items: [
      { title: "Nike Air Force 1", price: 120, quantity: 1 },
      { title: "Adidas Samba", price: 95, quantity: 1 }
    ]
  };

  try {
    const response = await fetch('/api/order/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    console.log(`Total: $${result.total}`);
    console.log(`Discount: $${result.discount}`);
    console.log(`Tax: $${result.tax}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Validate order
async function validateOrder() {
  const orderData = {
    customerId: 456,
    items: [{ price: 50, quantity: 1 }]
  };

  const response = await fetch('/api/order/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  
  const result = await response.json();
  console.log(result);
}
```

---

## Java Code Business Logic

### OrderProcessor.java Features:

1. **Order Calculation** (`calculate` command)
   - Parses JSON item arrays
   - Extracts price and quantity
   - Calculates subtotal
   - Applies bulk discount (10% if > $100)
   - Calculates tax (8%)
   - Returns final total

2. **Order Validation** (`validate` command)
   - Checks for required fields
   - Validates order structure
   - Ensures positive totals
   - Returns validation results

---

## Extending Java Business Logic

### Add New Functionality:

1. **Edit** `java-service/OrderProcessor.java`
2. **Add new method** (e.g., `handleShipping()`)
3. **Add case** in `main()` switch statement
4. **Recompile:** `javac OrderProcessor.java`
5. **Add endpoint** in `server.js` to call the new command

### Example: Add Shipping Calculation
```java
case "calculate-shipping":
    if (args.length < 2) {
        System.err.println("Usage: OrderProcessor calculate-shipping <json_string>");
        System.exit(1);
    }
    handleCalculateShipping(args[1]);
    break;
```

---

## Troubleshooting

### Issue: "java command not recognized"
- **Solution:** Add Java to system PATH or use full path to javac/java

### Issue: "OrderProcessor.class not found"
- **Solution:** Ensure compilation successful: `javac OrderProcessor.java`
- Check that you're in correct directory: `cd d:\My Project\java-service`

### Issue: JSON parsing errors
- **Solution:** Ensure valid JSON is sent to endpoints
- Check for proper escaping in quotes

### Issue: "Cannot find main class"
- **Solution:** Ensure you're running from `java-service` directory
- File must be named `OrderProcessor.java` (case-sensitive on some systems)

---

## Security Notes
- This setup executes Java via shell commands - use with caution in production
- Validate all input data before passing to Java
- Consider using proper IPC (Inter-Process Communication) for high-volume operations
- For production, consider Spring Boot or other Java frameworks

---

## Next Steps
1. Add more Java business logic as needed
2. Implement additional order processing features
3. Consider migrating to Spring Boot for scalability
