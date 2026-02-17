const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');
const JAVA_SERVICE_PATH = path.join(__dirname, 'java-service');

// enable CORS for all routes (allow cross-origin requests)
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

async function readData() {
  try {
    const txt = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (err) {
    return [];
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/api/items', async (req, res) => {
  const items = await readData();
  res.json(items);
});

app.post('/api/items', async (req, res) => {
  const items = await readData();
  const item = {
    id: Date.now(),
    title: req.body.title || 'Untitled',
    description: req.body.description || ''
  };
  items.push(item);
  await writeData(items);
  res.status(201).json(item);
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Allow ANY email, but require password to be non-empty
  if (password && password.length > 0) {
    res.json({ 
      success: true, 
      message: `Login successful for ${email}` 
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: "Password is required" 
    });
  }
});

// EDIT / UPDATE ITEM
app.put('/api/items/:id', async (req, res) => {
  const items = await readData();
  const id = Number(req.params.id); // convert id to number
  const item = items.find(i => i.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  // Update title and description
  item.title = req.body.title ?? item.title;
  item.description = req.body.description ?? item.description;

  await writeData(items);
  res.json(item);
});

// ==================== JAVA BUSINESS LOGIC ENDPOINTS ====================

/**
 * Calculate order total with tax and discounts via Java
 * POST /api/order/calculate
 * Body: { "items": [{ "price": 50, "quantity": 2 }] }
 */
app.post('/api/order/calculate', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Validate input
    if (!orderData.items || !Array.isArray(orderData.items)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid request. Expected 'items' array." 
      });
    }

    // Call Java OrderProcessor
    const jsonArg = JSON.stringify(orderData).replace(/"/g, '\\"');
    const command = `cd "${JAVA_SERVICE_PATH}" && java OrderProcessor calculate "${jsonArg}"`;
    
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stdout) {
      return res.status(500).json({ 
        success: false, 
        error: `Java execution error: ${stderr}` 
      });
    }

    const result = JSON.parse(stdout.trim());
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Validate order before processing via Java
 * POST /api/order/validate
 * Body: { "customerId": 123, "items": [...] }
 */
app.post('/api/order/validate', async (req, res) => {
  try {
    const orderData = req.body;

    const jsonArg = JSON.stringify(orderData).replace(/"/g, '\\"');
    const command = `cd "${JAVA_SERVICE_PATH}" && java OrderProcessor validate "${jsonArg}"`;
    
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stdout) {
      return res.status(500).json({ 
        success: false, 
        error: `Java execution error: ${stderr}` 
      });
    }

    const result = JSON.parse(stdout.trim());
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Health check for Java service
 */
app.get('/api/java-service/status', (req, res) => {
  res.json({ 
    status: 'available', 
    message: 'Java business logic service is ready' 
  });
});

// fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));


