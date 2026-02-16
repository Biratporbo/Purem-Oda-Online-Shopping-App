const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

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

// fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));


