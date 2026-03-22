# System Architecture and Integration 2
# Laboratory 1 - Microservices Implementation

## Basic Overview

This folder contains the Laboratory 1 microservices implementation for the Student-Course-Enrollment system using Node.js and SQLite.

The system is split into four services:

- Student Service (default port 4001)
- Course Service (default port 4002)
- Enrollment Service (default port 4003)
- Dashboard Service (default port 4010)

Each core service owns its own SQLite database and communicates through HTTP.

## Laboratory Activity

Course: System Architecture and Integration 2

Activity: Laboratory 1

Focus:

- Compare monolithic and microservices approaches
- Implement Student, Course, and Enrollment as independent services
- Integrate services through REST API calls

## Group Members

Section: BSIT 3B

- Roma, Sean Justin
- Labrador, Mariene
- Garcia, Sophia Christi
- Bermejo, Kate Nicole
- Andura, Carla

## Installation

From this folder:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab1\microservices
npm run install:all
```

## How to Run the System

Start each service in a separate terminal:

Terminal 1:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab1\microservices
npm run start:student
```

Terminal 2:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab1\microservices
npm run start:course
```

Terminal 3:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab1\microservices
npm run start:enrollment
```

Terminal 4:

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab1\microservices
npm run start:dashboard
```

Dashboard URL:

- http://localhost:4010

## Quick Health Check

```powershell
curl.exe -i http://localhost:4001/health
curl.exe -i http://localhost:4002/health
curl.exe -i http://localhost:4003/health
curl.exe -i http://localhost:4010/health
```
