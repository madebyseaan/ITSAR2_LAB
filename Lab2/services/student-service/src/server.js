require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { initDb, run, get, all } = require('./db');

const app = express();
const port = process.env.PORT || 4001;
const enrollmentServiceUrl = process.env.ENROLLMENT_SERVICE_URL || 'http://localhost:4003';

app.use(cors());
app.use(express.json());
initDb();

app.get('/health', (_req, res) => {
  res.json({ service: 'student-service', status: 'ok' });
});

app.post('/students', async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'fullName and email are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await get('SELECT id FROM students WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ error: 'Student email already exists' });
    }

    const now = new Date().toISOString();
    const result = await run(
      'INSERT INTO students (full_name, email, created_at) VALUES (?, ?, ?)',
      [String(fullName).trim(), normalizedEmail, now]
    );

    const student = await get('SELECT id, full_name AS fullName, email, created_at AS createdAt FROM students WHERE id = ?', [result.id]);
    return res.status(201).json(student);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/students', async (_req, res) => {
  try {
    const students = await all('SELECT id, full_name AS fullName, email, created_at AS createdAt FROM students ORDER BY id DESC');
    return res.json(students);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/students/:id', async (req, res) => {
  try {
    const student = await get('SELECT id, full_name AS fullName, email, created_at AS createdAt FROM students WHERE id = ?', [req.params.id]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.json(student);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/students/:id', async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'fullName and email are required' });
    }

    const existing = await get('SELECT id FROM students WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const duplicate = await get('SELECT id FROM students WHERE email = ? AND id <> ?', [normalizedEmail, req.params.id]);
    if (duplicate) {
      return res.status(409).json({ error: 'Student email already exists' });
    }

    await run('UPDATE students SET full_name = ?, email = ? WHERE id = ?', [String(fullName).trim(), normalizedEmail, req.params.id]);
    const student = await get('SELECT id, full_name AS fullName, email, created_at AS createdAt FROM students WHERE id = ?', [req.params.id]);
    return res.json(student);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/students/:id', async (req, res) => {
  try {
    const student = await get('SELECT id, full_name AS fullName, email FROM students WHERE id = ?', [req.params.id]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await run('DELETE FROM students WHERE id = ?', [req.params.id]);

    let enrollmentsRemoved = null;
    try {
      const cleanup = await axios.delete(`${enrollmentServiceUrl}/enrollments/by-student/${req.params.id}`);
      enrollmentsRemoved = cleanup.data.removed;
    } catch (_error) {
      enrollmentsRemoved = 'unavailable';
    }

    return res.json({
      message: 'Student deleted',
      student,
      enrollmentsRemoved,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Student Service running on http://localhost:${port}`);
});
