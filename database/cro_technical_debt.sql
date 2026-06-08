-- CRO Technical Debt Assessment System
-- MySQL Database Schema

CREATE DATABASE IF NOT EXISTS cro_technical_debt;
USE cro_technical_debt;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'cro_user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  crm_score INT NOT NULL,
  website_score INT NOT NULL,
  customer_score INT NOT NULL,
  integration_score INT NOT NULL,
  data_score INT NOT NULL,
  reporting_score INT NOT NULL,
  final_score DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE revenue_analysis (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  downtime_hours DECIMAL(10,2) NOT NULL,
  revenue_per_hour DECIMAL(15,2) NOT NULL,
  revenue_loss DECIMAL(15,2) NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE customer_churn (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  total_customers INT NOT NULL,
  lost_customers INT NOT NULL,
  churn_rate DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE lead_conversion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  total_leads INT NOT NULL,
  converted_leads INT NOT NULL,
  conversion_rate DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed admin user (password: Admin@123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@cro.com', '$2b$10$rOzJqbkFnFmQ3hZv4kP1oeGpLhXnNmW5KvOJqPbHfZr1lQqPdKmDi', 'admin'),
('CRO User', 'cro@cro.com', '$2b$10$rOzJqbkFnFmQ3hZv4kP1oeGpLhXnNmW5KvOJqPbHfZr1lQqPdKmDi', 'cro_user');
