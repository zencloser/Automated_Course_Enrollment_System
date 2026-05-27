# 🎓 Automated Course Enrollment System

A full-stack web application for managing university course enrollment, student academics, attendance, payments, and more — built with Flask and MySQL.

---

## 📸 Project Overview

This system provides a complete university management portal with role-based dashboards for **Students**, **Instructors**, and **Admins**. It automates enrollment workflows, tracks academic progress, manages fee payments, and provides intelligent CGPA predictions.

---

## ✨ Features

### 🎓 Student Dashboard
- View enrolled courses, academic progress, and alerts
- Track attendance percentage per course
- Download certificates upon course completion

### 📋 Course Enrollment
- Browse available courses by department and category
- Enroll, drop, or join waitlist for courses
- Prerequisite validation before enrollment
- Automatic waitlist promotion when a seat opens

### 👨‍🏫 Instructor Portal
- View assigned courses and enrolled students
- Mark and manage student attendance
- Update student grades and progress

### 🛡️ Admin Panel
- Full control over students, instructors, courses, and departments
- Manage course capacity and enrollment limits
- View audit logs for all system activity
- Generate semester reports

### 📊 Attendance Tracking
- Date-wise attendance marking (present/absent)
- Automatic low-attendance alerts when below threshold
- Attendance summary per student per course

### 💳 Payment System
- Department-wise fee structure (tuition, lab, hostel, mess, etc.)
- Installment-based payment support
- Overdue payment alerts and tracking
- Payment history per student

### 🧮 CGPA Calculator & Grade Predictor
- Calculate current CGPA based on enrolled courses
- Predict required marks to achieve a target CGPA
- Smart academic planning tool for students

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, Flask-CORS |
| Database | MySQL 8.0 |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| DB Connector | mysql-connector-python |
| Architecture | RESTful API + Blueprint-based routing |

---

## 📁 Project Structure

```
Automated_Course_Enrollment_System/
├── backend/
│   ├── app.py                  # Main Flask application
│   ├── routes/
│   │   ├── auth_routes.py      # Login, logout, session
│   │   ├── student_routes.py   # Student CRUD
│   │   ├── course_routes.py    # Course management
│   │   ├── enrollment_routes.py# Enrollment & waitlist
│   │   ├── attendance_routes.py# Attendance tracking
│   │   ├── payment_routes.py   # Fee & payment system
│   │   └── other_routes.py     # Alerts, CGPA, reports
│   └── services/
│       └── db.py               # Database connection & query helper
├── frontend/
│   ├── index.html              # Main UI
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── mydb_dump.sql               # Full MySQL database dump with sample data
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.10+
- MySQL 8.0+
- Git

### Step 1 — Clone the repository
```bash
git clone https://github.com/zencloser/Automated_Course_Enrollment_System.git
cd Automated_Course_Enrollment_System
```

### Step 2 — Install Python dependencies
```bash
pip install flask flask-cors mysql-connector-python
```

### Step 3 — Set up the database
Open MySQL and run:
```sql
source mydb_dump.sql
```
Or import via MySQL Workbench by running the `mydb_dump.sql` file.

### Step 4 — Set environment variables

**Windows (Command Prompt):**
```cmd
set SECRET_KEY=your_secret_key
set DB_PASSWORD=your_mysql_password
```

**Windows (Git Bash / Linux / Mac):**
```bash
export SECRET_KEY=your_secret_key
export DB_PASSWORD=your_mysql_password
```

### Step 5 — Run the application
```bash
cd backend
python app.py
```

Visit **http://localhost:5000** in your browser.

---

## 🔐 Demo Login Credentials

> ⚠️ These are for demo/testing purposes only.

| Role | Email | Password |
|---|---|---|
| Admin | admin@snu.edu.in | admin123 |
| Student | (any student email) | student123 |
| Instructor | (any instructor email) | faculty123 |

---

## 🗄️ Database

The `mydb_dump.sql` file includes:
- ✅ 20 tables with full schema
- ✅ Sample data for students, instructors, courses, enrollments
- ✅ 4 stored procedures (`sp_enroll_student`, `sp_course_recommender`, `drop_and_promote`, `sp_semester_report`)
- ✅ Foreign key constraints and indexes

---

## 👨‍💻 Contributors

| Name | GitHub |
|---|---|
| **Kavya Pratap Singh Chauhan** (Lead) | [@zencloser](https://github.com/zencloser) |
| Harsh Sumrav | [@Harsh-Sumrav](https://github.com/Harsh-Sumrav) |
| Dev Agarwal | [@Dev-Agarwal](https://github.com/devagarwal2709) | 
| Agrim Mittal | — |

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">Built with ❤️ for university course management</p>