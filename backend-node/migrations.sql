-- ============================================================
-- Database Migration Script for Smart Book Ramadan
-- Execute this script to create all tables
-- ============================================================

CREATE DATABASE IF NOT EXISTS `smartbook_ramadan` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smartbook_ramadan`;

-- -----------------------------------------------------------
-- 1. USERS
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('siswa', 'guru') NOT NULL,
  `nisn` VARCHAR(255) UNIQUE DEFAULT NULL,
  `nip` VARCHAR(255) UNIQUE DEFAULT NULL,
  `class` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(255) DEFAULT NULL,
  `photo_url` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `remember_token` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 2. CLASSES
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `wali_kelas_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `classes_wali_kelas_id_foreign` (`wali_kelas_id`),
  CONSTRAINT `classes_wali_kelas_id_foreign` FOREIGN KEY (`wali_kelas_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `class_id` BIGINT UNSIGNED DEFAULT NULL AFTER `class`;
ALTER TABLE `users` ADD KEY `users_class_id_foreign` (`class_id`);
ALTER TABLE `users` ADD CONSTRAINT `users_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL;

-- -----------------------------------------------------------
-- 3. PRAYER TRACKINGS
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `prayer_trackings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `subuh_checked` TINYINT(1) DEFAULT 0,
  `subuh_berjamaah` TINYINT(1) DEFAULT 0,
  `dzuhur_checked` TINYINT(1) DEFAULT 0,
  `dzuhur_berjamaah` TINYINT(1) DEFAULT 0,
  `ashar_checked` TINYINT(1) DEFAULT 0,
  `ashar_berjamaah` TINYINT(1) DEFAULT 0,
  `maghrib_checked` TINYINT(1) DEFAULT 0,
  `maghrib_berjamaah` TINYINT(1) DEFAULT 0,
  `isya_checked` TINYINT(1) DEFAULT 0,
  `isya_berjamaah` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prayer_trackings_user_id_date_unique` (`user_id`, `date`),
  KEY `prayer_trackings_user_id_foreign` (`user_id`),
  CONSTRAINT `prayer_trackings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 4. SERMON TOPICS
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sermon_topics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `date` DATE DEFAULT NULL,
  `status` ENUM('active','inactive') DEFAULT 'active',
  `created_by` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sermon_topics_created_by_foreign` (`created_by`),
  CONSTRAINT `sermon_topics_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert 3 data contoh (jika belum ada)
INSERT INTO sermon_topics (title, description, date, status, created_by)
SELECT
  'Keutamaan 10 Hari Pertama Ramadhan',
  'Membahas tentang keutamaan sepuluh hari pertama Ramadhan.',
  NULL,
  'active',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM sermon_topics WHERE title = 'Keutamaan 10 Hari Pertama Ramadhan'
);

INSERT INTO sermon_topics (title, description, date, status, created_by)
SELECT
  'Puasa dan Pembentukan Karakter',
  'Bagaimana puasa membentuk karakter muslim yang bertakwa.',
  NULL,
  'active',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM sermon_topics WHERE title = 'Puasa dan Pembentukan Karakter'
);

INSERT INTO sermon_topics (title, description, date, status, created_by)
SELECT
  'Malam Lailatul Qadar',
  'Keutamaan malam Lailatul Qadar dan cara meraihnya.',
  NULL,
  'active',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM sermon_topics WHERE title = 'Malam Lailatul Qadar'
);

-- -----------------------------------------------------------
-- 5. FRIDAY PRAYERS
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `friday_prayers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `khatib_name` VARCHAR(255) NOT NULL,
  `sermon_topic_id` BIGINT UNSIGNED DEFAULT NULL,
  `summary` TEXT NOT NULL,
  `lesson` TEXT DEFAULT NULL,
  `teacher_comment` TEXT DEFAULT NULL,
  `teacher_score` INT DEFAULT NULL,
  `is_graded` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `friday_prayers_user_id_date_unique` (`user_id`, `date`),
  KEY `friday_prayers_user_id_foreign` (`user_id`),
  KEY `friday_prayers_sermon_topic_id_foreign` (`sermon_topic_id`),
  CONSTRAINT `friday_prayers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friday_prayers_sermon_topic_id_foreign` FOREIGN KEY (`sermon_topic_id`) REFERENCES `sermon_topics` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 6. DOA MATERIALS
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `doa_materials` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `arabic_text` TEXT NOT NULL,
  `latin_text` TEXT NOT NULL,
  `translation` TEXT NOT NULL,
  `audio_url` VARCHAR(255) DEFAULT NULL,
  `category` ENUM('niat_puasa', 'berbuka', 'after_berbuka', 'sahur', 'lailatul_qadar') NOT NULL,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `doa_materials_created_by_foreign` (`created_by`),
  CONSTRAINT `doa_materials_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 7. DOA TRACKINGS
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `doa_trackings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `doa_material_id` BIGINT UNSIGNED NOT NULL,
  `memorized` TINYINT(1) DEFAULT 0,
  `read_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `doa_trackings_user_id_doa_material_id_unique` (`user_id`, `doa_material_id`),
  KEY `doa_trackings_user_id_foreign` (`user_id`),
  KEY `doa_trackings_doa_material_id_foreign` (`doa_material_id`),
  CONSTRAINT `doa_trackings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `doa_trackings_doa_material_id_foreign` FOREIGN KEY (`doa_material_id`) REFERENCES `doa_materials` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- (Tables below remain unchanged from original migrations.sql)
-- -----------------------------------------------------------
-- MATERIAL CATEGORIES
CREATE TABLE IF NOT EXISTS `material_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MATERIALS
CREATE TABLE IF NOT EXISTS `materials` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `type` VARCHAR(255) DEFAULT 'article',
  `file_url` VARCHAR(255) DEFAULT NULL,
  `video_url` VARCHAR(255) DEFAULT NULL,
  `thumbnail` VARCHAR(255) DEFAULT NULL,
  `category_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `materials_category_id_foreign` (`category_id`),
  KEY `materials_created_by_foreign` (`created_by`),
  CONSTRAINT `materials_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `material_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `materials_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- QUIZZES
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `time_limit` INT DEFAULT 0,
  `passing_score` INT DEFAULT 70,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- QUESTIONS
CREATE TABLE IF NOT EXISTS `questions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `quiz_id` BIGINT UNSIGNED NOT NULL,
  `question_text` TEXT NOT NULL,
  `points` INT DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `questions_quiz_id_foreign` (`quiz_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ANSWERS
CREATE TABLE IF NOT EXISTS `answers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question_id` BIGINT UNSIGNED NOT NULL,
  `answer_text` TEXT NOT NULL,
  `is_correct` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `answers_question_id_foreign` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- QUIZ RESULTS
CREATE TABLE IF NOT EXISTS `quiz_results` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `quiz_id` BIGINT UNSIGNED NOT NULL,
  `score` INT DEFAULT 0,
  `total_questions` INT DEFAULT 0,
  `correct_answers` INT DEFAULT 0,
  `time_taken` INT DEFAULT NULL,
  `answers_data` JSON DEFAULT NULL,
  `started_at` TIMESTAMP NULL DEFAULT NULL,
  `finished_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- JOURNALS
CREATE TABLE IF NOT EXISTS `journals` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `content` TEXT NOT NULL,
  `mood` VARCHAR(255) DEFAULT NULL,
  `teacher_comment` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(255) DEFAULT 'info',
  `is_read` TINYINT(1) DEFAULT 0,
  `read_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PRAYER SCHEDULES
CREATE TABLE IF NOT EXISTS `prayer_schedules` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL UNIQUE,
  `imsak` VARCHAR(255) NOT NULL,
  `subuh` VARCHAR(255) NOT NULL,
  `dzuhur` VARCHAR(255) NOT NULL,
  `ashar` VARCHAR(255) NOT NULL,
  `maghrib` VARCHAR(255) NOT NULL,
  `isya` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MATERIAL READINGS
CREATE TABLE IF NOT EXISTS `material_readings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `material_id` BIGINT UNSIGNED NOT NULL,
  `read_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

