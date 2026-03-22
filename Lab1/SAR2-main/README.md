# System Architecture and Integration 2
# Laboratory 1 - Monolithic Implementation

## Basic Overview

This folder contains the Laboratory 1 monolithic version of the Student-Course-Enrollment system.

The application is built with Node.js and Express and provides:

- Student management
- Course management
- Enrollment management
- Basic validation and duplicate prevention

## Laboratory Activity

Course: System Architecture and Integration 2

Activity: Laboratory 1

Focus:

- Build and test a monolithic service architecture
- Implement REST endpoints for Students, Courses, and Enrollments
- Compare monolithic design with the microservices version in Lab1/microservices

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
cd C:\Users\Sean\Desktop\SAR2\Lab1\SAR2-main
npm install
```

## How to Run the System

```powershell
cd C:\Users\Sean\Desktop\SAR2\Lab1\SAR2-main
npm start
```

Default URL:

- http://localhost:3000

Optional seed command:

```powershell
node seed.js
```

## Core API Endpoints

- POST /students
- GET /students
- GET /students/:id
- PUT /students/:id
- DELETE /students/:id
- POST /courses
- GET /courses
- GET /courses/:id
- PUT /courses/:id
- DELETE /courses/:id
- POST /enrollments
- GET /enrollments

## Tech Stack

- Node.js
- Express.js
- HTML/CSS/JavaScript frontend
- In-memory data model
