CREATE DATABASE  IF NOT EXISTS `mydb` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `mydb`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: mydb
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alerts`
--

DROP TABLE IF EXISTS `alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alerts` (
  `alert_id` int NOT NULL AUTO_INCREMENT,
  `alert_type` varchar(50) DEFAULT NULL,
  `severity` varchar(20) DEFAULT NULL,
  `message` text,
  `is_read` tinyint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  PRIMARY KEY (`alert_id`),
  KEY `fk_Alerts_Student1_idx` (`student_id`),
  KEY `fk_Alerts_Course1_idx` (`course_id`),
  CONSTRAINT `fk_Alerts_Course1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `fk_Alerts_Student1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerts`
--

LOCK TABLES `alerts` WRITE;
/*!40000 ALTER TABLE `alerts` DISABLE KEYS */;
INSERT INTO `alerts` VALUES (1,'Attendance','warning','Attendance low: 40.00%',1,NULL,3,1),(2,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,4,1),(3,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,13,7),(4,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,14,7),(5,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,16,1),(6,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,21,7),(7,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,22,8),(8,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,68,8),(9,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,72,2),(10,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,77,1),(11,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,80,8),(12,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,90,7),(13,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,91,7),(14,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,93,3),(15,'Attendance','warning','Attendance low: 0.00%',NULL,NULL,95,7),(16,'Attendance','warning','Attendance low: 66.67%',NULL,NULL,2,1);
/*!40000 ALTER TABLE `alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `course_id` int NOT NULL,
  `date` date NOT NULL,
  `status` varchar(20) DEFAULT NULL,
  `student_id` int NOT NULL,
  PRIMARY KEY (`date`,`student_id`,`course_id`),
  KEY `fk_Attendance_Student1_idx` (`student_id`),
  KEY `fk_Attendance_Course` (`course_id`),
  CONSTRAINT `fk_Attendance_Course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `fk_Attendance_Student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (1,'2024-01-01','present',2),(1,'2024-01-01','present',3),(1,'2024-01-02','present',2),(1,'2024-01-02','absent',3),(1,'2024-01-03','present',2),(1,'2024-01-03','absent',3),(1,'2024-01-04','present',2),(1,'2024-01-04','absent',3),(8,'2026-03-20','present',37),(6,'2026-03-20','present',70),(4,'2026-03-20','present',75),(8,'2026-03-20','present',78),(1,'2026-03-21','present',51),(3,'2026-03-21','absent',93),(8,'2026-03-22','present',58),(6,'2026-03-22','present',67),(3,'2026-03-22','present',92),(7,'2026-03-22','absent',95),(1,'2026-03-23','absent',16),(6,'2026-03-24','present',53),(1,'2026-03-24','present',73),(3,'2026-03-25','present',88),(1,'2026-03-26','present',55),(6,'2026-03-26','present',65),(6,'2026-03-27','present',54),(4,'2026-03-28','present',61),(8,'2026-03-28','present',79),(1,'2026-03-29','absent',2),(3,'2026-03-29','present',87),(8,'2026-03-30','present',24),(4,'2026-03-30','present',69),(2,'2026-03-30','absent',72),(1,'2026-03-30','present',82),(6,'2026-04-01','present',52),(2,'2026-04-02','present',63),(1,'2026-04-05','present',5),(3,'2026-04-05','present',11),(3,'2026-04-06','present',15),(1,'2026-04-06','present',17),(7,'2026-04-06','absent',21),(5,'2026-04-06','present',46),(1,'2026-04-07','present',1),(1,'2026-04-07','present',3),(7,'2026-04-07','absent',13),(8,'2026-04-07','present',60),(7,'2026-04-07','absent',91),(2,'2026-04-08','present',26),(1,'2026-04-08','absent',77),(2,'2026-04-09','present',25),(8,'2026-04-09','present',32),(1,'2026-04-10','present',42),(2,'2026-04-10','present',76),(1,'2026-04-11','absent',4),(8,'2026-04-11','absent',68),(7,'2026-04-12','absent',14),(7,'2026-04-12','present',66),(3,'2026-04-12','present',89),(6,'2026-04-14','present',48),(8,'2026-04-14','present',57),(1,'2026-04-14','present',59),(8,'2026-04-15','present',39),(2,'2026-04-16','present',2),(8,'2026-04-16','absent',22),(4,'2026-04-16','present',28),(7,'2026-04-17','present',34),(3,'2026-04-17','present',84),(4,'2026-04-18','present',1),(1,'2026-04-18','absent',2),(2,'2026-04-18','present',2),(4,'2026-04-18','present',4),(2,'2026-04-18','present',18),(8,'2026-04-18','absent',80),(1,'2026-04-18','present',86),(7,'2026-04-18','absent',90),(4,'2026-04-18','present',96);
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_attendance_warning` AFTER INSERT ON `attendance` FOR EACH ROW BEGIN
 DECLARE v_total INT DEFAULT 0;
 DECLARE v_present INT DEFAULT 0;
 DECLARE v_pct DECIMAL(5,2);

 SELECT COUNT(*),
        SUM(CASE WHEN LOWER(TRIM(status)) = 'present' THEN 1 ELSE 0 END)
 INTO v_total, v_present
 FROM Attendance
 WHERE student_id = NEW.student_id
   AND course_id = NEW.course_id;

 IF v_total > 0 THEN
   SET v_pct = ROUND(v_present * 100.0 / v_total, 2);
 END IF;

 IF v_pct < 75 THEN

  IF EXISTS (
    SELECT 1 FROM Alerts
    WHERE student_id = NEW.student_id
      AND course_id = NEW.course_id
      AND alert_type = 'Attendance'
  ) THEN

    UPDATE Alerts
    SET message = CONCAT('Attendance low: ', v_pct, '%')
    WHERE student_id = NEW.student_id
      AND course_id = NEW.course_id
      AND alert_type = 'Attendance';

  ELSE

    INSERT INTO Alerts(student_id, course_id, alert_type, severity, message)
    VALUES (
      NEW.student_id,
      NEW.course_id,
      'Attendance',
      'warning',
      CONCAT('Attendance low: ', v_pct, '%')
    );

  END IF;

END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `auditlog`
--

DROP TABLE IF EXISTS `auditlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditlog` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `table_name` varchar(50) DEFAULT NULL,
  `operation` varchar(20) DEFAULT NULL,
  `record_id` varchar(50) DEFAULT NULL,
  `old_data` text,
  `new_data` text,
  `changed_by` varchar(100) DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditlog`
--

LOCK TABLES `auditlog` WRITE;
/*!40000 ALTER TABLE `auditlog` DISABLE KEYS */;
INSERT INTO `auditlog` VALUES (1,'Progress','UPDATE','2-1','grade=75.00','grade=33.45','root@localhost','2026-04-17 22:36:50'),(2,'Progress','UPDATE','3-1','grade=85.00','grade=91.13','root@localhost','2026-04-17 22:36:50'),(3,'Progress','UPDATE','3-1','grade=91.13','grade=75.00','root@localhost','2026-04-17 22:38:36'),(4,'Progress','UPDATE','2-1','grade=33.45','grade=60.00','root@localhost','2026-04-17 22:39:06'),(5,'Progress','UPDATE','3-1','grade=75.00','grade=60.00','root@localhost','2026-04-17 22:39:06');
/*!40000 ALTER TABLE `auditlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `category_id` int NOT NULL,
  `category_name` varchar(50) NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Core'),(2,'Elective'),(3,'Lab'),(4,'Open Elective');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `certificate_id` int NOT NULL AUTO_INCREMENT,
  `cert_number` varchar(50) DEFAULT NULL,
  `grade_achieved` decimal(5,2) DEFAULT NULL,
  `grade_letter` varchar(5) DEFAULT NULL,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  PRIMARY KEY (`certificate_id`),
  UNIQUE KEY `cert_number_UNIQUE` (`cert_number`),
  KEY `fk_Certificates_Student1_idx` (`student_id`),
  KEY `fk_Certificates_Course1_idx` (`course_id`),
  CONSTRAINT `fk_cert_crs` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `fk_cert_stu` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  CONSTRAINT `fk_Certificates_Course1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `fk_Certificates_Student1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES (1,'CERT-3-1',75.00,'B',3,1),(2,'CERT-2-1',60.00,'C',2,1);
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `course_id` int NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `course_code` varchar(20) DEFAULT NULL,
  `credits` int DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `max_seats` int DEFAULT NULL,
  `fees` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint DEFAULT NULL,
  `dept_id` int NOT NULL,
  `program_id` int NOT NULL,
  `instructor_id` int NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `course_code_UNIQUE` (`course_code`),
  KEY `fk_Course_Department1_idx` (`dept_id`),
  KEY `fk_Course_Program1_idx` (`program_id`),
  KEY `fk_Course_Instructor1_idx` (`instructor_id`),
  KEY `fk_Course_Category1_idx` (`category_id`),
  CONSTRAINT `fk_Course_Category1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`),
  CONSTRAINT `fk_Course_Department1` FOREIGN KEY (`dept_id`) REFERENCES `department` (`dept_id`),
  CONSTRAINT `fk_Course_Instructor1` FOREIGN KEY (`instructor_id`) REFERENCES `instructor` (`instructor_id`),
  CONSTRAINT `fk_Course_Program1` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (1,'Database Management Systems','CS301',4,3,60,15000.00,1,1,1,1,1),(2,'Machine Learning','CS401',4,4,50,18000.00,1,1,1,2,2),(3,'Computer Networks','CS302',3,3,55,12000.00,1,1,1,3,1),(4,'Data Structures','CS201',4,2,60,14000.00,1,1,1,1,1),(5,'Signal Processing','EC301',3,3,45,13000.00,1,2,3,4,1),(6,'Linear Algebra','MA201',3,2,70,10000.00,1,3,4,5,1),(7,'AI Ethics','CS501',2,5,80,8000.00,1,1,1,2,4),(8,'DBMS Lab','CS301L',2,3,40,5000.00,1,1,1,1,3);
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coursecapacity`
--

DROP TABLE IF EXISTS `coursecapacity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coursecapacity` (
  `course_id` int NOT NULL,
  `max_seats` int DEFAULT NULL,
  `enrolled_count` int DEFAULT '0',
  PRIMARY KEY (`course_id`),
  CONSTRAINT `fk_cc_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coursecapacity`
--

LOCK TABLES `coursecapacity` WRITE;
/*!40000 ALTER TABLE `coursecapacity` DISABLE KEYS */;
INSERT INTO `coursecapacity` VALUES (1,60,15),(2,60,8),(3,60,7),(4,60,4),(5,60,1),(6,60,7),(7,60,8),(8,60,12);
/*!40000 ALTER TABLE `coursecapacity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `dept_id` int NOT NULL,
  `dept_name` varchar(100) NOT NULL,
  `dean_name` varchar(100) DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT NULL,
  `established` year DEFAULT NULL,
  PRIMARY KEY (`dept_id`),
  UNIQUE KEY `dept_name_UNIQUE` (`dept_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'Computer Science','Dr. Anil Sharma',5000000.00,2000),(2,'Electronics Engineering','Dr. Priya Mehta',4000000.00,1998),(3,'Mathematics','Dr. Ramesh Gupta',2500000.00,1995),(4,'Physics','Dr. Sunita Rao',2000000.00,1993),(5,'Mechanical Engineering','Dr. Vikram Singh',3500000.00,1997);
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollment`
--

DROP TABLE IF EXISTS `enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollment` (
  `enrolled_on` date DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  PRIMARY KEY (`student_id`,`course_id`),
  KEY `fk_Enrollment_Student1_idx` (`student_id`),
  KEY `fk_Enrollment_Course1_idx` (`course_id`),
  CONSTRAINT `fk_Enrollment_Course1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `fk_Enrollment_Student1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollment`
--

LOCK TABLES `enrollment` WRITE;
/*!40000 ALTER TABLE `enrollment` DISABLE KEYS */;
INSERT INTO `enrollment` VALUES ('2026-04-18','active',1,1),('2026-04-18','active',2,1),('2026-04-19','active',2,2),('2026-04-19','active',2,3),('2026-04-19','active',2,6),('2026-04-18','active',3,1),('2026-04-18','active',4,1),('2026-04-19','active',4,2),('2026-04-19','active',4,4),('2026-04-18','active',5,1),('2026-04-19','active',9,1),('2026-04-18','active',11,3),('2026-04-18','active',13,7),('2026-04-18','active',14,7),('2026-04-18','active',15,3),('2026-04-18','active',16,1),('2026-04-18','active',17,1),('2026-04-18','active',18,2),('2026-04-18','active',21,7),('2026-04-18','active',22,8),('2026-04-18','active',24,8),('2026-04-18','active',25,2),('2026-04-18','active',26,2),('2026-04-18','active',28,4),('2026-04-18','active',32,8),('2026-04-18','active',34,7),('2026-04-18','active',37,8),('2026-04-18','active',39,8),('2026-04-18','active',42,1),('2026-04-18','active',46,5),('2026-04-18','active',48,6),('2026-04-18','active',51,1),('2026-04-18','active',52,6),('2026-04-19','active',52,7),('2026-04-18','active',53,6),('2026-04-18','active',54,6),('2026-04-18','active',55,1),('2026-04-18','active',57,8),('2026-04-18','active',58,8),('2026-04-18','active',59,1),('2026-04-18','active',60,8),('2026-04-18','active',61,4),('2026-04-18','active',63,2),('2026-04-18','active',65,6),('2026-04-18','active',66,7),('2026-04-18','active',67,6),('2026-04-18','active',68,8),('2026-04-18','active',69,4),('2026-04-18','active',70,6),('2026-04-18','active',72,2),('2026-04-18','active',73,1),('2026-04-18','active',75,4),('2026-04-18','active',76,2),('2026-04-18','active',77,1),('2026-04-18','active',78,8),('2026-04-18','active',79,8),('2026-04-18','active',80,8),('2026-04-18','active',82,1),('2026-04-18','active',84,3),('2026-04-18','active',86,1),('2026-04-18','active',87,3),('2026-04-18','active',88,3),('2026-04-18','active',89,3),('2026-04-18','active',90,7),('2026-04-18','active',91,7),('2026-04-18','active',92,3),('2026-04-18','active',93,3),('2026-04-18','active',95,7),('2026-04-18','active',96,4);
/*!40000 ALTER TABLE `enrollment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gradehistory`
--

DROP TABLE IF EXISTS `gradehistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gradehistory` (
  `history_id` int NOT NULL,
  `student_id` int DEFAULT NULL,
  `course_id` int DEFAULT NULL,
  `old_grade` decimal(5,2) DEFAULT NULL,
  `new_grade` decimal(5,2) DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT NULL,
  `changed_by` varchar(100) DEFAULT NULL,
  `reason` text,
  PRIMARY KEY (`history_id`),
  KEY `fk_GradeHistory_Student` (`student_id`),
  KEY `fk_GradeHistory_Course` (`course_id`),
  CONSTRAINT `fk_GradeHistory_Course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `fk_GradeHistory_Student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gradehistory`
--

LOCK TABLES `gradehistory` WRITE;
/*!40000 ALTER TABLE `gradehistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `gradehistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor`
--

DROP TABLE IF EXISTS `instructor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor` (
  `instructor_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `dept_id` int NOT NULL,
  PRIMARY KEY (`instructor_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `fk_Instructor_Department1_idx` (`dept_id`),
  CONSTRAINT `fk_Instructor_Department1` FOREIGN KEY (`dept_id`) REFERENCES `department` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor`
--

LOCK TABLES `instructor` WRITE;
/*!40000 ALTER TABLE `instructor` DISABLE KEYS */;
INSERT INTO `instructor` VALUES (1,'Prof. Sonia Khetarpaul','sonia@snu.edu.in','Database Systems',1),(2,'Prof. Ajay Verma','ajay@snu.edu.in','Machine Learning',1),(3,'Prof. Meena Joshi','meena@snu.edu.in','Computer Networks',1),(4,'Prof. Ravi Kumar','ravi@snu.edu.in','Signal Processing',2),(5,'Prof. Deepa Nair','deepa@snu.edu.in','Linear Algebra',3),(6,'Prof. Tarun Bhatia','tarun@snu.edu.in','Thermodynamics',5);
/*!40000 ALTER TABLE `instructor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `paid_amount` decimal(10,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `fk_Payment_Student1_idx` (`student_id`),
  KEY `fk_Payment_Course1_idx` (`course_id`),
  CONSTRAINT `fk_Payment_Course1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `fk_Payment_Student1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES (1,1000.00,1000.00,'2026-04-19','partial',2,1);
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paymentinstallment`
--

DROP TABLE IF EXISTS `paymentinstallment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paymentinstallment` (
  `installment_no` int NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `paid_on` date DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `payment_id` int NOT NULL,
  `amount_due` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`installment_no`,`payment_id`),
  KEY `fk_PaymentInstallment_Payment1_idx` (`payment_id`),
  CONSTRAINT `fk_PaymentInstallment_Payment1` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 KEY_BLOCK_SIZE=16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paymentinstallment`
--

LOCK TABLES `paymentinstallment` WRITE;
/*!40000 ALTER TABLE `paymentinstallment` DISABLE KEYS */;
/*!40000 ALTER TABLE `paymentinstallment` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_payment_overdue` AFTER UPDATE ON `paymentinstallment` FOR EACH ROW BEGIN

  IF LOWER(TRIM(NEW.status)) = 'overdue'
     AND (OLD.status IS NULL OR LOWER(TRIM(OLD.status)) != 'overdue') THEN

    INSERT INTO Alerts(student_id, course_id, alert_type, severity, message)
    SELECT p.student_id,
           p.course_id,
           'Payment',
           'critical',
           CONCAT('Installment #', NEW.installment_no, ' is overdue')
    FROM Payment p
    WHERE p.payment_id = NEW.payment_id
      AND NOT EXISTS (
        SELECT 1 FROM Alerts
        WHERE student_id = p.student_id
          AND course_id = p.course_id
          AND alert_type = 'Payment'
          AND message LIKE CONCAT('%', NEW.installment_no, '%')
      );

  END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `prerequisites`
--

DROP TABLE IF EXISTS `prerequisites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prerequisites` (
  `min_grade` decimal(5,2) DEFAULT NULL,
  `course_id` int NOT NULL,
  `required_course_id` int NOT NULL,
  PRIMARY KEY (`course_id`,`required_course_id`),
  KEY `fk_Prerequisites_Course1_idx` (`course_id`),
  KEY `fk_Prerequisites_Course2_idx` (`required_course_id`),
  CONSTRAINT `fk_Prerequisites_Course1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `fk_Prerequisites_Course2` FOREIGN KEY (`required_course_id`) REFERENCES `course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prerequisites`
--

LOCK TABLES `prerequisites` WRITE;
/*!40000 ALTER TABLE `prerequisites` DISABLE KEYS */;
INSERT INTO `prerequisites` VALUES (50.00,1,6),(60.00,2,4),(55.00,5,6);
/*!40000 ALTER TABLE `prerequisites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program`
--

DROP TABLE IF EXISTS `program`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program` (
  `program_id` int NOT NULL,
  `program_name` varchar(100) NOT NULL,
  `degree_type` varchar(50) DEFAULT NULL,
  `duration_yrs` int DEFAULT NULL,
  `total_credits` int DEFAULT NULL,
  `dept_id` int NOT NULL,
  PRIMARY KEY (`program_id`),
  KEY `fk_Program_Department_idx` (`dept_id`),
  CONSTRAINT `fk_Program_Department` FOREIGN KEY (`dept_id`) REFERENCES `department` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program`
--

LOCK TABLES `program` WRITE;
/*!40000 ALTER TABLE `program` DISABLE KEYS */;
INSERT INTO `program` VALUES (1,'BTech CSE','BTech',4,160,1),(2,'MTech AI','MTech',2,80,1),(3,'BTech ECE','BTech',4,160,2),(4,'BSc Mathematics','BSc',3,120,3),(5,'BTech Mechanical','BTech',4,160,5),(6,'MSc Physics','MSc',2,80,4);
/*!40000 ALTER TABLE `program` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `progress`
--

DROP TABLE IF EXISTS `progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progress` (
  `grade` decimal(5,2) DEFAULT NULL,
  `completion_pct` int DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT NULL,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  PRIMARY KEY (`student_id`,`course_id`),
  KEY `fk_Progress_Student1_idx` (`student_id`),
  KEY `fk_Progress_Course1_idx` (`course_id`),
  CONSTRAINT `fk_Progress_Course1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `fk_Progress_Student1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progress`
--

LOCK TABLES `progress` WRITE;
/*!40000 ALTER TABLE `progress` DISABLE KEYS */;
INSERT INTO `progress` VALUES (60.00,100,NULL,2,1),(80.10,100,NULL,2,2),(60.00,100,NULL,3,1);
/*!40000 ALTER TABLE `progress` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_certificate_issue` AFTER UPDATE ON `progress` FOR EACH ROW BEGIN

  IF (OLD.completion_pct <> NEW.completion_pct OR OLD.grade <> NEW.grade) THEN

    IF NEW.completion_pct = 100 AND NEW.grade >= 40
       AND NOT EXISTS (
         SELECT 1 FROM Certificates
         WHERE student_id = NEW.student_id
           AND course_id = NEW.course_id
       ) THEN

      INSERT INTO Certificates
        (student_id, course_id, cert_number, grade_achieved, grade_letter)
      VALUES (
        NEW.student_id,
        NEW.course_id,
        CONCAT('CERT-', NEW.student_id, '-', NEW.course_id),
        NEW.grade,
        CASE
          WHEN NEW.grade >= 90 THEN 'A+'
          WHEN NEW.grade >= 80 THEN 'A'
          WHEN NEW.grade >= 70 THEN 'B'
          WHEN NEW.grade >= 60 THEN 'C'
          ELSE 'D'
        END
      );

    END IF;

  END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_audit_grade` AFTER UPDATE ON `progress` FOR EACH ROW BEGIN
  IF OLD.grade <> NEW.grade THEN
    INSERT INTO AuditLog
      (table_name, operation, record_id, old_data, new_data, changed_by, changed_at)
    VALUES (
      'Progress',
      'UPDATE',
      CONCAT(NEW.student_id, '-', NEW.course_id),
      CONCAT('grade=', OLD.grade),
      CONCAT('grade=', NEW.grade),
      USER(),
      NOW()
    );
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name_UNIQUE` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin','Full system access — manage all data'),(2,'Instructor','Can manage courses, grades, attendance'),(3,'Student','Can enroll, view progress, pay fees'),(4,'Viewer','Read-only access for reporting');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `student_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `dob` date DEFAULT NULL,
  `batch_year` int DEFAULT NULL,
  `cgpa` decimal(4,2) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `academic_probation` tinyint DEFAULT NULL,
  `dept_id` int NOT NULL,
  `program_id` int NOT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `fk_Student_Department1_idx` (`dept_id`),
  KEY `fk_Student_Program1_idx` (`program_id`),
  CONSTRAINT `fk_Student_Department1` FOREIGN KEY (`dept_id`) REFERENCES `department` (`dept_id`),
  CONSTRAINT `fk_Student_Program1` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (1,'Aarav Sharma','aarav.sharma@mail.com',NULL,2023,8.90,NULL,NULL,0,1,1),(2,'Vivaan Gupta','vivaan.gupta@mail.com',NULL,2023,7.80,NULL,NULL,0,1,1),(3,'Aditya Verma','aditya.verma@mail.com',NULL,2023,6.50,NULL,NULL,1,1,1),(4,'Arjun Singh','arjun.singh@mail.com',NULL,2023,9.20,NULL,NULL,0,2,3),(5,'Krishna Patel','krishna.patel@mail.com',NULL,2023,5.90,NULL,NULL,1,2,3),(6,'Ishaan Mehta','ishaan.mehta@mail.com',NULL,2023,8.60,NULL,NULL,0,3,4),(7,'Rohan Kapoor','rohan.kapoor@mail.com',NULL,2023,7.90,NULL,NULL,0,3,4),(8,'Aryan Mishra','aryan.mishra@mail.com',NULL,2023,6.10,NULL,NULL,1,1,1),(9,'Kunal Joshi','kunal.joshi@mail.com',NULL,2023,9.40,NULL,NULL,0,1,1),(10,'Siddharth Jain','siddharth.jain@mail.com',NULL,2023,7.30,NULL,NULL,0,2,3),(11,'Ananya Sharma','ananya.sharma@mail.com',NULL,2023,8.50,NULL,NULL,0,1,1),(12,'Diya Gupta','diya.gupta@mail.com',NULL,2023,7.20,NULL,NULL,0,1,1),(13,'Riya Verma','riya.verma@mail.com',NULL,2023,6.30,NULL,NULL,1,1,1),(14,'Isha Singh','isha.singh@mail.com',NULL,2023,9.00,NULL,NULL,0,2,3),(15,'Pooja Patel','pooja.patel@mail.com',NULL,2023,5.50,NULL,NULL,1,2,3),(16,'Sneha Mehta','sneha.mehta@mail.com',NULL,2023,8.70,NULL,NULL,0,3,4),(17,'Neha Kapoor','neha.kapoor@mail.com',NULL,2023,7.60,NULL,NULL,0,3,4),(18,'Kavya Mishra','kavya.mishra@mail.com',NULL,2023,6.00,NULL,NULL,1,1,1),(19,'Aditi Joshi','aditi.joshi@mail.com',NULL,2023,9.10,NULL,NULL,0,1,1),(20,'Priya Jain','priya.jain@mail.com',NULL,2023,7.40,NULL,NULL,0,2,3),(21,'Rahul Sharma','rahul.sharma@mail.com',NULL,2023,8.00,NULL,NULL,0,1,1),(22,'Amit Gupta','amit.gupta@mail.com',NULL,2023,7.50,NULL,NULL,0,1,1),(23,'Manish Verma','manish.verma@mail.com',NULL,2023,6.20,NULL,NULL,1,1,1),(24,'Vikas Singh','vikas.singh@mail.com',NULL,2023,8.80,NULL,NULL,0,2,3),(25,'Deepak Patel','deepak.patel@mail.com',NULL,2023,5.70,NULL,NULL,1,2,3),(26,'Suresh Mehta','suresh.mehta@mail.com',NULL,2023,8.30,NULL,NULL,0,3,4),(27,'Ravi Kapoor','ravi.kapoor@mail.com',NULL,2023,7.90,NULL,NULL,0,3,4),(28,'Nikhil Mishra','nikhil.mishra@mail.com',NULL,2023,6.40,NULL,NULL,1,1,1),(29,'Ankit Joshi','ankit.joshi@mail.com',NULL,2023,9.30,NULL,NULL,0,1,1),(30,'Rajat Jain','rajat.jain@mail.com',NULL,2023,7.60,NULL,NULL,0,2,3),(31,'Tanya Sharma','tanya.sharma@mail.com',NULL,2023,8.20,NULL,NULL,0,1,1),(32,'Simran Gupta','simran.gupta@mail.com',NULL,2023,7.10,NULL,NULL,0,1,1),(33,'Megha Verma','megha.verma@mail.com',NULL,2023,6.60,NULL,NULL,1,1,1),(34,'Nidhi Singh','nidhi.singh@mail.com',NULL,2023,9.50,NULL,NULL,0,2,3),(35,'Anjali Patel','anjali.patel@mail.com',NULL,2023,5.80,NULL,NULL,1,2,3),(36,'Shreya Mehta','shreya.mehta@mail.com',NULL,2023,8.90,NULL,NULL,0,3,4),(37,'Ritu Kapoor','ritu.kapoor@mail.com',NULL,2023,7.30,NULL,NULL,0,3,4),(38,'Kritika Mishra','kritika.mishra@mail.com',NULL,2023,6.10,NULL,NULL,1,1,1),(39,'Payal Joshi','payal.joshi@mail.com',NULL,2023,9.00,NULL,NULL,0,1,1),(40,'Komal Jain','komal.jain@mail.com',NULL,2023,7.20,NULL,NULL,0,2,3),(41,'Student 41','student41@mail.com',NULL,2023,7.57,NULL,NULL,0,1,1),(42,'Student 42','student42@mail.com',NULL,2023,6.87,NULL,NULL,0,3,2),(43,'Student 43','student43@mail.com',NULL,2023,8.62,NULL,NULL,0,1,2),(44,'Student 44','student44@mail.com',NULL,2023,8.87,NULL,NULL,0,2,4),(45,'Student 45','student45@mail.com',NULL,2023,6.62,NULL,NULL,0,3,1),(46,'Student 46','student46@mail.com',NULL,2023,6.33,NULL,NULL,0,3,2),(47,'Student 47','student47@mail.com',NULL,2023,8.50,NULL,NULL,0,3,2),(48,'Student 48','student48@mail.com',NULL,2023,6.47,NULL,NULL,1,1,3),(49,'Student 49','student49@mail.com',NULL,2023,7.87,NULL,NULL,0,2,4),(50,'Student 50','student50@mail.com',NULL,2023,6.67,NULL,NULL,0,1,4),(51,'Student 51','student51@mail.com',NULL,2023,7.73,NULL,NULL,1,3,3),(52,'Student 52','student52@mail.com',NULL,2023,8.17,NULL,NULL,0,1,4),(53,'Student 53','student53@mail.com',NULL,2023,9.20,NULL,NULL,0,3,4),(54,'Student 54','student54@mail.com',NULL,2023,9.21,NULL,NULL,0,1,3),(55,'Student 55','student55@mail.com',NULL,2023,7.17,NULL,NULL,1,3,3),(56,'Student 56','student56@mail.com',NULL,2023,7.30,NULL,NULL,1,2,3),(57,'Student 57','student57@mail.com',NULL,2023,8.81,NULL,NULL,0,2,4),(58,'Student 58','student58@mail.com',NULL,2023,6.06,NULL,NULL,0,2,1),(59,'Student 59','student59@mail.com',NULL,2023,9.54,NULL,NULL,0,1,4),(60,'Student 60','student60@mail.com',NULL,2023,8.82,NULL,NULL,0,1,4),(61,'Student 61','student61@mail.com',NULL,2023,8.66,NULL,NULL,0,1,1),(62,'Student 62','student62@mail.com',NULL,2023,7.31,NULL,NULL,1,3,1),(63,'Student 63','student63@mail.com',NULL,2023,8.98,NULL,NULL,0,1,4),(64,'Student 64','student64@mail.com',NULL,2023,8.97,NULL,NULL,0,3,2),(65,'Student 65','student65@mail.com',NULL,2023,8.30,NULL,NULL,0,1,4),(66,'Student 66','student66@mail.com',NULL,2023,7.22,NULL,NULL,0,1,1),(67,'Student 67','student67@mail.com',NULL,2023,8.67,NULL,NULL,0,3,2),(68,'Student 68','student68@mail.com',NULL,2023,6.08,NULL,NULL,0,1,1),(69,'Student 69','student69@mail.com',NULL,2023,7.86,NULL,NULL,0,1,1),(70,'Student 70','student70@mail.com',NULL,2023,8.49,NULL,NULL,0,1,2),(71,'Student 71','student71@mail.com',NULL,2023,8.72,NULL,NULL,0,1,1),(72,'Student 72','student72@mail.com',NULL,2023,6.45,NULL,NULL,1,1,1),(73,'Student 73','student73@mail.com',NULL,2023,6.46,NULL,NULL,0,3,1),(74,'Student 74','student74@mail.com',NULL,2023,8.33,NULL,NULL,0,3,4),(75,'Student 75','student75@mail.com',NULL,2023,8.98,NULL,NULL,0,2,3),(76,'Student 76','student76@mail.com',NULL,2023,7.38,NULL,NULL,0,1,2),(77,'Student 77','student77@mail.com',NULL,2023,9.12,NULL,NULL,1,3,1),(78,'Student 78','student78@mail.com',NULL,2023,6.22,NULL,NULL,1,2,3),(79,'Student 79','student79@mail.com',NULL,2023,8.63,NULL,NULL,1,1,3),(80,'Student 80','student80@mail.com',NULL,2023,6.55,NULL,NULL,0,2,2),(81,'Student 81','student81@mail.com',NULL,2023,9.96,NULL,NULL,0,2,4),(82,'Student 82','student82@mail.com',NULL,2023,6.75,NULL,NULL,0,2,2),(83,'Student 83','student83@mail.com',NULL,2023,8.04,NULL,NULL,0,3,2),(84,'Student 84','student84@mail.com',NULL,2023,9.66,NULL,NULL,0,2,2),(85,'Student 85','student85@mail.com',NULL,2023,9.09,NULL,NULL,0,3,4),(86,'Student 86','student86@mail.com',NULL,2023,9.59,NULL,NULL,0,2,3),(87,'Student 87','student87@mail.com',NULL,2023,9.75,NULL,NULL,0,3,1),(88,'Student 88','student88@mail.com',NULL,2023,8.13,NULL,NULL,0,3,3),(89,'Student 89','student89@mail.com',NULL,2023,7.65,NULL,NULL,1,1,1),(90,'Student 90','student90@mail.com',NULL,2023,8.98,NULL,NULL,0,1,2),(91,'Student 91','student91@mail.com',NULL,2023,9.56,NULL,NULL,0,3,4),(92,'Student 92','student92@mail.com',NULL,2023,6.20,NULL,NULL,0,3,2),(93,'Student 93','student93@mail.com',NULL,2023,6.05,NULL,NULL,1,1,1),(94,'Student 94','student94@mail.com',NULL,2023,6.99,NULL,NULL,1,3,1),(95,'Student 95','student95@mail.com',NULL,2023,7.94,NULL,NULL,1,3,2),(96,'Student 96','student96@mail.com',NULL,2023,7.68,NULL,NULL,0,3,2),(97,'Student 97','student97@mail.com',NULL,2023,9.22,NULL,NULL,0,1,3),(98,'Student 98','student98@mail.com',NULL,2023,7.87,NULL,NULL,0,2,4),(99,'Student 99','student99@mail.com',NULL,2023,6.57,NULL,NULL,1,3,4),(100,'Student 100','student100@mail.com',NULL,2023,8.53,NULL,NULL,0,3,3);
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userroles`
--

DROP TABLE IF EXISTS `userroles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userroles` (
  `user_id` int NOT NULL,
  `user_type` varchar(50) NOT NULL,
  `assigned_on` date DEFAULT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`user_type`),
  KEY `fk_UserRoles_Roles1_idx` (`role_id`),
  CONSTRAINT `fk_UserRoles_Roles1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userroles`
--

LOCK TABLES `userroles` WRITE;
/*!40000 ALTER TABLE `userroles` DISABLE KEYS */;
INSERT INTO `userroles` VALUES (1,'Instructor','2024-06-01',2),(1,'Student','2024-07-01',3),(2,'Instructor','2024-06-01',2),(2,'Student','2024-07-01',3),(3,'Student','2024-07-01',3),(4,'Student','2024-07-01',3);
/*!40000 ALTER TABLE `userroles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `waitlist`
--

DROP TABLE IF EXISTS `waitlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waitlist` (
  `waitlist_id` int NOT NULL AUTO_INCREMENT,
  `position` int DEFAULT NULL,
  `priority_type` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  PRIMARY KEY (`waitlist_id`),
  UNIQUE KEY `student_id` (`student_id`,`course_id`),
  KEY `fk_Waitlist_Student1_idx` (`student_id`),
  KEY `fk_Waitlist_Course1_idx` (`course_id`),
  CONSTRAINT `fk_Waitlist_Course1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `fk_Waitlist_Student1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waitlist`
--

LOCK TABLES `waitlist` WRITE;
/*!40000 ALTER TABLE `waitlist` DISABLE KEYS */;
INSERT INTO `waitlist` VALUES (1,1,NULL,'waiting',6,1),(2,2,NULL,'waiting',7,1),(3,3,NULL,'waiting',8,1),(4,4,NULL,'waiting',1,1),(5,5,NULL,'waiting',5,1),(6,1,NULL,'waiting',3,2),(7,1,NULL,'waiting',5,3);
/*!40000 ALTER TABLE `waitlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'mydb'
--

--
-- Dumping routines for database 'mydb'
--
/*!50003 DROP FUNCTION IF EXISTS `fn_attendance_pct` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_attendance_pct`(p_student INT, p_course INT) RETURNS decimal(5,2)
    DETERMINISTIC
BEGIN
  DECLARE v_pct DECIMAL(5,2);

  SELECT ROUND(
    SUM(CASE WHEN LOWER(TRIM(status)) = 'present' THEN 1 ELSE 0 END) * 100.0 /
    NULLIF(COUNT(*),0),
    2
  )
  INTO v_pct
  FROM Attendance
  WHERE student_id = p_student
    AND course_id = p_course;

  RETURN IFNULL(v_pct, 0);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_calculate_cgpa` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calculate_cgpa`(p_student INT) RETURNS decimal(5,2)
    DETERMINISTIC
BEGIN
  DECLARE v_cgpa DECIMAL(5,2);

  SELECT ROUND(
    SUM((pr.grade/10) * c.credits) / NULLIF(SUM(c.credits),0),
    2
  )
  INTO v_cgpa
  FROM Progress pr
  JOIN Course c ON pr.course_id = c.course_id
  WHERE pr.student_id = p_student;

  RETURN IFNULL(v_cgpa, 0);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_get_grade` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_get_grade`(p_grade DECIMAL(5,2)) RETURNS varchar(5) CHARSET utf8mb3
    DETERMINISTIC
BEGIN
    IF p_grade IS NULL THEN
        RETURN '—';
    ELSEIF p_grade >= 90 THEN RETURN 'A+';
    ELSEIF p_grade >= 80 THEN RETURN 'A';
    ELSEIF p_grade >= 70 THEN RETURN 'B';
    ELSEIF p_grade >= 60 THEN RETURN 'C';
    ELSEIF p_grade >= 50 THEN RETURN 'D';
    ELSEIF p_grade >= 40 THEN RETURN 'E';
    ELSE RETURN 'F';
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_scholarship_tier` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_scholarship_tier`(p_student INT) RETURNS varchar(20) CHARSET utf8mb3
    DETERMINISTIC
BEGIN
  DECLARE v_cgpa DECIMAL(5,2);

  SET v_cgpa = fn_calculate_cgpa(p_student);

  RETURN CASE
    WHEN v_cgpa >= 9 THEN 'Gold'
    WHEN v_cgpa >= 8 THEN 'Silver'
    WHEN v_cgpa >= 7 THEN 'Bronze'
    ELSE 'None'
  END;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `drop_and_promote` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `drop_and_promote`(
  IN p_student_id INT,
  IN p_course_id INT
)
BEGIN
  DECLARE v_sid INT;

  -- Step 1: Drop student
  UPDATE Enrollment
  SET status = 'dropped'
  WHERE student_id = p_student_id
    AND course_id = p_course_id;

  -- Step 2: Reduce capacity
  UPDATE CourseCapacity
  SET enrolled_count = enrolled_count - 1
  WHERE course_id = p_course_id;

  -- Step 3: Get next student
  SELECT student_id INTO v_sid
  FROM Waitlist
  WHERE course_id = p_course_id
    AND status = 'waiting'
  ORDER BY
    CASE WHEN priority_type = 'senior' THEN 0 ELSE 1 END,
    position
  LIMIT 1;

  -- Step 4: Promote
  IF v_sid IS NOT NULL THEN

    INSERT INTO Enrollment (student_id, course_id, status, enrolled_on)
    VALUES (v_sid, p_course_id, 'active', CURDATE());

    UPDATE Waitlist
    SET status = 'enrolled'
    WHERE student_id = v_sid
      AND course_id = p_course_id;

    UPDATE CourseCapacity
    SET enrolled_count = enrolled_count + 1
    WHERE course_id = p_course_id;

  END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_course_recommender` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_course_recommender`(IN sid INT)
BEGIN
  DECLARE dept INT;

  -- get student's department
  SELECT dept_id INTO dept
  FROM student
  WHERE student_id = sid;

  -- recommend courses from same department
  SELECT c.course_name, c.credits
  FROM course c
  WHERE c.dept_id = dept
  AND c.course_id NOT IN (
    SELECT course_id 
    FROM enrollment 
    WHERE student_id = sid
  )
  LIMIT 6;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_enroll_student` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_enroll_student`(IN p_student INT, IN p_course INT)
sp_enroll_student: BEGIN
  DECLARE v_capacity INT;
  DECLARE v_enrolled INT;
  DECLARE v_pos INT;

  START TRANSACTION;

  SELECT max_seats, enrolled_count
  INTO v_capacity, v_enrolled
  FROM CourseCapacity
  WHERE course_id = p_course
  FOR UPDATE;

  IF v_enrolled < v_capacity THEN

    INSERT INTO Enrollment(student_id, course_id, status, enrolled_on)
    VALUES (p_student, p_course, 'active', CURDATE());

    UPDATE CourseCapacity
    SET enrolled_count = enrolled_count + 1
    WHERE course_id = p_course;

  ELSE

    SELECT COUNT(*) + 1 INTO v_pos
    FROM Waitlist
    WHERE course_id = p_course
      AND status = 'waiting';

    INSERT INTO Waitlist(student_id, course_id, position, status)
    VALUES (p_student, p_course, v_pos, 'waiting');

  END IF;

  COMMIT;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_semester_report` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_semester_report`(IN p_course INT)
BEGIN
  SELECT s.full_name, pr.grade
  FROM Progress pr
  JOIN Student s ON pr.student_id = s.student_id
  WHERE pr.course_id = p_course;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-19 21:04:52
