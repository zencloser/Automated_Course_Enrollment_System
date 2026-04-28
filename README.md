# Automated Course Enrollment System

## Description
This is an automated course enrollment system built with Flask and MySQL. It provides a web interface for students to enroll in courses, manage their schedules, and for administrators to oversee the enrollment process.

## Features
- User authentication and session management
- Course listing and enrollment
- Student dashboard
- Admin panel for course management
- MySQL database integration
- RESTful API endpoints

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/Harsh-Sumrav/Automated_Course_Enrollment_System.git
   cd Automated_Course_Enrollment_System
   ```

2. Install dependencies:
   ```
   pip install flask flask-cors mysql-connector-python
   ```

3. Set up the database:
   - Import the `mydb_dump.sql` file into your MySQL database
   - Update the database configuration in `app2.py` if necessary

4. Set environment variables:
   - `SECRET_KEY`: For Flask session secret
   - `DB_PASSWORD`: MySQL database password

5. Run the application:
   ```
   python app2.py
   ```

## Usage
- Access the application at `http://localhost:5000`
- Use the web interface to login, view courses, and enroll

## Contributors
- Kavya Pratap Singh Chauhan: [[GitHub Profile Link](https://github.com/zencloser)]
- Harsh Sumrav: [[GitHub Profile Link](https://github.com/Harsh-Sumrav)]
- Dev Agarwal
- Agrim Mittal

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
