const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'data/recipes.json');
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Failed to read data:', err);
    return [];
  }
}

// Write data to JSON file
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write data:', err);
  }
}
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// Handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  const url = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url });
});

// CRUD
app.get('/recipes', (req, res) => res.json(readData()));

app.post('/recipes', (req, res) => {
  console.log('Incoming Recipe', req.body);

  const recipes = readData();
  const incoming = req.body;

  // BONUS: Force client to send numeric ID for updates
  if (incoming.id !== undefined && (typeof incoming.id !== 'number' || isNaN(incoming.id))) {
    return res.status(400).json({ error: 'Invalid or missing numeric ID for update.' });
  }

  const index = recipes.findIndex(r => r.id === incoming.id);
  if (index !== -1) {
    // update
    recipes[index] = { ...recipes[index], ...incoming };
  } else {
    // create
    const newId = recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1;
    incoming.id = newId;
    recipes.push(incoming);
  }

  writeData(recipes);
  res.json(incoming);
});

app.delete('/recipes/:id', (req, res) => {
  let recipes = readData();
  const id = parseInt(req.params.id);
  const recipe = recipes.find(r => r.id === id);

  if (recipe?.image) {
    const filename = path.basename(recipe.image);
    fs.unlink(path.join(UPLOAD_DIR, filename), (err) => {
      if (err) console.warn('Image deletion failed:', err);
    });
  }

  recipes = recipes.filter(r => r.id !== id);
  writeData(recipes);
  res.sendStatus(200);
});

app.listen(PORT, () => console.log('Server running at http://localhost:${PORT}'));