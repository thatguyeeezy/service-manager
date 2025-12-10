-- Service Manager Database Schema

CREATE DATABASE IF NOT EXISTS `service_manager` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `service_manager`;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'user') DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services table
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `type` VARCHAR(50) NOT NULL,
  `status` ENUM('running', 'stopped', 'starting', 'stopping', 'error') DEFAULT 'stopped',
  `pid` INT(11) DEFAULT NULL,
  `port` INT(11) DEFAULT NULL,
  `external_port` INT(11) DEFAULT NULL,
  `working_directory` VARCHAR(500) NOT NULL,
  `start_command` TEXT NOT NULL,
  `stop_command` TEXT,
  `environment_vars` TEXT,
  `auto_restart` BOOLEAN DEFAULT FALSE,
  `created_by` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service logs table
CREATE TABLE IF NOT EXISTS `service_logs` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `service_id` INT(11) NOT NULL,
  `log_type` ENUM('stdout', 'stderr', 'system') DEFAULT 'stdout',
  `message` TEXT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE,
  INDEX `idx_service_timestamp` (`service_id`, `timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service statistics table
CREATE TABLE IF NOT EXISTS `service_stats` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `service_id` INT(11) NOT NULL,
  `cpu_usage` DECIMAL(5,2) DEFAULT 0,
  `memory_usage` BIGINT(20) DEFAULT 0,
  `uptime` BIGINT(20) DEFAULT 0,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE,
  INDEX `idx_service_timestamp` (`service_id`, `timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: No default admin user is created for security.
-- Register your first account through the web interface - the first user will be an admin.

