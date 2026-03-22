const STUDENT_API = 'http://localhost:4001';
const COURSE_API = 'http://localhost:4002';
const ENROLL_API = 'http://localhost:4003';

const el = {
  menuItems: document.querySelectorAll('.menu-item'),
  views: {
    students: document.getElementById('students-view'),
    courses: document.getElementById('courses-view'),
    enrollments: document.getElementById('enrollments-view'),
    architecture: document.getElementById('architecture-view'),
  },
  pageTitle: document.getElementById('page-title'),
  studentsBody: document.getElementById('students-body'),
  coursesBody: document.getElementById('courses-body'),
  enrollmentsBody: document.getElementById('enrollments-body'),
  studentsCount: document.getElementById('students-count'),
  coursesCount: document.getElementById('courses-count'),
  enrollmentsCount: document.getElementById('enrollments-count'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modal-title'),
  modalForm: document.getElementById('modal-form'),
  toast: document.getElementById('toast'),
  closeModal: document.getElementById('close-modal'),
  openStudent: document.getElementById('open-student-modal'),
  openCourse: document.getElementById('open-course-modal'),
  openEnrollment: document.getElementById('open-enrollment-modal'),
  openMainModal: document.getElementById('open-main-modal'),
};

let currentView = 'students';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function notify(message) {
  el.toast.textContent = message;
  el.toast.classList.add('show');
  setTimeout(() => el.toast.classList.remove('show'), 1800);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

function renderStudents(students) {
  el.studentsCount.textContent = students.length;
  if (!students.length) {
    el.studentsBody.innerHTML = '<tr><td colspan="4">No students yet.</td></tr>';
    return;
  }
  el.studentsBody.innerHTML = students.map((s) => `
    <tr>
      <td>${escapeHtml(s.fullName)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${new Date(s.createdAt).toLocaleString()}</td>
      <td>
        <div class="row-actions">
          <button class="btn secondary" onclick="openEditStudent(${s.id}, '${encodeURIComponent(s.fullName)}', '${encodeURIComponent(s.email)}')">Edit</button>
          <button class="btn danger" onclick="deleteStudent(${s.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderCourses(courses) {
  el.coursesCount.textContent = courses.length;
  if (!courses.length) {
    el.coursesBody.innerHTML = '<tr><td colspan="4">No courses yet.</td></tr>';
    return;
  }
  el.coursesBody.innerHTML = courses.map((c) => `
    <tr>
      <td>${escapeHtml(c.code)}</td>
      <td>${escapeHtml(c.title)}</td>
      <td>${new Date(c.createdAt).toLocaleString()}</td>
      <td>
        <div class="row-actions">
          <button class="btn secondary" onclick="openEditCourse(${c.id}, '${encodeURIComponent(c.code)}', '${encodeURIComponent(c.title)}')">Edit</button>
          <button class="btn danger" onclick="deleteCourse(${c.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderEnrollments(enrollments) {
  el.enrollmentsCount.textContent = enrollments.length;
  if (!enrollments.length) {
    el.enrollmentsBody.innerHTML = '<tr><td colspan="3">No enrollments yet.</td></tr>';
    return;
  }
  el.enrollmentsBody.innerHTML = enrollments.map((e) => `
    <tr>
      <td>${escapeHtml(e.studentName)}</td>
      <td>${escapeHtml(e.courseTitle)}</td>
      <td>${new Date(e.enrolledAt).toLocaleString()}</td>
    </tr>
  `).join('');
}

async function reloadAll() {
  const [students, courses, enrollments] = await Promise.all([
    request(`${STUDENT_API}/students`),
    request(`${COURSE_API}/courses`),
    request(`${ENROLL_API}/enrollments`),
  ]);
  renderStudents(students);
  renderCourses(courses);
  renderEnrollments(enrollments);
}

function showView(view) {
  currentView = view;
  Object.entries(el.views).forEach(([key, node]) => {
    node.classList.toggle('active', key === view);
  });
  el.menuItems.forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  el.pageTitle.textContent = view.charAt(0).toUpperCase() + view.slice(1);
}

function openModal(title, content, onSubmit) {
  el.modalTitle.textContent = title;
  el.modalForm.innerHTML = content;
  el.modal.classList.remove('hidden');
  el.modalForm.onsubmit = async (event) => {
    event.preventDefault();
    try {
      await onSubmit(new FormData(el.modalForm));
      el.modal.classList.add('hidden');
      await reloadAll();
    } catch (error) {
      notify(error.message);
    }
  };
}

function closeModal() {
  el.modal.classList.add('hidden');
}

function openStudentModal() {
  openModal(
    'Add Student',
    '<input name="fullName" placeholder="Full name" required /><input name="email" type="email" placeholder="Email" required /><button class="btn primary" type="submit">Save Student</button>',
    async (form) => {
      await request(`${STUDENT_API}/students`, {
        method: 'POST',
        body: JSON.stringify({ fullName: form.get('fullName'), email: form.get('email') }),
      });
      notify('Student created');
    }
  );
}

function openCourseModal() {
  openModal(
    'Add Course',
    '<input name="code" placeholder="Course code" required /><input name="title" placeholder="Course title" required /><button class="btn primary" type="submit">Save Course</button>',
    async (form) => {
      await request(`${COURSE_API}/courses`, {
        method: 'POST',
        body: JSON.stringify({ code: form.get('code'), title: form.get('title') }),
      });
      notify('Course created');
    }
  );
}

async function openEnrollmentModal() {
  const [students, courses] = await Promise.all([
    request(`${STUDENT_API}/students`),
    request(`${COURSE_API}/courses`),
  ]);

  if (!students.length || !courses.length) {
    notify('Create at least 1 student and 1 course first');
    return;
  }

  openModal(
    'Enroll Student',
    `<select name="studentId" required>${students.map((s) => `<option value="${s.id}">${s.fullName}</option>`).join('')}</select>
     <select name="courseId" required>${courses.map((c) => `<option value="${c.id}">${c.code} - ${c.title}</option>`).join('')}</select>
     <button class="btn primary" type="submit">Create Enrollment</button>`,
    async (form) => {
      await request(`${ENROLL_API}/enrollments`, {
        method: 'POST',
        body: JSON.stringify({ studentId: Number(form.get('studentId')), courseId: Number(form.get('courseId')) }),
      });
      notify('Enrollment created');
    }
  );
}

window.openEditStudent = function openEditStudent(id, encodedName, encodedEmail) {
  const fullName = decodeURIComponent(encodedName);
  const email = decodeURIComponent(encodedEmail);
  openModal(
    'Edit Student',
    `<input name="fullName" value="${fullName}" required /><input name="email" type="email" value="${email}" required /><button class="btn primary" type="submit">Update Student</button>`,
    async (form) => {
      await request(`${STUDENT_API}/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ fullName: form.get('fullName'), email: form.get('email') }),
      });
      notify('Student updated');
    }
  );
};

window.openEditCourse = function openEditCourse(id, encodedCode, encodedTitle) {
  const code = decodeURIComponent(encodedCode);
  const title = decodeURIComponent(encodedTitle);
  openModal(
    'Edit Course',
    `<input name="code" value="${code}" required /><input name="title" value="${title}" required /><button class="btn primary" type="submit">Update Course</button>`,
    async (form) => {
      await request(`${COURSE_API}/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ code: form.get('code'), title: form.get('title') }),
      });
      notify('Course updated');
    }
  );
};

window.deleteStudent = async function deleteStudent(id) {
  if (!confirm('Delete this student and related enrollments?')) {
    return;
  }
  await request(`${STUDENT_API}/students/${id}`, { method: 'DELETE' });
  await reloadAll();
  notify('Student deleted');
};

window.deleteCourse = async function deleteCourse(id) {
  if (!confirm('Delete this course and related enrollments?')) {
    return;
  }
  await request(`${COURSE_API}/courses/${id}`, { method: 'DELETE' });
  await reloadAll();
  notify('Course deleted');
};

el.menuItems.forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));
el.closeModal.addEventListener('click', closeModal);
el.modal.addEventListener('click', (event) => {
  if (event.target.id === 'modal') closeModal();
});
el.openStudent.addEventListener('click', openStudentModal);
el.openCourse.addEventListener('click', openCourseModal);
el.openEnrollment.addEventListener('click', openEnrollmentModal);
el.openMainModal.addEventListener('click', () => {
  if (currentView === 'students') return openStudentModal();
  if (currentView === 'courses') return openCourseModal();
  if (currentView === 'enrollments') return openEnrollmentModal();
  notify('Use the top navigation to manage data');
});

reloadAll().catch((error) => notify(error.message));
