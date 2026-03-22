# Lab 2 Sequential curl Test Suite (Lab 1 Node Services)

This file follows the same sequence style as the reference Lab 2 docs.
All commands use curl.exe and are screenshot-ready.

## Pre-conditions (Reset Before Every Run)

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab2
Remove-Item .\services\student-service\students.db -ErrorAction SilentlyContinue
Remove-Item .\services\course-service\courses.db -ErrorAction SilentlyContinue
Remove-Item .\services\enrollment-service\enrollments.db -ErrorAction SilentlyContinue
Remove-Item .\docs\evidence\*.txt -ErrorAction SilentlyContinue
```

Baseline after reset:

- students: pre-seeded with 4 member records
- courses: pre-seeded with 2 default records
- enrollments: pre-seeded with 2 default records

Default seeded IDs used by the sequence:

- students: IDs 1-4 (member records), new test student becomes ID 5
- courses: IDs 1-2 (default records), new test course becomes ID 3
- enrollments: IDs 1-2 (default records), new test enrollment becomes ID 3

## Service Startup

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

Use Terminal 4 for all curl commands below:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab2
```

## Sequential Test Steps (Terminal 4)

### Step 1 - GET all students (200)

```powershell
curl.exe -i http://localhost:4001/students | Tee-Object .\docs\evidence\01-get-students-200.txt
```

### Step 2 - GET all courses (200)

```powershell
curl.exe -i http://localhost:4002/courses | Tee-Object .\docs\evidence\02-get-courses-200.txt
```

### Step 3 - POST student (201)

```powershell
'{"fullName":"Example Student","email":"example.student.seq@example.com"}' | curl.exe -i -X POST "http://localhost:4001/students" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\03-post-student-201.txt
```

Use the returned student id from Step 3 for Steps 4, 5, 25, and 27.
If you get id 11 in Step 3, replace /students/5 with /students/11 in those steps.

### Step 4 - GET created student by ID (200)

```powershell
$studentId = (Get-Content .\docs\evidence\03-post-student-201.txt -Raw | Select-String -Pattern '"id":(\d+)' | ForEach-Object { $_.Matches[0].Groups[1].Value })
curl.exe -i "http://localhost:4001/students/$studentId" | Tee-Object .\docs\evidence\04-get-student-200.txt
```

### Step 5 - PUT update student (200)

```powershell
'{"fullName":"Example Student Updated","email":"example.student.updated@example.com"}' | curl.exe -i -X PUT "http://localhost:4001/students/$studentId" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\05-put-student-200.txt
```

### Step 6 - POST course (201)

```powershell
'{"code":"ITSAR2-SEQ","title":"Sequential Course"}' | curl.exe -i -X POST "http://localhost:4002/courses" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\06-post-course-201.txt
```

### Step 7 - GET created course by ID (200)

```powershell
curl.exe -i http://localhost:4002/courses/3 | Tee-Object .\docs\evidence\07-get-course-200.txt
```

### Step 8 - PUT update course (200)

```powershell
'{"code":"ITSAR2-SEQ-UPD","title":"Sequential Course Updated"}' | curl.exe -i -X PUT "http://localhost:4002/courses/3" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\08-put-course-200.txt
```

### Step 9 - POST enrollment (201)

```powershell
'{"studentId":1,"courseId":1}' | curl.exe -i -X POST "http://localhost:4003/enrollments" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\09-post-enrollment-201.txt
```

### Step 10 - GET enrollment by ID (200)

```powershell
curl.exe -i http://localhost:4003/enrollments/3 | Tee-Object .\docs\evidence\10-get-enrollment-200.txt
```

### Step 11 - GET enrollments list (200)

```powershell
curl.exe -i http://localhost:4003/enrollments | Tee-Object .\docs\evidence\11-get-enrollments-200.txt
```

### Step 12 - Validation: POST student missing fullName (400)

```powershell
'{"email":"missing-name@example.com"}' | curl.exe -i -X POST "http://localhost:4001/students" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\12-student-missing-name-400.txt
```

### Step 13 - Validation: POST student missing email (400)

```powershell
'{"fullName":"No Email"}' | curl.exe -i -X POST "http://localhost:4001/students" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\13-student-missing-email-400.txt
```

### Step 14 - Validation: POST enrollment missing courseId (400)

```powershell
'{"studentId":1}' | curl.exe -i -X POST "http://localhost:4003/enrollments" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\14-enrollment-missing-course-400.txt
```

### Step 15 - Not Found: GET nonexistent student (404)

```powershell
curl.exe -i http://localhost:4001/students/9999 | Tee-Object .\docs\evidence\15-student-notfound-404.txt
```

### Step 16 - Not Found: GET nonexistent course (404)

```powershell
curl.exe -i http://localhost:4002/courses/9999 | Tee-Object .\docs\evidence\16-course-notfound-404.txt
```

### Step 17 - Not Found: GET nonexistent enrollment (404)

```powershell
curl.exe -i http://localhost:4003/enrollments/9999 | Tee-Object .\docs\evidence\17-enrollment-notfound-404.txt
```

### Step 18 - Duplicate: POST student with existing email (409)

```powershell
'{"fullName":"Duplicate Student","email":"example.student.updated@example.com"}' | curl.exe -i -X POST "http://localhost:4001/students" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\18-student-duplicate-409.txt
```

### Step 19 - Duplicate: POST enrollment already enrolled (409)

```powershell
'{"studentId":1,"courseId":1}' | curl.exe -i -X POST "http://localhost:4003/enrollments" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\19-enrollment-duplicate-409.txt
```

### Step 20 - Cross-service Not Found: nonexistent studentId (404)

```powershell
'{"studentId":9999,"courseId":1}' | curl.exe -i -X POST "http://localhost:4003/enrollments" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\20-cross-student-404.txt
```

### Step 21 - Cross-service Not Found: nonexistent courseId (404)

```powershell
'{"studentId":1,"courseId":9999}' | curl.exe -i -X POST "http://localhost:4003/enrollments" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\21-cross-course-404.txt
```

### Step 22 - Dependency Down simulation

Terminal 5:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab2\services\enrollment-service
$env:PORT="4113"
$env:STUDENT_SERVICE_URL="http://localhost:4199"
$env:COURSE_SERVICE_URL="http://localhost:4002"
node src/server.js
```

Terminal 4:

```powershell
'{"studentId":1,"courseId":1}' | curl.exe -i -X POST "http://localhost:4113/enrollments" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\22-dependency-down.txt
```

Expected after update: 503 Service Unavailable with error about student service unavailable.

### Step 23 - Timeout simulation

Terminal 6:

```powershell
# No command needed. Keep the main student-service running on port 4001 in Terminal 1.
```

Terminal 7:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab2\services\enrollment-service
$env:PORT="4123"
$env:STUDENT_SERVICE_URL="http://localhost:4001"
$env:COURSE_SERVICE_URL="http://localhost:4002"
$env:DEPENDENCY_TIMEOUT_MS="1"
node src/server.js
```

Terminal 4:

```powershell
'{"studentId":1,"courseId":1}' | curl.exe -i -X POST "http://localhost:4123/enrollments" -H "Content-Type: application/json" --data-binary "@-" | Tee-Object .\docs\evidence\23-timeout.txt
```

Expected after update: 504 Gateway Timeout with error about student service unavailable (timeout).

### Step 24 - DELETE enrollment by student (200)

```powershell
curl.exe -i -X DELETE http://localhost:4003/enrollments/by-student/1 | Tee-Object .\docs\evidence\24-delete-enrollment-200.txt
```

### Step 25 - DELETE student (200)

```powershell
curl.exe -i -X DELETE "http://localhost:4001/students/$studentId" | Tee-Object .\docs\evidence\25-delete-student-200.txt
```

### Step 26 - DELETE course (200)

```powershell
curl.exe -i -X DELETE http://localhost:4002/courses/3 | Tee-Object .\docs\evidence\26-delete-course-200.txt
```

### Step 27 - Verify cleanup returns 404

```powershell
curl.exe -i "http://localhost:4001/students/$studentId" | Tee-Object .\docs\evidence\27-verify-student-404.txt
curl.exe -i http://localhost:4002/courses/3 | Tee-Object .\docs\evidence\27-verify-course-404.txt
curl.exe -i http://localhost:4003/enrollments/3 | Tee-Object .\docs\evidence\27-verify-enrollment-404.txt
```

## Member Dummy Data (Our Team)

These records are now seeded automatically on service start. Running the commands below may return 409 duplicate responses.

```powershell
'{"fullName":"Mariene Labrador","email":"mariene.labrador.bsit3b@example.com"}' | curl.exe -i -X POST "http://localhost:4001/students" -H "Content-Type: application/json" --data-binary "@-"
'{"fullName":"Sophia Christi Garcia","email":"sophia.garcia.bsit3b@example.com"}' | curl.exe -i -X POST "http://localhost:4001/students" -H "Content-Type: application/json" --data-binary "@-"
'{"fullName":"Kate Nicole Bermejo","email":"kate.bermejo.bsit3b@example.com"}' | curl.exe -i -X POST "http://localhost:4001/students" -H "Content-Type: application/json" --data-binary "@-"
'{"fullName":"Carla Andura","email":"carla.andura.bsit3b@example.com"}' | curl.exe -i -X POST "http://localhost:4001/students" -H "Content-Type: application/json" --data-binary "@-"
```
