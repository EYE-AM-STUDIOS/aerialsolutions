#!/usr/bin/env node
/**
 * EAS Cloudinary Bulk Upload Script
 * Upload images from client folders to Cloudinary with proper organization
 */

const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (use environment variables)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload images for a specific client
 * @param {string} clientId - Client folder ID
 * @param {object} options - Upload options
 */
async function uploadClientImages(clientId, options = {}) {
    const clientDir = path.join(__dirname, '..', 'clients', clientId);
    const imagesDir = path.join(clientDir, 'images', 'processed');
    
    if (!fs.existsSync(imagesDir)) {
        console.error(`❌ Images directory not found: ${imagesDir}`);
        return;
    }

    // Read client metadata
    const clientMetaPath = path.join(clientDir, 'client.json');
    let clientMeta = {};
    if (fs.existsSync(clientMetaPath)) {
        clientMeta = JSON.parse(fs.readFileSync(clientMetaPath, 'utf8'));
    }

    // Get image files
    const imageFiles = fs.readdirSync(imagesDir)
        .filter(f => /\.(jpg|jpeg|png|tiff|raw|dng)$/i.test(f))
        .filter(f => !f.startsWith('thumb-')); // Skip thumbnails for main upload

    console.log(`📤 Starting upload for client: ${clientId}`);
    console.log(`📁 Found ${imageFiles.length} images to upload`);

    const results = [];

    for (const filename of imageFiles) {
        const filePath = path.join(imagesDir, filename);
        const fileStats = fs.statSync(filePath);
        
        console.log(`⬆️  Uploading: ${filename} (${(fileStats.size / 1024 / 1024).toFixed(2)} MB)`);

        try {
            // Generate public ID based on client and filename
            const publicId = `eas-clients/${clientId}/${path.parse(filename).name}`;
            
            // Upload options
        const uploadOptions = {
            public_id: publicId,
            folder: `eas-clients/${clientId}`,
            tags: [
                'aerial',
                'eas-portal',
                clientId,
                options.projectType || 'construction'
            ],
            context: {
                project: clientId,
                client_name: clientMeta.name || 'Unknown Client',
                upload_date: new Date().toISOString().split('T')[0], // Date only (save space)
                // Minimize metadata on free tier
                ...(options.pilot && { pilot: options.pilot }),
                ...(options.equipment && { equipment: options.equipment }),
                ...options.customContext
            },
            // FREE TIER OPTIMIZATION
            quality: 'auto:eco',           // Lower quality = smaller files
            fetch_format: 'auto',          // WebP when supported
            format: 'jpg',                 // Force JPEG (smaller than PNG)
            
            // SKIP EAGER TRANSFORMATIONS (saves transformation credits)
            // Generate on-demand instead of pre-generating
            eager: options.generateEager ? [
                { width: 300, height: 200, crop: 'fill', quality: 'auto:low' }  // Only one small thumb
            ] : [],
            
            // Limit file size for free tier
            bytes_step: 100000,            // 100KB chunks (better for free tier)
            overwrite: options.overwrite || false
        };            const result = await cloudinary.uploader.upload(filePath, uploadOptions);
            
            results.push({
                filename,
                publicId: result.public_id,
                url: result.secure_url,
                size: result.bytes,
                format: result.format,
                success: true
            });

            console.log(`✅ Uploaded: ${filename} -> ${result.public_id}`);
            
        } catch (error) {
            console.error(`❌ Failed to upload ${filename}:`, error.message);
            results.push({
                filename,
                error: error.message,
                success: false
            });
        }
    }

    // Generate gallery configuration
    await generateGalleryConfig(clientId, results.filter(r => r.success));
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\n📊 Upload Summary for ${clientId}:`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (successful > 0) {
        console.log(`🎉 Gallery updated at: clients/${clientId}/images/cloudinary-index.json`);
    }

    return results;
}

/**
 * Generate gallery configuration from uploaded results
 */
async function generateGalleryConfig(clientId, uploadResults) {
    const configPath = path.join(__dirname, '..', 'clients', clientId, 'images', 'cloudinary-index.json');
    
    const galleryConfig = {
        generated: new Date().toISOString(),
        client: clientId,
        cloudinary: {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            folder: `eas-clients/${clientId}`
        },
        items: uploadResults.map((result, index) => ({
            name: path.parse(result.filename).name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            publicId: result.publicId,
            filename: result.filename,
            alt: `Aerial image from ${clientId} project`,
            caption: `High-resolution aerial photography`,
            metadata: {
                size: result.size,
                format: result.format,
                uploadDate: new Date().toISOString()
            }
        }))
    };

    fs.writeFileSync(configPath, JSON.stringify(galleryConfig, null, 2));
    console.log(`📝 Generated gallery config: ${configPath}`);
}

/**
 * Upload all client images in batch
 */
async function uploadAllClients(options = {}) {
    const clientsDir = path.join(__dirname, '..', 'clients');
    const clients = fs.readdirSync(clientsDir)
        .filter(f => fs.statSync(path.join(clientsDir, f)).isDirectory())
        .filter(f => f !== 'README.md');

    console.log(`🚀 Starting batch upload for ${clients.length} clients`);

    for (const clientId of clients) {
        await uploadClientImages(clientId, options);
        console.log(`\n⏳ Waiting before next client...\n`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
    }

    console.log('🎉 Batch upload complete!');
}

/**
 * Delete client images from Cloudinary
 */
async function deleteClientImages(clientId) {
    console.log(`🗑️  Deleting images for client: ${clientId}`);
    
    try {
        const result = await cloudinary.api.delete_resources_by_prefix(`eas-clients/${clientId}/`);
        console.log(`✅ Deleted ${Object.keys(result.deleted).length} images`);
        
        // Also delete the folder
        await cloudinary.api.delete_folder(`eas-clients/${clientId}`);
        console.log(`📁 Deleted folder: eas-clients/${clientId}`);
        
    } catch (error) {
        console.error(`❌ Failed to delete images:`, error.message);
    }
}

/**
 * List all images for a client
 */
async function listClientImages(clientId) {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: `eas-clients/${clientId}/`,
            max_results: 100
        });

        console.log(`📋 Images for client ${clientId}:`);
        result.resources.forEach(resource => {
            console.log(`  - ${resource.public_id} (${(resource.bytes / 1024 / 1024).toFixed(2)} MB)`);
        });
        
        return result.resources;
    } catch (error) {
        console.error(`❌ Failed to list images:`, error.message);
        return [];
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        console.error('❌ Cloudinary configuration missing. Please set environment variables:');
        console.error('   CLOUDINARY_CLOUD_NAME');
        console.error('   CLOUDINARY_API_KEY');
        console.error('   CLOUDINARY_API_SECRET');
        process.exit(1);
    }

    switch (command) {
        case 'upload':
            const clientId = args[1];
            if (!clientId) {
                console.error('Usage: node cloudinary-upload.js upload <client-id>');
                process.exit(1);
            }
            await uploadClientImages(clientId, {
                projectType: args[2] || 'construction',
                pilot: args[3] || 'EAS Team',
                equipment: args[4] || 'DJI Mavic 3 Pro'
            });
            break;

        case 'upload-all':
            await uploadAllClients();
            break;

        case 'delete':
            const deleteClientId = args[1];
            if (!deleteClientId) {
                console.error('Usage: node cloudinary-upload.js delete <client-id>');
                process.exit(1);
            }
            await deleteClientImages(deleteClientId);
            break;

        case 'list':
            const listClientId = args[1];
            if (!listClientId) {
                console.error('Usage: node cloudinary-upload.js list <client-id>');
                process.exit(1);
            }
            await listClientImages(listClientId);
            break;

        default:
            console.log('EAS Cloudinary Upload Tool');
            console.log('');
            console.log('Usage:');
            console.log('  node scripts/cloudinary-upload.js upload <client-id> [project-type] [pilot] [equipment]');
            console.log('  node scripts/cloudinary-upload.js upload-all');
            console.log('  node scripts/cloudinary-upload.js list <client-id>');
            console.log('  node scripts/cloudinary-upload.js delete <client-id>');
            console.log('');
            console.log('Examples:');
            console.log('  node scripts/cloudinary-upload.js upload demo-mosaic construction "John Smith" "DJI Mavic 3 Pro"');
            console.log('  node scripts/cloudinary-upload.js list demo-mosaic');
            break;
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    uploadClientImages,
    uploadAllClients,
    deleteClientImages,
    listClientImages,
    generateGalleryConfig
};