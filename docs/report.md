# Lab 2 - Microservices Edge Case Testing Report

> Subject: System Architecture and Integration 2  
> Section: BSIT 3B  
> Members: Roma, Sean Justin; Labrador, Mariene; Garcia, Sophia Christi; Bermejo, Kate Nicole; Andura, Carla

---

## 1. Overview

This document follows the same sequential documentation style used by the reference Lab 2 report.

Validated microservices in this lab:

- student-service (port 4001)
- course-service (port 4002)
- enrollment-service (port 4003)

The implementation is our Lab 1 Node/Express/SQLite code, reorganized into Lab 2 structure.

---

## 2. Test Coverage Matrix

| Category | Student | Course | Enrollment |
|---|---|---|---|
| GET | Yes | Yes | Yes |
| POST | Yes | Yes | Yes |
| PUT | Yes | Yes | N/A |
| DELETE | Yes | Yes | Yes |
| 400 Validation Error | Yes | N/A | Yes |
| 404 Not Found | Yes | Yes | Yes |
| 409 Duplicate | Yes | N/A | Yes |
| Dependency Down Scenario | N/A | N/A | Yes |
| Timeout Scenario | N/A | N/A | Yes |

---

## 3. Deterministic Pre-Conditions (Required)

Before screenshots, reset databases:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab2
Remove-Item .\services\student-service\students.db -ErrorAction SilentlyContinue
Remove-Item .\services\course-service\courses.db -ErrorAction SilentlyContinue
Remove-Item .\services\enrollment-service\enrollments.db -ErrorAction SilentlyContinue
Remove-Item .\docs\evidence\*.txt -ErrorAction SilentlyContinue
```

Expected starting state:

- students: empty
- courses: empty
- enrollments: empty

---

## 4. Service Startup

Terminal 1:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab2\services\student-service
node src/server.js
```

Terminal 2:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab2\services\course-service
node src/server.js
```

Terminal 3:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab2\services\enrollment-service
node src/server.js
```

Use Terminal 4 for all curl commands.

---

## 5. Sequential curl Procedure With Required Screenshots

Documentation sequence is in `tests/curl-tests.md` with Step 1 to Step 27.

Expected core status flow in this implementation:

1. Step 1-2: 200
2. Step 3: 201
3. Step 4: 200
4. Step 5: 200
5. Step 6: 201
6. Step 7: 200
7. Step 8: 200
8. Step 9: 201
9. Step 10-11: 200
10. Step 12-14: 400
11. Step 15-17: 404
12. Step 18-19: 409
13. Step 20-21: 404
14. Step 22-23: dependency scenario checks (implementation-specific output)
15. Step 24-26: 200
16. Step 27: 404

Important adaptation notes:

- This Node implementation returns 404 in many dependency-failure cases where some other implementations return 503.
- Explicit gateway timeout (504) is not fully implemented in current enrollment-service logic.
- Sequence and screenshot structure remain aligned to the same documentation style.

---

## 6. Why This Sequence Is Safe

- Create operations happen before update/delete operations.
- Edge-case commands (400/404/409/dependency scenarios) run before cleanup.
- Cleanup and final verification are isolated at Steps 24-27.
- Reset commands make screenshots reproducible.

---

## 7. Evidence Checklist (for DOCX screenshots)

Insert screenshots in this order:

1. Service startup (Terminal 1-3)
2. Step 1 to Step 27 outputs (Terminal 4)
3. Dependency-down terminal state (Step 22)
4. Timeout simulation terminal state (Step 23)

Reference command source: `tests/curl-tests.md`
