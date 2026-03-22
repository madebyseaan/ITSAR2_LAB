require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { initDb, run, get, all } = require('./db');

const app = express();
const port = process.env.PORT || 4002;
const enrollmentServiceUrl = process.env.ENROLLMENT_SERVICE_URL || 'http://localhost:4003';

app.use(cors());
app.use(express.json());
initDb();

app.get('/health', (_req, res) => {
  res.json({ service: 'course-service', status: 'ok' });
});

app.post('/courses', async (req, res) => {
  try {
    const { code, title } = req.body;

    if (!code || !title) {
      return res.status(400).json({ error: 'code and title are required' });
    }

    const now = new Date().toISOString();
    const result = await run(
      'INSERT INTO courses (code, title, created_at) VALUES (?, ?, ?)',
      [String(code).trim().toUpperCase(), String(title).trim(), now]
    );

    const course = await get('SELECT id, code, title, created_at AS createdAt FROM courses WHERE id = ?', [result.id]);
    return res.status(201).json(course);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/courses', async (_req, res) => {
  try {
    const courses = await all('SELECT id, code, title, created_at AS createdAt FROM courses ORDER BY id DESC');
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/courses/:id', async (req, res) => {
  try {
    const course = await get('SELECT id, code, title, created_at AS createdAt FROM courses WHERE id = ?', [req.params.id]);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    return res.json(course);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/courses/:id', async (req, res) => {
  try {
    const { code, title } = req.body;
    if (!code || !title) {
      return res.status(400).json({ error: 'code and title are required' });
    }

    const existing = await get('SELECT id FROM courses WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await run('UPDATE courses SET code = ?, title = ? WHERE id = ?', [String(code).trim().toUpperCase(), String(title).trim(), req.params.id]);
    const course = await get('SELECT id, code, title, created_at AS createdAt FROM courses WHERE id = ?', [req.params.id]);
    return res.json(course);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/courses/:id', async (req, res) => {
  try {
    const course = await get('SELECT id, code, title FROM courses WHERE id = ?', [req.params.id]);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await run('DELETE FROM courses WHERE id = ?', [req.params.id]);

    let enrollmentsRemoved = null;
    try {
      const cleanup = await axios.delete(`${enrollmentServiceUrl}/enrollments/by-course/${req.params.id}`);
      enrollmentsRemoved = cleanup.data.removed;
    } catch (_error) {
      enrollmentsRemoved = 'unavailable';
    }

    return res.json({
      message: 'Course deleted',
      course,
      enrollmentsRemoved,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Course Service running on http://localhost:${port}`);
});
