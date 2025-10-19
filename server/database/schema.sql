-- EDIS Portal Database Schema
-- Enhanced Digital Imaging Solutions

-- Create database
CREATE DATABASE IF NOT EXISTS edis_portal;
USE edis_portal;

-- Clients table
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(50) UNIQUE NOT NULL,
    project_id VARCHAR(20) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    project_details JSON,
    deliverables_access JSON,
    honeybook_contact_id VARCHAR(100),
    honeybook_project_id VARCHAR(100),
    
    INDEX idx_client_id (client_id),
    INDEX idx_project_id (project_id),
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Deliverables table
CREATE TABLE deliverables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(20) NOT NULL,
    type ENUM('image', 'map', 'model', 'report', 'video', 'document') NOT NULL,
    category VARCHAR(100),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    filepath VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    description TEXT,
    thumbnail_path VARCHAR(500),
    metadata JSON,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_processed BOOLEAN DEFAULT FALSE,
    processing_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    download_count INT DEFAULT 0,
    
    FOREIGN KEY (project_id) REFERENCES clients(project_id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id),
    INDEX idx_type (type),
    INDEX idx_upload_date (upload_date)
);

-- Project timeline table
CREATE TABLE project_timeline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(20) NOT NULL,
    event_type ENUM('booking', 'payment', 'imaging_scheduled', 'imaging_completed', 'processing_started', 'processing_completed', 'deliverables_uploaded', 'client_notified', 'project_completed') NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    event_description TEXT,
    event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    created_by ENUM('system', 'admin', 'honeybook') DEFAULT 'system',
    
    FOREIGN KEY (project_id) REFERENCES clients(project_id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id),
    INDEX idx_event_date (event_date),
    INDEX idx_event_type (event_type)
);

-- Admin users table
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'super_admin') DEFAULT 'admin',
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Webhook logs table
CREATE TABLE webhook_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSON,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
    error_message TEXT,
    client_id VARCHAR(50),
    project_id VARCHAR(20),
    
    INDEX idx_source (source),
    INDEX idx_event_type (event_type),
    INDEX idx_processed_at (processed_at),
    INDEX idx_client_id (client_id)
);

-- Email notifications table
CREATE TABLE email_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_type ENUM('client', 'admin') NOT NULL,
    subject VARCHAR(500) NOT NULL,
    template_type VARCHAR(100) NOT NULL,
    template_data JSON,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_status ENUM('sent', 'failed', 'bounced', 'delivered') DEFAULT 'sent',
    client_id VARCHAR(50),
    project_id VARCHAR(20),
    
    INDEX idx_recipient_email (recipient_email),
    INDEX idx_sent_at (sent_at),
    INDEX idx_delivery_status (delivery_status)
);

-- File access logs table
CREATE TABLE file_access_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    project_id VARCHAR(20) NOT NULL,
    deliverable_id INT NOT NULL,
    access_type ENUM('view', 'download', 'preview') NOT NULL,
    access_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    FOREIGN KEY (deliverable_id) REFERENCES deliverables(id) ON DELETE CASCADE,
    INDEX idx_client_id (client_id),
    INDEX idx_project_id (project_id),
    INDEX idx_access_date (access_date)
);

-- System settings table
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSON,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100)
);

-- Insert default admin user (change password after setup!)
INSERT INTO admin_users (username, email, password_hash, role, permissions) VALUES 
('admin', 'admin@edis-imaging.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewTuTmM8U3Hn0p1O', 'super_admin', '{"all": true}');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('portal_settings', '{"maintenance_mode": false, "allow_registration": false, "max_file_size": 104857600}', 'General portal settings'),
('email_settings', '{"smtp_enabled": true, "notification_enabled": true, "welcome_email": true}', 'Email configuration'),
('security_settings', '{"session_timeout": 86400, "password_policy": {"min_length": 8, "require_special": true}}', 'Security configuration'),
('honeybook_settings', '{"webhook_enabled": true, "auto_create_clients": true, "send_welcome_email": true}', 'HoneyBook integration settings');

-- Create stored procedures for common operations

DELIMITER $$

-- Create new client from HoneyBook webhook
CREATE PROCEDURE CreateClientFromHoneyBook(
    IN p_client_id VARCHAR(50),
    IN p_project_id VARCHAR(20),
    IN p_company_name VARCHAR(255),
    IN p_contact_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_phone VARCHAR(50),
    IN p_username VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_project_details JSON,
    IN p_honeybook_contact_id VARCHAR(100),
    IN p_honeybook_project_id VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Insert client
    INSERT INTO clients (
        client_id, project_id, company_name, contact_name, email, phone,
        username, password_hash, project_details, deliverables_access,
        honeybook_contact_id, honeybook_project_id
    ) VALUES (
        p_client_id, p_project_id, p_company_name, p_contact_name, p_email, p_phone,
        p_username, p_password_hash, p_project_details, '{"maps": true, "models": true, "images": true, "reports": true, "videos": true}',
        p_honeybook_contact_id, p_honeybook_project_id
    );
    
    -- Add initial timeline event
    INSERT INTO project_timeline (project_id, event_type, event_title, event_description, created_by)
    VALUES (p_project_id, 'booking', 'Project Booked', 'Client account created from HoneyBook booking', 'honeybook');
    
    COMMIT;
END$$

-- Get client dashboard data
CREATE PROCEDURE GetClientDashboard(IN p_client_id VARCHAR(50))
BEGIN
    -- Get client info
    SELECT 
        client_id, project_id, company_name, contact_name, email,
        project_details, deliverables_access, created_at, last_login
    FROM clients 
    WHERE client_id = p_client_id AND status = 'active';
    
    -- Get deliverables
    SELECT 
        d.id, d.type, d.category, d.filename, d.description,
        d.file_size, d.upload_date, d.download_count,
        d.thumbnail_path, d.metadata
    FROM deliverables d
    JOIN clients c ON d.project_id = c.project_id
    WHERE c.client_id = p_client_id
    ORDER BY d.upload_date DESC;
    
    -- Get timeline
    SELECT 
        event_type, event_title, event_description, event_date, metadata
    FROM project_timeline pt
    JOIN clients c ON pt.project_id = c.project_id
    WHERE c.client_id = p_client_id
    ORDER BY pt.event_date DESC
    LIMIT 20;
END$$

DELIMITER ;

-- Create views for common queries

-- Active clients view
CREATE VIEW active_clients AS
SELECT 
    client_id, project_id, company_name, contact_name, email, phone,
    created_at, last_login, project_details,
    (SELECT COUNT(*) FROM deliverables d WHERE d.project_id = c.project_id) as deliverable_count
FROM clients c
WHERE status = 'active';

-- Recent deliverables view
CREATE VIEW recent_deliverables AS
SELECT 
    d.id, d.project_id, d.type, d.filename, d.upload_date,
    c.company_name, c.contact_name
FROM deliverables d
JOIN clients c ON d.project_id = c.project_id
WHERE d.upload_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY d.upload_date DESC;

-- Project statistics view
CREATE VIEW project_stats AS
SELECT 
    c.project_id,
    c.company_name,
    COUNT(d.id) as total_deliverables,
    SUM(CASE WHEN d.type = 'image' THEN 1 ELSE 0 END) as image_count,
    SUM(CASE WHEN d.type = 'map' THEN 1 ELSE 0 END) as map_count,
    SUM(CASE WHEN d.type = 'model' THEN 1 ELSE 0 END) as model_count,
    SUM(CASE WHEN d.type = 'report' THEN 1 ELSE 0 END) as report_count,
    SUM(CASE WHEN d.type = 'video' THEN 1 ELSE 0 END) as video_count,
    MAX(d.upload_date) as last_upload
FROM clients c
LEFT JOIN deliverables d ON c.project_id = d.project_id
WHERE c.status = 'active'
GROUP BY c.project_id, c.company_name;

-- Indexes for performance
CREATE INDEX idx_clients_created_at ON clients(created_at);
CREATE INDEX idx_deliverables_upload_date ON deliverables(upload_date);
CREATE INDEX idx_timeline_project_event ON project_timeline(project_id, event_date);
CREATE INDEX idx_webhook_logs_processed_at ON webhook_logs(processed_at);

-- Set up database user with appropriate permissions
-- CREATE USER 'edis_app'@'localhost' IDENTIFIED BY 'secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON edis_portal.* TO 'edis_app'@'localhost';
-- FLUSH PRIVILEGES;