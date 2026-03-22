require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { initDb, run, get, all } = require('./db');

const app = express();
const port = process.env.PORT || 4003;

const studentServiceUrl = process.env.STUDENT_SERVICE_URL || 'http://localhost:4001';
const courseServiceUrl = process.env.COURSE_SERVICE_URL || 'http://localhost:4002';
const dependencyTimeoutMs = Number(process.env.DEPENDENCY_TIMEOUT_MS || 2000);

const fetchDependency = async (url, missingMessage, unavailableMessage) => {
  try {
    const response = await axios.get(url, { timeout: dependencyTimeoutMs });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { __error: { status: 404, message: missingMessage } };
    }

    if (error.code === 'ECONNABORTED') {
      return { __error: { status: 504, message: `${unavailableMessage} (timeout)` } };
    }

    return { __error: { status: 503, message: unavailableMessage } };
  }
};

app.use(cors());
app.use(express.json());
initDb();

app.get('/health', (_req, res) => {
  res.json({ service: 'enrollment-service', status: 'ok' });
});

app.post('/enrollments', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({ error: 'studentId and courseId are required' });
    }

    const student = await fetchDependency(
      `${studentServiceUrl}/students/${studentId}`,
      'Student does not exist',
      'Student service unavailable'
    );
    if (student.__error) {
      return res.status(student.__error.status).json({ error: student.__error.message });
    }

    const course = await fetchDependency(
      `${courseServiceUrl}/courses/${courseId}`,
      'Course does not exist',
      'Course service unavailable'
    );
    if (course.__error) {
      return res.status(course.__error.status).json({ error: course.__error.message });
    }

    const now = new Date().toISOString();

    const result = await run(
      'INSERT INTO enrollments (student_id, course_id, enrolled_at) VALUES (?, ?, ?)',
      [studentId, courseId, now]
    );

    const enrollment = await get(
      'SELECT id, student_id AS studentId, course_id AS courseId, enrolled_at AS enrolledAt FROM enrollments WHERE id = ?',
      [result.id]
    );

    return res.status(201).json({
      ...enrollment,
      studentName: student.fullName,
      courseTitle: course.title,
    });
  } catch (error) {
    if (String(error.message).toLowerCase().includes('unique')) {
      return res.status(409).json({ error: 'Student is already enrolled in this course' });
    }
    return res.status(500).json({ error: error.message });
  }
});

app.get('/enrollments', async (_req, res) => {
  try {
    const rows = await all('SELECT id, student_id AS studentId, course_id AS courseId, enrolled_at AS enrolledAt FROM enrollments ORDER BY id DESC');

    const enriched = await Promise.all(rows.map(async (row) => {
      let studentName = 'Unavailable';
      let courseTitle = 'Unavailable';

      try {
        const studentResponse = await axios.get(`${studentServiceUrl}/students/${row.studentId}`);
        studentName = studentResponse.data.fullName;
      } catch (_err) {}

      try {
        const courseResponse = await axios.get(`${courseServiceUrl}/courses/${row.courseId}`);
        courseTitle = courseResponse.data.title;
      } catch (_err) {}

      return { ...row, studentName, courseTitle };
    }));

    return res.json(enriched);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/enrollments/:id', async (req, res) => {
  try {
    const enrollment = await get(
      'SELECT id, student_id AS studentId, course_id AS courseId, enrolled_at AS enrolledAt FROM enrollments WHERE id = ?',
      [req.params.id]
    );

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    let studentName = null;
    let courseTitle = null;

    try {
      const studentResponse = await axios.get(`${studentServiceUrl}/students/${enrollment.studentId}`);
      studentName = studentResponse.data.fullName;
    } catch (_err) {
      studentName = 'Unavailable';
    }

    try {
      const courseResponse = await axios.get(`${courseServiceUrl}/courses/${enrollment.courseId}`);
      courseTitle = courseResponse.data.title;
    } catch (_err) {
      courseTitle = 'Unavailable';
    }

    return res.json({
      ...enrollment,
      studentName,
      courseTitle,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/enrollments/by-student/:studentId', async (req, res) => {
  try {
    const result = await run('DELETE FROM enrollments WHERE student_id = ?', [req.params.studentId]);
    return res.json({ removed: result.changes });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/enrollments/by-course/:courseId', async (req, res) => {
  try {
    const result = await run('DELETE FROM enrollments WHERE course_id = ?', [req.params.courseId]);
    return res.json({ removed: result.changes });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Enrollment Service running on http://localhost:${port}`);
  console.log(`Student service URL: ${studentServiceUrl}`);
  console.log(`Course service URL: ${courseServiceUrl}`);
  console.log(`Dependency timeout (ms): ${dependencyTimeoutMs}`);
});
