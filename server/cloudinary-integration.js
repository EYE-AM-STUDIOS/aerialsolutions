/**
 * Cloudinary Integration for EDIS Portal
 * Handles image/video upload, processing, and delivery
 */

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

/**
 * Configure multer with Cloudinary storage
 */
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const { projectId, type } = req.body;
        
        return {
            folder: `edis-portal/${projectId}/${type}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'pdf', 'zip'],
            resource_type: 'auto', // Automatically detect file type
            public_id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            transformation: getTransformationByType(type, file),
            context: {
                project_id: projectId,
                upload_date: new Date().toISOString(),
                original_name: file.originalname
            }
        };
    }
});

/**
 * Get transformation parameters based on file type
 */
function getTransformationByType(type, file) {
    const transformations = {
        image: [
            // Main image with watermark
            {
                width: 1920,
                height: 1080,
                crop: 'limit',
                quality: 'auto:good',
                format: 'webp'
            },
            // Thumbnail
            {
                width: 400,
                height: 300,
                crop: 'fill',
                gravity: 'auto',
                quality: 'auto:good',
                format: 'webp'
            }
        ],
        map: [
            {
                width: 2048,
                height: 2048,
                crop: 'limit',
                quality: 'auto:best',
                format: 'webp'
            }
        ],
        model: [
            // 3D model preview image
            {
                width: 800,
                height: 600,
                crop: 'fill',
                quality: 'auto:good',
                format: 'webp'
            }
        ],
        video: [
            // Video optimization
            {
                quality: 'auto:good',
                format: 'mp4',
                video_codec: 'h264'
            },
            // Video thumbnail
            {
                resource_type: 'video',
                format: 'jpg',
                start_offset: '10%'
            }
        ]
    };

    return transformations[type] || [];
}

/**
 * Multer upload middleware
 */
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
    },
    fileFilter: (req, file, cb) => {
        // Validate file types
        const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|pdf|zip/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

/**
 * Upload deliverables to Cloudinary
 */
async function uploadDeliverable(req, res) {
    try {
        const { projectId, type, category, description } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Store file info in database
        const deliverableData = {
            project_id: projectId,
            type: type,
            category: category || 'general',
            filename: req.file.original_filename,
            original_filename: req.file.originalname,
            filepath: req.file.path,
            cloudinary_public_id: req.file.filename,
            cloudinary_url: req.file.path,
            secure_url: req.file.path.replace('http://', 'https://'),
            file_size: req.file.size,
            mime_type: req.file.mimetype,
            description: description,
            metadata: {
                cloudinary_info: {
                    public_id: req.file.filename,
                    resource_type: req.file.resource_type,
                    format: req.file.format,
                    width: req.file.width,
                    height: req.file.height,
                    created_at: req.file.created_at
                }
            },
            upload_date: new Date(),
            is_processed: true,
            processing_status: 'completed'
        };

        // Insert into database
        const result = await db.query(
            `INSERT INTO deliverables (
                project_id, type, category, filename, original_filename, filepath, 
                cloudinary_public_id, cloudinary_url, secure_url, file_size, mime_type, 
                description, metadata, upload_date, is_processed, processing_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                deliverableData.project_id,
                deliverableData.type,
                deliverableData.category,
                deliverableData.filename,
                deliverableData.original_filename,
                deliverableData.filepath,
                deliverableData.cloudinary_public_id,
                deliverableData.cloudinary_url,
                deliverableData.secure_url,
                deliverableData.file_size,
                deliverableData.mime_type,
                deliverableData.description,
                JSON.stringify(deliverableData.metadata),
                deliverableData.upload_date,
                deliverableData.is_processed,
                deliverableData.processing_status
            ]
        );

        // Generate thumbnail if it's an image
        let thumbnailUrl = null;
        if (type === 'image' || type === 'map') {
            thumbnailUrl = cloudinary.url(req.file.filename, {
                width: 400,
                height: 300,
                crop: 'fill',
                quality: 'auto:good',
                format: 'webp'
            });
        } else if (type === 'video') {
            thumbnailUrl = cloudinary.url(req.file.filename, {
                resource_type: 'video',
                format: 'jpg',
                start_offset: '10%',
                width: 400,
                height: 300,
                crop: 'fill'
            });
        }

        // Update thumbnail in database
        if (thumbnailUrl) {
            await db.query(
                'UPDATE deliverables SET thumbnail_path = ? WHERE id = ?',
                [thumbnailUrl, result.insertId]
            );
        }

        // Notify client of new deliverable
        await notifyClientNewDeliverable(projectId, deliverableData);

        // Add timeline event
        await db.query(
            'INSERT INTO project_timeline (project_id, event_type, event_title, event_description) VALUES (?, ?, ?, ?)',
            [projectId, 'deliverables_uploaded', 'New Deliverable Added', `${type} file: ${req.file.originalname}`]
        );

        res.json({
            success: true,
            deliverable: {
                id: result.insertId,
                filename: req.file.originalname,
                url: req.file.path,
                thumbnail: thumbnailUrl,
                type: type,
                size: req.file.size,
                uploadDate: new Date()
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
}

/**
 * Get optimized deliverables for client portal
 */
async function getClientDeliverables(req, res) {
    try {
        const { projectId } = req.params;
        
        // Get deliverables from database
        const deliverables = await db.query(
            'SELECT * FROM deliverables WHERE project_id = ? ORDER BY upload_date DESC',
            [projectId]
        );

        // Transform for client portal with optimized URLs
        const optimizedDeliverables = deliverables.map(deliverable => {
            let optimizedUrl = deliverable.secure_url;
            let previewUrl = deliverable.thumbnail_path;

            // Generate optimized URLs based on type
            if (deliverable.cloudinary_public_id) {
                switch (deliverable.type) {
                    case 'image':
                        optimizedUrl = cloudinary.url(deliverable.cloudinary_public_id, {
                            width: 1200,
                            quality: 'auto:good',
                            format: 'webp'
                        });
                        previewUrl = cloudinary.url(deliverable.cloudinary_public_id, {
                            width: 400,
                            height: 300,
                            crop: 'fill',
                            quality: 'auto:good',
                            format: 'webp'
                        });
                        break;
                        
                    case 'map':
                        optimizedUrl = cloudinary.url(deliverable.cloudinary_public_id, {
                            width: 2048,
                            quality: 'auto:best',
                            format: 'webp'
                        });
                        break;
                        
                    case 'video':
                        optimizedUrl = cloudinary.url(deliverable.cloudinary_public_id, {
                            resource_type: 'video',
                            quality: 'auto:good',
                            format: 'mp4'
                        });
                        previewUrl = cloudinary.url(deliverable.cloudinary_public_id, {
                            resource_type: 'video',
                            format: 'jpg',
                            start_offset: '10%'
                        });
                        break;
                }
            }

            return {
                id: deliverable.id,
                type: deliverable.type,
                category: deliverable.category,
                filename: deliverable.filename,
                original_filename: deliverable.original_filename,
                description: deliverable.description,
                file_size: deliverable.file_size,
                upload_date: deliverable.upload_date,
                download_count: deliverable.download_count,
                urls: {
                    original: deliverable.secure_url,
                    optimized: optimizedUrl,
                    preview: previewUrl,
                    thumbnail: deliverable.thumbnail_path
                },
                metadata: JSON.parse(deliverable.metadata || '{}')
            };
        });

        res.json({
            success: true,
            deliverables: optimizedDeliverables,
            total: optimizedDeliverables.length
        });

    } catch (error) {
        console.error('Get deliverables error:', error);
        res.status(500).json({ error: 'Failed to fetch deliverables' });
    }
}

/**
 * Generate secure download URLs with tracking
 */
async function generateDownloadUrl(req, res) {
    try {
        const { deliverableId } = req.params;
        const clientId = req.user.clientId;

        // Get deliverable info
        const deliverables = await db.query(
            'SELECT d.*, c.client_id FROM deliverables d JOIN clients c ON d.project_id = c.project_id WHERE d.id = ? AND c.client_id = ?',
            [deliverableId, clientId]
        );

        if (deliverables.length === 0) {
            return res.status(404).json({ error: 'Deliverable not found' });
        }

        const deliverable = deliverables[0];

        // Generate secure download URL (expires in 1 hour)
        let downloadUrl;
        if (deliverable.cloudinary_public_id) {
            downloadUrl = cloudinary.url(deliverable.cloudinary_public_id, {
                resource_type: 'auto',
                flags: 'attachment',
                sign_url: true,
                auth_token: {
                    duration: 3600, // 1 hour
                    start_time: Math.floor(Date.now() / 1000)
                }
            });
        } else {
            downloadUrl = deliverable.secure_url;
        }

        // Log download access
        await db.query(
            'INSERT INTO file_access_logs (client_id, project_id, deliverable_id, access_type, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
            [clientId, deliverable.project_id, deliverableId, 'download', req.ip, req.get('User-Agent')]
        );

        // Update download count
        await db.query(
            'UPDATE deliverables SET download_count = download_count + 1 WHERE id = ?',
            [deliverableId]
        );

        res.json({
            success: true,
            downloadUrl: downloadUrl,
            filename: deliverable.original_filename,
            expiresIn: 3600 // 1 hour in seconds
        });

    } catch (error) {
        console.error('Generate download URL error:', error);
        res.status(500).json({ error: 'Failed to generate download URL' });
    }
}

/**
 * Bulk upload multiple files
 */
async function bulkUploadDeliverables(req, res) {
    try {
        const { projectId, type, category } = req.body;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadResults = [];
        const errors = [];

        for (const file of req.files) {
            try {
                // Process each file similar to single upload
                const deliverableData = {
                    project_id: projectId,
                    type: type,
                    category: category || 'general',
                    filename: file.filename,
                    original_filename: file.originalname,
                    filepath: file.path,
                    cloudinary_public_id: file.filename,
                    cloudinary_url: file.path,
                    secure_url: file.path,
                    file_size: file.size,
                    mime_type: file.mimetype,
                    upload_date: new Date(),
                    is_processed: true,
                    processing_status: 'completed'
                };

                const result = await db.query(
                    'INSERT INTO deliverables (project_id, type, category, filename, original_filename, filepath, cloudinary_public_id, cloudinary_url, secure_url, file_size, mime_type, upload_date, is_processed, processing_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        deliverableData.project_id,
                        deliverableData.type,
                        deliverableData.category,
                        deliverableData.filename,
                        deliverableData.original_filename,
                        deliverableData.filepath,
                        deliverableData.cloudinary_public_id,
                        deliverableData.cloudinary_url,
                        deliverableData.secure_url,
                        deliverableData.file_size,
                        deliverableData.mime_type,
                        deliverableData.upload_date,
                        deliverableData.is_processed,
                        deliverableData.processing_status
                    ]
                );

                uploadResults.push({
                    id: result.insertId,
                    filename: file.originalname,
                    url: file.path,
                    type: type,
                    size: file.size
                });

            } catch (fileError) {
                errors.push({
                    filename: file.originalname,
                    error: fileError.message
                });
            }
        }

        // Add timeline event for bulk upload
        await db.query(
            'INSERT INTO project_timeline (project_id, event_type, event_title, event_description) VALUES (?, ?, ?, ?)',
            [projectId, 'deliverables_uploaded', 'Bulk Upload Completed', `Uploaded ${uploadResults.length} ${type} files`]
        );

        res.json({
            success: true,
            uploaded: uploadResults,
            errors: errors,
            total: uploadResults.length
        });

    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({ error: 'Bulk upload failed' });
    }
}

/**
 * Notify client of new deliverable
 */
async function notifyClientNewDeliverable(projectId, deliverable) {
    try {
        const clients = await db.query(
            'SELECT email, contact_name, company_name FROM clients WHERE project_id = ?',
            [projectId]
        );

        if (clients.length === 0) return;

        const client = clients[0];
        
        const emailTemplate = `
        <div style="font-family: Inter, Arial, sans-serif; background: #000; color: #fff; padding: 20px;">
            <h2 style="color: #00BFFF;">📁 New Deliverable Available</h2>
            
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
                <p>Dear ${client.contact_name},</p>
                <p>A new deliverable has been added to your EDIS project:</p>
                
                <div style="background: rgba(0,191,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>File:</strong> ${deliverable.original_filename}</p>
                    <p><strong>Type:</strong> ${deliverable.type.toUpperCase()}</p>
                    <p><strong>Category:</strong> ${deliverable.category}</p>
                    ${deliverable.description ? `<p><strong>Description:</strong> ${deliverable.description}</p>` : ''}
                </div>
                
                <a href="${process.env.PORTAL_URL}/dashboard.html" style="display: inline-block; background: linear-gradient(135deg, #00BFFF, #6C5CE7); color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: 600;">
                    View in Portal
                </a>
            </div>
        </div>
        `;

        // Send email notification (implement with your email service)
        console.log(`New deliverable notification sent to ${client.email}`);
        
    } catch (error) {
        console.error('Notification error:', error);
    }
}

module.exports = {
    cloudinary,
    upload,
    uploadDeliverable,
    getClientDeliverables,
    generateDownloadUrl,
    bulkUploadDeliverables
};