
-- Database Schema for Ticket System

-- Note: When using Railway, the default database is usually 'railway'.
-- If you have permissions, you can create 'ticket_system', otherwise use 'railway'.

CREATE DATABASE IF NOT EXISTS ticket_system;
-- USE ticket_system; -- Commented out to allow running against default 'railway' DB if desired.

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Agents Table
CREATE TABLE IF NOT EXISTS agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    agent_id INT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'OPEN',
    resolution TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_agent ON tickets(agent_id);
CREATE INDEX idx_tickets_client ON tickets(client_id);

-- Seed Data (Optional)
-- Remove IGNORE if you want errors on duplicates, but handy for re-runs
INSERT IGNORE INTO clients (name, email) VALUES 
('Acme Corp', 'contact@acme.com'),
('Globex', 'info@globex.com');

INSERT IGNORE INTO agents (name, email) VALUES 
('Sarah Connor', 'sarah@help.com'),
('John Doe', 'john@help.com');
