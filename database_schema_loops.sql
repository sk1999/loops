CREATE DATABASE  IF NOT EXISTS `loops` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `loops`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: loops
-- ------------------------------------------------------
-- Server version	8.0.41

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
-- Table structure for table `attendance_events`
--

DROP TABLE IF EXISTS `attendance_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `attendance_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` int NOT NULL,
  `site_id` int NOT NULL,
  `date` date NOT NULL,
  `status` enum('P','A','OT','PH','ML','OD','8','8.5') COLLATE utf8mb4_unicode_ci NOT NULL,
  `hours` decimal(4,2) DEFAULT NULL,
  `source` enum('EXCEL','UI') COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_file_id` int DEFAULT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_674f81949544d7f204463c3f32` (`attendance_id`),
  UNIQUE KEY `IDX_0f4c91a62dab0241bab7bbbb59` (`employee_id`,`site_id`,`date`),
  KEY `FK_f69553d17b60fcf0dd21a345c6b` (`site_id`),
  CONSTRAINT `FK_e1949a8236a5c307edd9fedc77c` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `FK_f69553d17b60fcf0dd21a345c6b` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_events`
--

LOCK TABLES `attendance_events` WRITE;
/*!40000 ALTER TABLE `attendance_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contract_start` date DEFAULT NULL,
  `contract_end` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_49e91f1e368e3f760789e7764a` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deployments`
--

DROP TABLE IF EXISTS `deployments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deployments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deployment_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` int NOT NULL,
  `site_id` int NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date DEFAULT NULL,
  `rate_override` decimal(10,2) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_18862c068e02f6fed47c956865` (`deployment_id`),
  KEY `FK_965a1a4275655d7b5d169f8bee9` (`employee_id`),
  KEY `FK_6709535bf99aa274377cb4f92c4` (`site_id`),
  CONSTRAINT `FK_6709535bf99aa274377cb4f92c4` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  CONSTRAINT `FK_965a1a4275655d7b5d169f8bee9` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deployments`
--

LOCK TABLES `deployments` WRITE;
/*!40000 ALTER TABLE `deployments` DISABLE KEYS */;
/*!40000 ALTER TABLE `deployments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `father_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mother_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `indian_address` text COLLATE utf8mb4_unicode_ci,
  `indian_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact` text COLLATE utf8mb4_unicode_ci,
  `passport_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport_expiry` date DEFAULT NULL,
  `visa_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visa_expiry` date DEFAULT NULL,
  `passport_document_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visa_document_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `other_documents` json DEFAULT NULL,
  `trade_category_id` int DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `recruitment_agency` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `basic_salary` decimal(10,2) DEFAULT NULL,
  `food_allowance` decimal(10,2) DEFAULT NULL,
  `foreman_allowance` decimal(10,2) DEFAULT NULL,
  `status` enum('active','exited') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_c9a09b8e6588fb4d3c9051c893` (`employee_id`),
  KEY `FK_7b78c8992d248091a507706e7ac` (`trade_category_id`),
  CONSTRAINT `FK_7b78c8992d248091a507706e7ac` FOREIGN KEY (`trade_category_id`) REFERENCES `trade_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'1034','Shreyas Kannan','APPA','AMMA','1999-11-09','Jai Nagar 2nd Street, Arumbakkam','7397411945','9898989898','12345678','2031-11-09','Worker','2028-11-15','/uploads/employees/1034/passport_1768467114904_384985f99cc1ed4b.pdf','/uploads/employees/1034/visa_1768467114913_7d83ee800a03c973.png','/uploads/employees/1034/photo_1768467114917_788ddcc19cbcc614.jpg','[{\"url\": \"/uploads/employees/1034/other_1768467114920_919fba468a82ae20.png\", \"name\": \"zeniusEd.png\", \"type\": \"image/png\", \"uploaded_at\": \"2026-01-15T08:51:54.923Z\"}]',4,'2026-01-15','Arul',1200.00,100.00,199.97,'active','2026-01-15 14:21:54.938019','2026-01-15 14:21:54.938019');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `excel_uploads`
--

DROP TABLE IF EXISTS `excel_uploads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `excel_uploads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `upload_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `upload_type` enum('EMPLOYEE','DEPLOYMENT','ATTENDANCE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','processing','completed','failed','partial') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `total_rows` int NOT NULL DEFAULT '0',
  `processed_rows` int NOT NULL DEFAULT '0',
  `success_rows` int NOT NULL DEFAULT '0',
  `error_rows` int NOT NULL DEFAULT '0',
  `errors` json DEFAULT NULL,
  `mapping` json DEFAULT NULL,
  `uploaded_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f5ad89547b72c9b477d91032c0` (`upload_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `excel_uploads`
--

LOCK TABLES `excel_uploads` WRITE;
/*!40000 ALTER TABLE `excel_uploads` DISABLE KEYS */;
/*!40000 ALTER TABLE `excel_uploads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `month_locks`
--

DROP TABLE IF EXISTS `month_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `month_locks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lock_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `is_locked` tinyint NOT NULL DEFAULT '0',
  `locked_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `locked_at` timestamp NULL DEFAULT NULL,
  `unlocked_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unlock_reason` text COLLATE utf8mb4_unicode_ci,
  `unlocked_at` timestamp NULL DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_c363526e36461839a7dd74c384` (`lock_id`),
  UNIQUE KEY `IDX_0e0fd434a51fc4cd73f8b24a7e` (`year`,`month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `month_locks`
--

LOCK TABLES `month_locks` WRITE;
/*!40000 ALTER TABLE `month_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `month_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll`
--

DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payroll_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` int NOT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `paid_days` int NOT NULL,
  `ot_count` int NOT NULL,
  `daily_rate` decimal(10,2) NOT NULL,
  `salary` decimal(10,2) NOT NULL,
  `ot_amount` decimal(10,2) NOT NULL,
  `net_salary` decimal(10,2) NOT NULL,
  `rule_version` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `calculated_at` timestamp NOT NULL,
  `calculated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_14419a71701a710c311f23dc53` (`payroll_id`),
  UNIQUE KEY `IDX_a8274b3982afcfd561563005fb` (`employee_id`,`year`,`month`),
  CONSTRAINT `FK_877911f59f52f487fb855aa05a2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll`
--

LOCK TABLES `payroll` WRITE;
/*!40000 ALTER TABLE `payroll` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productivity`
--

DROP TABLE IF EXISTS `productivity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productivity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productivity_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` int NOT NULL,
  `site_id` int NOT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `productivity_days` int NOT NULL,
  `productivity_rate` decimal(10,2) NOT NULL,
  `productivity_amount` decimal(10,2) NOT NULL,
  `rule_version` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `calculated_at` timestamp NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_95b35772b9c7f542ebaddeee08` (`productivity_id`),
  UNIQUE KEY `IDX_40b8c8aef91da3850285094b8c` (`employee_id`,`site_id`,`year`,`month`),
  KEY `FK_0a3e81803d6a595b7e868a93576` (`site_id`),
  CONSTRAINT `FK_0a3e81803d6a595b7e868a93576` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  CONSTRAINT `FK_e1e3d2e503ef00ac432f708d915` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productivity`
--

LOCK TABLES `productivity` WRITE;
/*!40000 ALTER TABLE `productivity` DISABLE KEYS */;
/*!40000 ALTER TABLE `productivity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sites`
--

DROP TABLE IF EXISTS `sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` int NOT NULL,
  `site_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `site_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_cc9bfd643a3d4e033198a474db` (`site_id`),
  KEY `FK_e3778eac3a27199aabb29d1724f` (`client_id`),
  CONSTRAINT `FK_e3778eac3a27199aabb29d1724f` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sites`
--

LOCK TABLES `sites` WRITE;
/*!40000 ALTER TABLE `sites` DISABLE KEYS */;
/*!40000 ALTER TABLE `sites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trade_categories`
--

DROP TABLE IF EXISTS `trade_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trade_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trade_category_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payroll_rules` json DEFAULT NULL,
  `productivity_rules` json DEFAULT NULL,
  `rule_version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_555a4c8562afaa8d3c04714dc1` (`trade_category_id`),
  UNIQUE KEY `IDX_e08d476328fde81ffaec3c0a88` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trade_categories`
--

LOCK TABLES `trade_categories` WRITE;
/*!40000 ALTER TABLE `trade_categories` DISABLE KEYS */;
INSERT INTO `trade_categories` VALUES (1,'MASON','MASON','Mason',NULL,NULL,NULL,'2026-01-15 14:18:11.361890','2026-01-15 14:18:11.391939'),(2,'MASON_CHARGEHAND','MASON_CHARGEHAND','Mason Chargehand',NULL,NULL,NULL,'2026-01-15 14:18:11.361890','2026-01-15 14:18:11.391939'),(3,'MEP','MEP','MEP',NULL,NULL,NULL,'2026-01-15 14:18:11.361890','2026-01-15 14:18:11.391939'),(4,'ELECTRICAL_FOREMAN','ELECTRICAL_FOREMAN','Electrical Foreman',NULL,NULL,NULL,'2026-01-15 14:18:11.361890','2026-01-15 14:18:11.391939'),(5,'PLUMBER','PLUMBER','Plumber',NULL,NULL,NULL,'2026-01-15 14:18:11.361890','2026-01-15 14:18:11.391939'),(6,'PLUMBING_FOREMAN','PLUMBING_FOREMAN','Plumbing Foreman',NULL,NULL,NULL,'2026-01-15 14:18:11.361890','2026-01-15 14:18:11.391939'),(7,'CLEANERS','CLEANERS','Cleaners',NULL,NULL,NULL,'2026-01-15 14:18:11.361890','2026-01-15 14:18:11.391939');
/*!40000 ALTER TABLE `trade_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'loops'
--

--
-- Dumping routines for database 'loops'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-10 19:00:35
