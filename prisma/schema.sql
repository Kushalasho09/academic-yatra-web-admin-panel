-- Academic Yatra MySQL Database Schema
-- Import this SQL directly into phpMyAdmin or MySQL Workbench

CREATE TABLE IF NOT EXISTS `Blog` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `excerpt` TEXT NULL,
  `content` LONGTEXT NOT NULL,
  `coverImage` VARCHAR(1000) NULL,
  `author` VARCHAR(100) NOT NULL DEFAULT 'Academic Yatra Team',
  `category` VARCHAR(100) NOT NULL DEFAULT 'Study Abroad',
  `tags` VARCHAR(255) NULL,
  `readTime` VARCHAR(50) NULL DEFAULT '5 min read',
  `isPublished` BOOLEAN NOT NULL DEFAULT TRUE,
  `views` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Blog_slug_key` (`slug`),
  KEY `Blog_category_idx` (`category`),
  KEY `Blog_isPublished_idx` (`isPublished`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Course` (
  `id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Course_category_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CoursePlan` (
  `id` VARCHAR(191) NOT NULL,
  `courseId` VARCHAR(100) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `price` VARCHAR(50) NOT NULL,
  `numericPrice` DOUBLE NOT NULL,
  `originalPrice` VARCHAR(50) NULL,
  `period` VARCHAR(50) NULL,
  `duration` VARCHAR(50) NULL,
  `validityText` VARCHAR(100) NULL,
  `liveHours` VARCHAR(100) NULL,
  `badge` VARCHAR(50) NULL,
  `isFeatured` BOOLEAN NOT NULL DEFAULT FALSE,
  `description` TEXT NULL,
  `features` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `CoursePlan_courseId_idx` (`courseId`),
  CONSTRAINT `CoursePlan_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AdminUser` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `AdminUser_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
