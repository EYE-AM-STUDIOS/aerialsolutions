/**
 * EDIS Portal Server with HoneyBook Integration
 * Handles webhooks, client management, and authentication
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { handleHoneybookWebhook } = require('./honeybook-webhook');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

/**
 * Authentication middleware
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

/**
 * HoneyBook webhook endpoint
 */
app.post('/api/webhooks/honeybook', express.raw({ type: 'application/json' }), async (req, res) => {
    await handleHoneybookWebhook(req, res);
});

/**
 * Client authentication endpoint
 */
app.post('/api/auth/login', [
    body('username').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Find user in database
        const users = await db.query(
            'SELECT * FROM clients WHERE username = ? AND status = ?',
            [username, 'active']
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                clientId: user.client_id, 
                projectId: user.project_id,
                email: user.email,
                role: 'client'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login
        await db.query(
            'UPDATE clients SET last_login = ? WHERE client_id = ?',
            [new Date(), user.client_id]
        );

        res.json({
            token,
            user: {
                clientId: user.client_id,
                projectId: user.project_id,
                companyName: user.company_name,
                contactName: user.contact_name,
                email: user.email,
                projectDetails: JSON.parse(user.project_details || '{}'),
                deliverablesAccess: JSON.parse(user.deliverables_access || '{}')
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get client dashboard data
 */
app.get('/api/client/dashboard', authenticateToken, async (req, res) => {
    try {
        const clientData = await db.query(
            'SELECT * FROM clients WHERE client_id = ?',
            [req.user.clientId]
        );

        if (clientData.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }

        const client = clientData[0];

        // Get project deliverables
        const deliverables = await db.query(
            'SELECT * FROM deliverables WHERE project_id = ? ORDER BY upload_date DESC',
            [req.user.projectId]
        );

        // Get project timeline
        const timeline = await db.query(
            'SELECT * FROM project_timeline WHERE project_id = ? ORDER BY event_date DESC',
            [req.user.projectId]
        );

        res.json({
            client: {
                companyName: client.company_name,
                contactName: client.contact_name,
                projectId: client.project_id,
                projectDetails: JSON.parse(client.project_details || '{}'),
                deliverablesAccess: JSON.parse(client.deliverables_access || '{}')
            },
            deliverables,
            timeline,
            stats: {
                totalFiles: deliverables.length,
                imagesCount: deliverables.filter(d => d.type === 'image').length,
                mapsCount: deliverables.filter(d => d.type === 'map').length,
                modelsCount: deliverables.filter(d => d.type === 'model').length,
                reportsCount: deliverables.filter(d => d.type === 'report').length
            }
        });

    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Admin endpoints
 */

// Admin authentication
app.post('/api/admin/login', [
    body('username').notEmpty(),
    body('password').isLength({ min: 8 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Check admin credentials (implement your admin auth logic)
        if (username === process.env.ADMIN_USERNAME && 
            await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)) {
            
            const token = jwt.sign(
                { username, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.json({ token, role: 'admin' });
        } else {
            res.status(401).json({ error: 'Invalid admin credentials' });
        }

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all clients (admin only)
app.get('/api/admin/clients', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const clients = await db.query(
            'SELECT client_id, project_id, company_name, contact_name, email, phone, status, created_at FROM clients ORDER BY created_at DESC'
        );

        res.json(clients);
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update client access permissions
app.put('/api/admin/clients/:clientId/access', authenticateToken, [
    body('deliverablesAccess').isObject()
], async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const { clientId } = req.params;
        const { deliverablesAccess } = req.body;

        await db.query(
            'UPDATE clients SET deliverables_access = ? WHERE client_id = ?',
            [JSON.stringify(deliverablesAccess), clientId]
        );

        res.json({ success: true, message: 'Access updated' });
    } catch (error) {
        console.error('Update access error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Upload deliverables
app.post('/api/admin/deliverables', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const { projectId, type, filename, filepath, description } = req.body;

        const result = await db.query(
            'INSERT INTO deliverables (project_id, type, filename, filepath, description, upload_date) VALUES (?, ?, ?, ?, ?, ?)',
            [projectId, type, filename, filepath, description, new Date()]
        );

        // Notify client of new deliverable
        const client = await db.query(
            'SELECT email, contact_name FROM clients WHERE project_id = ?',
            [projectId]
        );

        if (client.length > 0) {
            // Send notification email (implement email notification)
            console.log(`New deliverable uploaded for project ${projectId}`);
        }

        res.json({ success: true, deliverableId: result.insertId });
    } catch (error) {
        console.error('Upload deliverable error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/**
 * Error handling middleware
 */
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

/**
 * Start server
 */
app.listen(PORT, () => {
    console.log(`🚀 EDIS Portal Server running on port ${PORT}`);
    console.log(`📡 HoneyBook webhook endpoint: /api/webhooks/honeybook`);
    console.log(`🔐 Admin portal: /admin-dashboard.html`);
    console.log(`👥 Client portal: /portal.html`);
});

module.exports = app;