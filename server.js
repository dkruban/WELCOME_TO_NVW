// Simple Express backend to store users into data/users.json
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: login/create user
app.post('/api/login', (req, res) => {
  const { name, dob } = req.body || {};
  if (!name || !dob) return res.status(400).json({ error: 'name and dob required' });
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const id = uuidv4();
  const user = { id, name, dob, createdAt: new Date().toISOString() };
  users.push(user);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ ok: true, user });
});

// API: get all users (for admin/testing)
app.get('/api/users', (req, res) => {
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  res.json({ users });
});

// Health check
app.get('/api/ping', (req, res) => res.json({ pong: true }));

// Fallback to index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
