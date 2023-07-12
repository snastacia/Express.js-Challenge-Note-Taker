const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./helpers/uuid');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received to get notes`);
  fs.readFile(path.join(__dirname, './db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to get notes.' });
    }
    const notes = JSON.parse(data);
    return res.json(notes);
  });
});

app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;
  fs.readFile(path.join(__dirname, './db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to get notes.' });
    }
    const notes = JSON.parse(data);
    const newNote = {
      title: title,
      text: text,
      id: uuid(),
    };
    notes.push(newNote);
    fs.writeFile(path.join(__dirname, './db/db.json'), JSON.stringify(notes), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to add note.' });
      }
      res.json(newNote);
    });
  });
});

app.delete('/api/notes/:id', (req, res) => {
  fs.readFile(path.join(__dirname, './db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to get notes.' });
    }
    const notes = JSON.parse(data);
    const updatedNotes = notes.filter((note) => note.id !== req.params.id);
    fs.writeFile(path.join(__dirname, './db/db.json'), JSON.stringify(updatedNotes), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete note.' });
      }
      res.status(204).end();
    });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Now listening at http://127.0.0.1:${PORT}`);
});

