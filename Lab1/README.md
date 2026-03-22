# Lab 1 — Monolith vs Microservices

### ITSAR2 313 – System Architecture and Integration 2
### BIST 3B

> This lab implements a Student Course System in two architectures:
> a **monolithic** app (SAR2-main) and a **microservices** decomposition,
> both providing REST APIs with independent SQLite databases.

## Members

| # | Name |
|---|------|
| 1 | Roma, Sean Justin |
| 2 | Labrador, Mariene |
| 3 | Garcia, Sophia Christi |
| 4 | Bermejo, Kate Nicole |
| 5 | Andura, Carla |

## GitHub

> **Repository (Lab 1):** [./](./)

---

## Applications

| App | Description | Port |
|-----|-------------|------|
| `SAR2-main/` | Express.js monolithic backend | 8000 |
| `microservices/student-service/` | Student REST API | 4001 |
| `microservices/course-service/` | Course REST API | 4002 |
| `microservices/enrollment-service/` | Enrollment REST API | 4003 |

---

## Stack

| Layer | Technology |
|------|------------|
| Backend | Node.js (Express.js) |
| Database | SQLite |
| API Mode | Monolith + Microservices |

---

## Seeded Data

- Students: 4 seeded records
- Courses: 2 seeded records
- Enrollments: varies by deployment

## Prerequisites

- Node.js 18+
- npm
- SQLite (included with Node packages)
- curl
- PowerShell or Git Bash

---

## Quick Start (Windows · Mac · Linux)

From the Lab1 root, install all dependencies:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab1
npm run install:all
```

> First install can take time as npm downloads dependencies for multiple services.
> Reruns are fast.

Then start services (each in separate terminal):

**Terminal 1 — Student Service:**
```powershell
npm run start:student
```

**Terminal 2 — Course Service:**
```powershell
npm run start:course
```

**Terminal 3 — Enrollment Service:**
```powershell
npm run start:enrollment
```

---

## Terminal Note (Windows)

Use **PowerShell** directly (Windows 5.1+ or PowerShell Core). If using Command Prompt only, switch to PowerShell or use Git Bash for npm commands.

---

## Option A — Run with Microservices (Primary)

> **This is the primary architecture for the lab.**

> For fastest setup, use **Quick Start** above.

**Terminal 1 — Student Service:**
```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab1\microservices\student-service
npm install
npm start
# Runs on http://localhost:4001
```

**Terminal 2 — Course Service:**
```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab1\microservices\course-service
npm install
npm start
# Runs on http://localhost:4002
```

**Terminal 3 — Enrollment Service:**
```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab1\microservices\enrollment-service
npm install
npm start
# Runs on http://localhost:4003
```

---

## Option B — Run Monolithic Only (Optional)

> Provided for architectural comparison only.

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab1\SAR2-main
npm install
npm start
# Runs on http://localhost:8000
```

---

## Microservices API Endpoints

### Student Service (port 4001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students` | List all students |
| POST | `/students` | Create student |
| GET | `/students/{id}` | Get student by ID |
| PUT | `/students/{id}` | Update student |
| DELETE | `/students/{id}` | Delete student |

### Course Service (port 4002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | List all courses |
| POST | `/courses` | Create course |
| GET | `/courses/{id}` | Get course by ID |
| PUT | `/courses/{id}` | Update course |
| DELETE | `/courses/{id}` | Delete course |

### Enrollment Service (port 4003)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/enrollments` | List all enrollments |
| POST | `/enrollments` | Create enrollment |
| GET | `/enrollments/{id}` | Get enrollment by ID |
| DELETE | `/enrollments/{id}` | Delete enrollment |
| DELETE | `/enrollments/by-student/{id}` | Delete by student |

---

## Architecture Pattern

Both the monolithic backend (SAR2-main) and microservices implement the **Model-View-Controller (MVC)** pattern with clear separation of concerns.

**Microservices Mode:**
- Each service owns its SQLite database
- Services communicate via HTTP REST APIs
- Enrollment service validates foreign keys by calling Student and Course services

**Monolithic Mode:**
- Single Node.js/Express server
- Single SQLite database
- Direct in-memory data access

Switching between architectures requires changing the backend connection URLs in environment variables or config.

---

## Deliverables

| Item | Location |
|------|----------|
| Monolithic source code | `SAR2-main/` |
| Microservices source code | `microservices/` |
| Student Service | `microservices/student-service/` |
| Course Service | `microservices/course-service/` |
| Enrollment Service | `microservices/enrollment-service/` |
| Architecture documentation | `microservices/docs/` |
| Lab 1 formal report | `microservices/docs/` |

---

## Requirements

See **Prerequisites** above.
