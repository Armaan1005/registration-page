const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Register endpoint
app.post('/register', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const registration = { id: Date.now(), name, email, date: new Date().toISOString() };

  fs.readFile('registrations.json', (err, data) => {
    let registrations = [];
    if (!err && data.length > 0) registrations = JSON.parse(data);

    registrations.push(registration);

    fs.writeFile('registrations.json', JSON.stringify(registrations, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error saving data" });
      console.log("New Registration:", registration);
      res.json({ message: "Registration successful!" });
    });
  });
});

// Get all registrations
app.get('/registrations', (req, res) => {
  fs.readFile('registrations.json', (err, data) => {
    if (err) return res.json([]);
    res.json(JSON.parse(data));
  });
});

// Delete registrations by indexes
app.post('/delete', (req, res) => {
  const { indexes } = req.body; // array of indexes

  if (!Array.isArray(indexes)) return res.status(400).json({ message: "Invalid request" });

  fs.readFile('registrations.json', (err, data) => {
    let registrations = [];
    if (!err && data.length > 0) registrations = JSON.parse(data);

    // Sort indexes in descending order to avoid index shifting issues
    const sortedIndexes = indexes.sort((a, b) => b - a);
    
    // Remove registrations at specified indexes
    sortedIndexes.forEach(index => {
      if (index >= 0 && index < registrations.length) {
        registrations.splice(index, 1);
      }
    });

    fs.writeFile('registrations.json', JSON.stringify(registrations, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error deleting registrations" });
      console.log(`Deleted registrations at indexes: ${indexes}`);
      res.json({ message: "Deleted successfully!" });
    });
  });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
