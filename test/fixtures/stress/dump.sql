-- MySQL dump 10.13  Distrib 5.5.31, for debian-linux-gnu (i686)
--
-- Host: localhost    Database: express-admin-stress
-- ------------------------------------------------------
-- Server version	5.5.31-0ubuntu0.12.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `inline_many1`
--

DROP TABLE IF EXISTS `inline_many1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `inline_many1_choice1_id` int(11) NOT NULL,
  `inline_many1_choice2_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_inline_many1_item1_idx` (`item_id`),
  KEY `fk_inline_many1_inline_many1_choice11_idx` (`inline_many1_choice1_id`),
  KEY `fk_inline_many1_inline_many1_choice21_idx` (`inline_many1_choice2_id`),
  CONSTRAINT `fk_inline_many1_item1` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_many1_inline_many1_choice11` FOREIGN KEY (`inline_many1_choice1_id`) REFERENCES `inline_many1_choice1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_many1_inline_many1_choice21` FOREIGN KEY (`inline_many1_choice2_id`) REFERENCES `inline_many1_choice2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many1`
--

LOCK TABLES `inline_many1` WRITE;
/*!40000 ALTER TABLE `inline_many1` DISABLE KEYS */;
INSERT INTO `inline_many1` VALUES (1,1,1,2),(2,1,1,2),(3,3,1,2),(4,3,3,1),(5,4,2,2),(6,4,3,3),(7,5,3,1),(8,5,2,2);
/*!40000 ALTER TABLE `inline_many1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_many1_choice1`
--

DROP TABLE IF EXISTS `inline_many1_choice1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many1_choice1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many1_choice1`
--

LOCK TABLES `inline_many1_choice1` WRITE;
/*!40000 ALTER TABLE `inline_many1_choice1` DISABLE KEYS */;
INSERT INTO `inline_many1_choice1` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_many1_choice1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_many1_choice2`
--

DROP TABLE IF EXISTS `inline_many1_choice2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many1_choice2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many1_choice2`
--

LOCK TABLES `inline_many1_choice2` WRITE;
/*!40000 ALTER TABLE `inline_many1_choice2` DISABLE KEYS */;
INSERT INTO `inline_many1_choice2` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_many1_choice2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_many1_group1`
--

DROP TABLE IF EXISTS `inline_many1_group1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many1_group1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many1_group1`
--

LOCK TABLES `inline_many1_group1` WRITE;
/*!40000 ALTER TABLE `inline_many1_group1` DISABLE KEYS */;
INSERT INTO `inline_many1_group1` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_many1_group1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_many1_group2`
--

DROP TABLE IF EXISTS `inline_many1_group2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many1_group2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many1_group2`
--

LOCK TABLES `inline_many1_group2` WRITE;
/*!40000 ALTER TABLE `inline_many1_group2` DISABLE KEYS */;
INSERT INTO `inline_many1_group2` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_many1_group2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_many1_has_inline_many1_group1`
--

DROP TABLE IF EXISTS `inline_many1_has_inline_many1_group1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many1_has_inline_many1_group1` (
  `inline_many1_id` int(11) NOT NULL,
  `inline_many1_group1_id` int(11) NOT NULL,
  PRIMARY KEY (`inline_many1_id`,`inline_many1_group1_id`),
  KEY `fk_inline_many1_has_inline_many1_group1_inline_many1_group1_idx` (`inline_many1_group1_id`),
  KEY `fk_inline_many1_has_inline_many1_group1_inline_many11_idx` (`inline_many1_id`),
  CONSTRAINT `fk_inline_many1_has_inline_many1_group1_inline_many11` FOREIGN KEY (`inline_many1_id`) REFERENCES `inline_many1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_many1_has_inline_many1_group1_inline_many1_group11` FOREIGN KEY (`inline_many1_group1_id`) REFERENCES `inline_many1_group1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many1_has_inline_many1_group1`
--

LOCK TABLES `inline_many1_has_inline_many1_group1` WRITE;
/*!40000 ALTER TABLE `inline_many1_has_inline_many1_group1` DISABLE KEYS */;
INSERT INTO `inline_many1_has_inline_many1_group1` VALUES (1,1),(2,1),(3,1),(3,2),(4,2),(3,3);
/*!40000 ALTER TABLE `inline_many1_has_inline_many1_group1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_many1_has_inline_many1_group2`
--

DROP TABLE IF EXISTS `inline_many1_has_inline_many1_group2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many1_has_inline_many1_group2` (
  `inline_many1_id` int(11) NOT NULL,
  `inline_many1_group2_id` int(11) NOT NULL,
  PRIMARY KEY (`inline_many1_id`,`inline_many1_group2_id`),
  KEY `fk_inline_many1_has_inline_many1_group2_inline_many1_group2_idx` (`inline_many1_group2_id`),
  KEY `fk_inline_many1_has_inline_many1_group2_inline_many11_idx` (`inline_many1_id`),
  CONSTRAINT `fk_inline_many1_has_inline_many1_group2_inline_many11` FOREIGN KEY (`inline_many1_id`) REFERENCES `inline_many1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_many1_has_inline_many1_group2_inline_many1_group21` FOREIGN KEY (`inline_many1_group2_id`) REFERENCES `inline_many1_group2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many1_has_inline_many1_group2`
--

LOCK TABLES `inline_many1_has_inline_many1_group2` WRITE;
/*!40000 ALTER TABLE `inline_many1_has_inline_many1_group2` DISABLE KEYS */;
INSERT INTO `inline_many1_has_inline_many1_group2` VALUES (3,1),(4,1),(1,2),(2,2),(4,2),(1,3),(2,3);
/*!40000 ALTER TABLE `inline_many1_has_inline_many1_group2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_many2`
--

DROP TABLE IF EXISTS `inline_many2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `inline_many2_choice1_id` int(11) NOT NULL,
  `inline_many2_choice2_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_inline_many2_item1_idx` (`item_id`),
  KEY `fk_inline_many2_inline_many2_choice11_idx` (`inline_many2_choice1_id`),
  KEY `fk_inline_many2_inline_many2_choice21_idx` (`inline_many2_choice2_id`),
  CONSTRAINT `fk_inline_many2_item1` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_many2_inline_many2_choice11` FOREIGN KEY (`inline_many2_choice1_id`) REFERENCES `inline_many2_choice1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_many2_inline_many2_choice21` FOREIGN KEY (`inline_many2_choice2_id`) REFERENCES `inline_many2_choice2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many2`
--

LOCK TABLES `inline_many2` WRITE;
/*!40000 ALTER TABLE `inline_many2` DISABLE KEYS */;
INSERT INTO `inline_many2` VALUES (1,1,1,2),(2,1,1,2),(3,3,1,2),(4,3,3,1),(5,4,2,2),(6,4,3,3),(7,5,3,1),(8,5,2,2);
/*!40000 ALTER TABLE `inline_many2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_many2_choice1`
--

DROP TABLE IF EXISTS `inline_many2_choice1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many2_choice1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many2_choice1`
--

LOCK TABLES `inline_many2_choice1` WRITE;
/*!40000 ALTER TABLE `inline_many2_choice1` DISABLE KEYS */;
INSERT INTO `inline_many2_choice1` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_many2_choice1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_many2_choice2`
--

DROP TABLE IF EXISTS `inline_many2_choice2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many2_choice2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many2_choice2`
--

LOCK TABLES `inline_many2_choice2` WRITE;
/*!40000 ALTER TABLE `inline_many2_choice2` DISABLE KEYS */;
INSERT INTO `inline_many2_choice2` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_many2_choice2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_many2_group1`
--

DROP TABLE IF EXISTS `inline_many2_group1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many2_group1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many2_group1`
--

LOCK TABLES `inline_many2_group1` WRITE;
/*!40000 ALTER TABLE `inline_many2_group1` DISABLE KEYS */;
INSERT INTO `inline_many2_group1` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_many2_group1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_many2_group2`
--

DROP TABLE IF EXISTS `inline_many2_group2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many2_group2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many2_group2`
--

LOCK TABLES `inline_many2_group2` WRITE;
/*!40000 ALTER TABLE `inline_many2_group2` DISABLE KEYS */;
INSERT INTO `inline_many2_group2` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_many2_group2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_many2_has_inline_many2_group1`
--

DROP TABLE IF EXISTS `inline_many2_has_inline_many2_group1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many2_has_inline_many2_group1` (
  `inline_many2_id` int(11) NOT NULL,
  `inline_many2_group1_id` int(11) NOT NULL,
  PRIMARY KEY (`inline_many2_id`,`inline_many2_group1_id`),
  KEY `fk_inline_many2_has_inline_many2_group1_inline_many2_group1_idx` (`inline_many2_group1_id`),
  KEY `fk_inline_many2_has_inline_many2_group1_inline_many21_idx` (`inline_many2_id`),
  CONSTRAINT `fk_inline_many2_has_inline_many2_group1_inline_many21` FOREIGN KEY (`inline_many2_id`) REFERENCES `inline_many2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_many2_has_inline_many2_group1_inline_many2_group11` FOREIGN KEY (`inline_many2_group1_id`) REFERENCES `inline_many2_group1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many2_has_inline_many2_group1`
--

LOCK TABLES `inline_many2_has_inline_many2_group1` WRITE;
/*!40000 ALTER TABLE `inline_many2_has_inline_many2_group1` DISABLE KEYS */;
INSERT INTO `inline_many2_has_inline_many2_group1` VALUES (1,1),(2,1),(3,1),(3,2),(4,2),(3,3);
/*!40000 ALTER TABLE `inline_many2_has_inline_many2_group1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_many2_has_inline_many2_group2`
--

DROP TABLE IF EXISTS `inline_many2_has_inline_many2_group2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_many2_has_inline_many2_group2` (
  `inline_many2_id` int(11) NOT NULL,
  `inline_many2_group2_id` int(11) NOT NULL,
  PRIMARY KEY (`inline_many2_id`,`inline_many2_group2_id`),
  KEY `fk_inline_many2_has_inline_many2_group2_inline_many2_group2_idx` (`inline_many2_group2_id`),
  KEY `fk_inline_many2_has_inline_many2_group2_inline_many21_idx` (`inline_many2_id`),
  CONSTRAINT `fk_inline_many2_has_inline_many2_group2_inline_many21` FOREIGN KEY (`inline_many2_id`) REFERENCES `inline_many2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_many2_has_inline_many2_group2_inline_many2_group21` FOREIGN KEY (`inline_many2_group2_id`) REFERENCES `inline_many2_group2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_many2_has_inline_many2_group2`
--

LOCK TABLES `inline_many2_has_inline_many2_group2` WRITE;
/*!40000 ALTER TABLE `inline_many2_has_inline_many2_group2` DISABLE KEYS */;
INSERT INTO `inline_many2_has_inline_many2_group2` VALUES (3,1),(4,1),(1,2),(2,2),(4,2),(1,3),(2,3);
/*!40000 ALTER TABLE `inline_many2_has_inline_many2_group2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one1`
--

DROP TABLE IF EXISTS `inline_one1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `inline_one1_choice1_id` int(11) NOT NULL,
  `inline_one1_choice2_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_inline_one1_item1` (`item_id`),
  KEY `fk_inline_one1_inline_one1_choice11_idx` (`inline_one1_choice1_id`),
  KEY `fk_inline_one1_inline_one1_choice21_idx` (`inline_one1_choice2_id`),
  CONSTRAINT `fk_inline_one1_item10` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_one1_inline_one1_choice11` FOREIGN KEY (`inline_one1_choice1_id`) REFERENCES `inline_one1_choice1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_one1_inline_one1_choice21` FOREIGN KEY (`inline_one1_choice2_id`) REFERENCES `inline_one1_choice2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one1`
--

LOCK TABLES `inline_one1` WRITE;
/*!40000 ALTER TABLE `inline_one1` DISABLE KEYS */;
INSERT INTO `inline_one1` VALUES (1,1,1,2),(2,3,3,1),(3,4,2,2),(4,5,3,2);
/*!40000 ALTER TABLE `inline_one1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one1_choice1`
--

DROP TABLE IF EXISTS `inline_one1_choice1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one1_choice1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one1_choice1`
--

LOCK TABLES `inline_one1_choice1` WRITE;
/*!40000 ALTER TABLE `inline_one1_choice1` DISABLE KEYS */;
INSERT INTO `inline_one1_choice1` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_one1_choice1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one1_choice2`
--

DROP TABLE IF EXISTS `inline_one1_choice2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one1_choice2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one1_choice2`
--

LOCK TABLES `inline_one1_choice2` WRITE;
/*!40000 ALTER TABLE `inline_one1_choice2` DISABLE KEYS */;
INSERT INTO `inline_one1_choice2` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_one1_choice2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one1_group1`
--

DROP TABLE IF EXISTS `inline_one1_group1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one1_group1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one1_group1`
--

LOCK TABLES `inline_one1_group1` WRITE;
/*!40000 ALTER TABLE `inline_one1_group1` DISABLE KEYS */;
INSERT INTO `inline_one1_group1` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_one1_group1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one1_group2`
--

DROP TABLE IF EXISTS `inline_one1_group2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one1_group2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one1_group2`
--

LOCK TABLES `inline_one1_group2` WRITE;
/*!40000 ALTER TABLE `inline_one1_group2` DISABLE KEYS */;
INSERT INTO `inline_one1_group2` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_one1_group2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one1_has_inline_one1_group1`
--

DROP TABLE IF EXISTS `inline_one1_has_inline_one1_group1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one1_has_inline_one1_group1` (
  `inline_one1_id` int(11) NOT NULL,
  `inline_one1_group1_id` int(11) NOT NULL,
  PRIMARY KEY (`inline_one1_id`,`inline_one1_group1_id`),
  KEY `fk_inline_one1_has_inline_one1_group1_inline_one1_group11_idx` (`inline_one1_group1_id`),
  KEY `fk_inline_one1_has_inline_one1_group1_inline_one11_idx` (`inline_one1_id`),
  CONSTRAINT `fk_inline_one1_has_inline_one1_group1_inline_one11` FOREIGN KEY (`inline_one1_id`) REFERENCES `inline_one1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_one1_has_inline_one1_group1_inline_one1_group11` FOREIGN KEY (`inline_one1_group1_id`) REFERENCES `inline_one1_group1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one1_has_inline_one1_group1`
--

LOCK TABLES `inline_one1_has_inline_one1_group1` WRITE;
/*!40000 ALTER TABLE `inline_one1_has_inline_one1_group1` DISABLE KEYS */;
INSERT INTO `inline_one1_has_inline_one1_group1` VALUES (1,1),(2,1),(2,2),(3,2),(2,3);
/*!40000 ALTER TABLE `inline_one1_has_inline_one1_group1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one1_has_inline_one1_group2`
--

DROP TABLE IF EXISTS `inline_one1_has_inline_one1_group2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one1_has_inline_one1_group2` (
  `inline_one1_id` int(11) NOT NULL,
  `inline_one1_group2_id` int(11) NOT NULL,
  PRIMARY KEY (`inline_one1_id`,`inline_one1_group2_id`),
  KEY `fk_inline_one1_has_inline_one1_group2_inline_one1_group21_idx` (`inline_one1_group2_id`),
  KEY `fk_inline_one1_has_inline_one1_group2_inline_one11_idx` (`inline_one1_id`),
  CONSTRAINT `fk_inline_one1_has_inline_one1_group2_inline_one11` FOREIGN KEY (`inline_one1_id`) REFERENCES `inline_one1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_one1_has_inline_one1_group2_inline_one1_group21` FOREIGN KEY (`inline_one1_group2_id`) REFERENCES `inline_one1_group2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one1_has_inline_one1_group2`
--

LOCK TABLES `inline_one1_has_inline_one1_group2` WRITE;
/*!40000 ALTER TABLE `inline_one1_has_inline_one1_group2` DISABLE KEYS */;
INSERT INTO `inline_one1_has_inline_one1_group2` VALUES (2,1),(3,1),(1,2),(3,2),(1,3);
/*!40000 ALTER TABLE `inline_one1_has_inline_one1_group2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one2`
--

DROP TABLE IF EXISTS `inline_one2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `inline_one2_choice1_id` int(11) NOT NULL,
  `inline_one2_choice2_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_inline_one2_item1_idx` (`item_id`),
  KEY `fk_inline_one2_inline_one2_choice11_idx` (`inline_one2_choice1_id`),
  KEY `fk_inline_one2_inline_one2_choice21_idx` (`inline_one2_choice2_id`),
  CONSTRAINT `fk_inline_one2_item1` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_one2_inline_one2_choice11` FOREIGN KEY (`inline_one2_choice1_id`) REFERENCES `inline_one2_choice1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_one2_inline_one2_choice21` FOREIGN KEY (`inline_one2_choice2_id`) REFERENCES `inline_one2_choice2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one2`
--

LOCK TABLES `inline_one2` WRITE;
/*!40000 ALTER TABLE `inline_one2` DISABLE KEYS */;
INSERT INTO `inline_one2` VALUES (1,1,1,2),(2,3,3,1),(3,4,2,2),(4,5,3,2);
/*!40000 ALTER TABLE `inline_one2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one2_choice1`
--

DROP TABLE IF EXISTS `inline_one2_choice1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one2_choice1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one2_choice1`
--

LOCK TABLES `inline_one2_choice1` WRITE;
/*!40000 ALTER TABLE `inline_one2_choice1` DISABLE KEYS */;
INSERT INTO `inline_one2_choice1` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_one2_choice1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one2_choice2`
--

DROP TABLE IF EXISTS `inline_one2_choice2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one2_choice2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one2_choice2`
--

LOCK TABLES `inline_one2_choice2` WRITE;
/*!40000 ALTER TABLE `inline_one2_choice2` DISABLE KEYS */;
INSERT INTO `inline_one2_choice2` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_one2_choice2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one2_group1`
--

DROP TABLE IF EXISTS `inline_one2_group1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one2_group1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one2_group1`
--

LOCK TABLES `inline_one2_group1` WRITE;
/*!40000 ALTER TABLE `inline_one2_group1` DISABLE KEYS */;
INSERT INTO `inline_one2_group1` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_one2_group1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one2_group2`
--

DROP TABLE IF EXISTS `inline_one2_group2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one2_group2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one2_group2`
--

LOCK TABLES `inline_one2_group2` WRITE;
/*!40000 ALTER TABLE `inline_one2_group2` DISABLE KEYS */;
INSERT INTO `inline_one2_group2` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `inline_one2_group2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one2_has_inline_one2_group1`
--

DROP TABLE IF EXISTS `inline_one2_has_inline_one2_group1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one2_has_inline_one2_group1` (
  `inline_one2_id` int(11) NOT NULL,
  `inline_one2_group1_id` int(11) NOT NULL,
  PRIMARY KEY (`inline_one2_id`,`inline_one2_group1_id`),
  KEY `fk_inline_one2_has_inline_one2_group1_inline_one2_group11_idx` (`inline_one2_group1_id`),
  KEY `fk_inline_one2_has_inline_one2_group1_inline_one21_idx` (`inline_one2_id`),
  CONSTRAINT `fk_inline_one2_has_inline_one2_group1_inline_one21` FOREIGN KEY (`inline_one2_id`) REFERENCES `inline_one2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_one2_has_inline_one2_group1_inline_one2_group11` FOREIGN KEY (`inline_one2_group1_id`) REFERENCES `inline_one2_group1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one2_has_inline_one2_group1`
--

LOCK TABLES `inline_one2_has_inline_one2_group1` WRITE;
/*!40000 ALTER TABLE `inline_one2_has_inline_one2_group1` DISABLE KEYS */;
INSERT INTO `inline_one2_has_inline_one2_group1` VALUES (1,1),(2,1),(2,2),(3,2),(2,3);
/*!40000 ALTER TABLE `inline_one2_has_inline_one2_group1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inline_one2_has_inline_one2_group2`
--

DROP TABLE IF EXISTS `inline_one2_has_inline_one2_group2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inline_one2_has_inline_one2_group2` (
  `inline_one2_id` int(11) NOT NULL,
  `inline_one2_group2_id` int(11) NOT NULL,
  PRIMARY KEY (`inline_one2_id`,`inline_one2_group2_id`),
  KEY `fk_inline_one2_has_inline_one2_group2_inline_one2_group21_idx` (`inline_one2_group2_id`),
  KEY `fk_inline_one2_has_inline_one2_group2_inline_one21_idx` (`inline_one2_id`),
  CONSTRAINT `fk_inline_one2_has_inline_one2_group2_inline_one21` FOREIGN KEY (`inline_one2_id`) REFERENCES `inline_one2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_inline_one2_has_inline_one2_group2_inline_one2_group21` FOREIGN KEY (`inline_one2_group2_id`) REFERENCES `inline_one2_group2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inline_one2_has_inline_one2_group2`
--

LOCK TABLES `inline_one2_has_inline_one2_group2` WRITE;
/*!40000 ALTER TABLE `inline_one2_has_inline_one2_group2` DISABLE KEYS */;
INSERT INTO `inline_one2_has_inline_one2_group2` VALUES (2,1),(3,1),(1,2),(3,2),(1,3);
/*!40000 ALTER TABLE `inline_one2_has_inline_one2_group2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item`
--

DROP TABLE IF EXISTS `item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_choice1_id` int(11) NOT NULL,
  `item_choice2_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_item_item_choice1_idx` (`item_choice1_id`),
  KEY `fk_item_item_choice21_idx` (`item_choice2_id`),
  CONSTRAINT `fk_item_item_choice1` FOREIGN KEY (`item_choice1_id`) REFERENCES `item_choice1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_item_item_choice21` FOREIGN KEY (`item_choice2_id`) REFERENCES `item_choice2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item`
--

LOCK TABLES `item` WRITE;
/*!40000 ALTER TABLE `item` DISABLE KEYS */;
INSERT INTO `item` VALUES (1,1,2),(2,3,3),(3,2,3),(4,2,1),(5,2,2);
/*!40000 ALTER TABLE `item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_choice1`
--

DROP TABLE IF EXISTS `item_choice1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item_choice1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_choice1`
--

LOCK TABLES `item_choice1` WRITE;
/*!40000 ALTER TABLE `item_choice1` DISABLE KEYS */;
INSERT INTO `item_choice1` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `item_choice1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_choice2`
--

DROP TABLE IF EXISTS `item_choice2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item_choice2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_choice2`
--

LOCK TABLES `item_choice2` WRITE;
/*!40000 ALTER TABLE `item_choice2` DISABLE KEYS */;
INSERT INTO `item_choice2` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `item_choice2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_group1`
--

DROP TABLE IF EXISTS `item_group1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item_group1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_group1`
--

LOCK TABLES `item_group1` WRITE;
/*!40000 ALTER TABLE `item_group1` DISABLE KEYS */;
INSERT INTO `item_group1` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `item_group1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_group2`
--

DROP TABLE IF EXISTS `item_group2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item_group2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_group2`
--

LOCK TABLES `item_group2` WRITE;
/*!40000 ALTER TABLE `item_group2` DISABLE KEYS */;
INSERT INTO `item_group2` VALUES (1),(2),(3);
/*!40000 ALTER TABLE `item_group2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_has_item_group1`
--

DROP TABLE IF EXISTS `item_has_item_group1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item_has_item_group1` (
  `item_id` int(11) NOT NULL,
  `item_group1_id` int(11) NOT NULL,
  PRIMARY KEY (`item_id`,`item_group1_id`),
  KEY `fk_item_has_item_group1_item_group11_idx` (`item_group1_id`),
  KEY `fk_item_has_item_group1_item1_idx` (`item_id`),
  CONSTRAINT `fk_item_has_item_group1_item1` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_item_has_item_group1_item_group11` FOREIGN KEY (`item_group1_id`) REFERENCES `item_group1` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_has_item_group1`
--

LOCK TABLES `item_has_item_group1` WRITE;
/*!40000 ALTER TABLE `item_has_item_group1` DISABLE KEYS */;
INSERT INTO `item_has_item_group1` VALUES (1,1),(2,1),(2,2),(3,2),(2,3);
/*!40000 ALTER TABLE `item_has_item_group1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_has_item_group2`
--

DROP TABLE IF EXISTS `item_has_item_group2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item_has_item_group2` (
  `item_id` int(11) NOT NULL,
  `item_group2_id` int(11) NOT NULL,
  PRIMARY KEY (`item_id`,`item_group2_id`),
  KEY `fk_item_has_item_group2_item_group21_idx` (`item_group2_id`),
  KEY `fk_item_has_item_group2_item1_idx` (`item_id`),
  CONSTRAINT `fk_item_has_item_group2_item1` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_item_has_item_group2_item_group21` FOREIGN KEY (`item_group2_id`) REFERENCES `item_group2` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_has_item_group2`
--

LOCK TABLES `item_has_item_group2` WRITE;
/*!40000 ALTER TABLE `item_has_item_group2` DISABLE KEYS */;
INSERT INTO `item_has_item_group2` VALUES (2,1),(3,1),(1,2),(3,2),(1,3);
/*!40000 ALTER TABLE `item_has_item_group2` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-06-02 13:25:28
