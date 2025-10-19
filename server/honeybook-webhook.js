/**
 * HoneyBook Webhook Handler for EDIS Portal
 * Automatically creates client accounts and sends login credentials
 */

const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// Database connection (adjust for your database)
const db = require('./database'); // Your database connection

// Email configuration
const emailTransporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Verify HoneyBook webhook signature
 */
function verifyHoneybookSignature(payload, signature, secret) {
    const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(computedSignature, 'hex')
    );
}

/**
 * Generate secure client credentials
 */
function generateClientCredentials(clientData) {
    const clientId = `EDIS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempPassword = Math.random().toString(36).slice(-12);
    
    return {
        clientId,
        tempPassword,
        username: clientData.email,
        projectId: `PRJ_${uuidv4().substr(0, 8).toUpperCase()}`
    };
}

/**
 * Create client record in database
 */
async function createClientRecord(honeybookData, credentials) {
    const clientData = {
        client_id: credentials.clientId,
        project_id: credentials.projectId,
        company_name: honeybookData.client.businessName || honeybookData.client.name,
        contact_name: honeybookData.client.name,
        email: honeybookData.client.email,
        phone: honeybookData.client.phone,
        username: credentials.username,
        password_hash: await bcrypt.hash(credentials.tempPassword, 12),
        status: 'active',
        created_at: new Date(),
        project_details: {
            service_type: honeybookData.project.serviceType,
            project_name: honeybookData.project.name,
            booking_date: honeybookData.project.scheduledDate,
            package: honeybookData.project.package,
            total_amount: honeybookData.project.totalAmount
        },
        deliverables_access: {
            maps: true,
            models: true,
            images: true,
            reports: true,
            videos: true
        }
    };

    // Insert into database
    const result = await db.query(
        `INSERT INTO clients (client_id, project_id, company_name, contact_name, email, phone, 
         username, password_hash, status, created_at, project_details, deliverables_access) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            clientData.client_id,
            clientData.project_id,
            clientData.company_name,
            clientData.contact_name,
            clientData.email,
            clientData.phone,
            clientData.username,
            clientData.password_hash,
            clientData.status,
            clientData.created_at,
            JSON.stringify(clientData.project_details),
            JSON.stringify(clientData.deliverables_access)
        ]
    );

    return result;
}

/**
 * Send welcome email with login credentials
 */
async function sendWelcomeEmail(clientData, credentials) {
    const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; background: #000; color: #fff; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 2.5rem; font-weight: 700; background: linear-gradient(135deg, #00BFFF, #6C5CE7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .welcome-card { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(0, 191, 255, 0.2); border-radius: 20px; padding: 40px; margin: 20px 0; }
            .credentials { background: rgba(0, 191, 255, 0.1); border: 1px solid #00BFFF; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #00BFFF, #6C5CE7); color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 40px; color: #8B95A7; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">EDIS</div>
                <p>Enhanced Digital Imaging Solutions</p>
            </div>
            
            <div class="welcome-card">
                <h2>Welcome to EDIS TrueView Portal!</h2>
                <p>Dear ${clientData.contact_name},</p>
                
                <p>Thank you for choosing EDIS for your imaging needs. Your project has been set up and you now have access to our premium client portal.</p>
                
                <div class="credentials">
                    <h3>🔐 Your Login Credentials</h3>
                    <p><strong>Portal URL:</strong> <a href="${process.env.PORTAL_URL}/portal.html">${process.env.PORTAL_URL}/portal.html</a></p>
                    <p><strong>Username:</strong> ${credentials.username}</p>
                    <p><strong>Temporary Password:</strong> ${credentials.tempPassword}</p>
                    <p><strong>Project ID:</strong> ${credentials.projectId}</p>
                </div>
                
                <p><strong>What you can access:</strong></p>
                <ul>
                    <li>📸 High-resolution imagery</li>
                    <li>🗺️ Interactive maps and orthomosaics</li>
                    <li>🏗️ 3D models and visualizations</li>
                    <li>📊 Detailed project reports</li>
                    <li>🎥 Video content and fly-throughs</li>
                </ul>
                
                <a href="${process.env.PORTAL_URL}/portal.html" class="button">Access Your Portal</a>
                
                <p><small><strong>Security Note:</strong> Please change your password after first login for security.</small></p>
            </div>
            
            <div class="footer">
                <p>Questions? Contact us at support@edis-imaging.com</p>
                <p>© 2025 EYE AM STUDIOS - Enhanced Digital Imaging Solutions</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"EDIS Portal" <${process.env.SMTP_USER}>`,
        to: clientData.email,
        subject: `🎉 Welcome to EDIS Portal - Project ${credentials.projectId}`,
        html: emailTemplate
    };

    return await emailTransporter.sendMail(mailOptions);
}

/**
 * Send admin notification
 */
async function sendAdminNotification(clientData, credentials) {
    const adminEmailTemplate = `
    <div style="font-family: Inter, Arial, sans-serif; background: #000; color: #fff; padding: 20px;">
        <h2 style="color: #00BFFF;">🆕 New Client Account Created</h2>
        
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3>Client Information:</h3>
            <p><strong>Company:</strong> ${clientData.company_name}</p>
            <p><strong>Contact:</strong> ${clientData.contact_name}</p>
            <p><strong>Email:</strong> ${clientData.email}</p>
            <p><strong>Phone:</strong> ${clientData.phone}</p>
            <p><strong>Project ID:</strong> ${credentials.projectId}</p>
            <p><strong>Client ID:</strong> ${credentials.clientId}</p>
        </div>
        
        <div style="background: rgba(0,191,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3>Next Steps:</h3>
            <ul>
                <li>Set up project folders in the system</li>
                <li>Schedule imaging services</li>
                <li>Prepare deliverables structure</li>
            </ul>
        </div>
        
        <a href="${process.env.ADMIN_URL}/admin-dashboard.html" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: 600;">
            Manage in Admin Portal
        </a>
    </div>
    `;

    const adminMailOptions = {
        from: `"EDIS System" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🆕 New Client: ${clientData.company_name} - ${credentials.projectId}`,
        html: adminEmailTemplate
    };

    return await emailTransporter.sendMail(adminMailOptions);
}

/**
 * Main webhook handler
 */
async function handleHoneybookWebhook(req, res) {
    try {
        // Verify webhook signature
        const signature = req.headers['x-honeybook-signature'];
        const payload = JSON.stringify(req.body);
        
        if (!verifyHoneybookSignature(payload, signature, process.env.HONEYBOOK_WEBHOOK_SECRET)) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const honeybookData = req.body;
        
        // Handle different webhook events
        switch (honeybookData.eventType) {
            case 'project.booked':
            case 'invoice.paid':
            case 'contract.signed':
                await processNewClient(honeybookData);
                break;
                
            case 'project.updated':
                await updateClientProject(honeybookData);
                break;
                
            default:
                console.log('Unhandled webhook event:', honeybookData.eventType);
        }

        res.status(200).json({ success: true, message: 'Webhook processed' });
        
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Process new client from HoneyBook
 */
async function processNewClient(honeybookData) {
    // Generate credentials
    const credentials = generateClientCredentials(honeybookData.client);
    
    // Create client record
    await createClientRecord(honeybookData, credentials);
    
    // Send welcome email to client
    await sendWelcomeEmail(honeybookData.client, credentials);
    
    // Send notification to admin
    await sendAdminNotification(honeybookData.client, credentials);
    
    // Log the action
    console.log(`New client created: ${credentials.clientId} for ${honeybookData.client.name}`);
    
    return credentials;
}

/**
 * Update existing client project
 */
async function updateClientProject(honeybookData) {
    // Find existing client
    const existingClient = await db.query(
        'SELECT * FROM clients WHERE email = ?',
        [honeybookData.client.email]
    );
    
    if (existingClient.length > 0) {
        // Update project details
        await db.query(
            'UPDATE clients SET project_details = ? WHERE email = ?',
            [JSON.stringify(honeybookData.project), honeybookData.client.email]
        );
        
        console.log(`Updated client project: ${honeybookData.client.email}`);
    }
}

module.exports = {
    handleHoneybookWebhook,
    processNewClient,
    updateClientProject
};