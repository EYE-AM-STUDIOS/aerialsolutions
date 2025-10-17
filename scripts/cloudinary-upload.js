#!/usr/bin/env node
/**
 * EDIS Cloudinary Bulk Upload Script
 * Upload images from client folders to Cloudinary with proper organization
 * Supports both Aerial and Ground-Based Imaging services
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
 * EDIS Service Type Utilities
 */

// Infer service type from project details
function inferServiceType(clientId, projectType) {
    const aerialKeywords = ['aerial', 'drone', 'orthomosaic', 'mapping', 'survey', 'inspection'];
    const groundKeywords = ['ground', 'interior', 'equipment', 'infrastructure', 'documentation'];
    
    const searchText = `${clientId} ${projectType}`.toLowerCase();
    
    if (aerialKeywords.some(keyword => searchText.includes(keyword))) {
        return 'aerial';
    } else if (groundKeywords.some(keyword => searchText.includes(keyword))) {
        return 'ground';
    }
    
    // Default to aerial for backward compatibility
    return 'aerial';
}

// Get folder structure for service type
function getServiceFolder(serviceType) {
    const folderMap = {
        aerial: 'aerial-imaging',
        ground: 'ground-imaging', 
        infrastructure: 'infrastructure',
        equipment: 'equipment',
        progress: 'progress-docs'
    };
    return folderMap[serviceType] || 'aerial-imaging';
}

// Get default equipment based on service type
function getDefaultEquipment(serviceType) {
    const equipmentMap = {
        aerial: 'DJI Mavic 3 Pro',
        ground: 'Canon EOS R5',
        infrastructure: 'Sony A7R IV',
        equipment: 'Canon EOS R5',
        progress: 'Various'
    };
    return equipmentMap[serviceType] || 'EDIS Equipment';
}

// Get service-specific transformation settings
function getServiceTransformation(serviceType) {
    const transformations = {
        aerial: { width: 1600, height: 1067, crop: 'limit' },
        ground: { width: 1600, height: 1200, crop: 'limit' },
        infrastructure: { width: 1600, height: 1200, crop: 'limit' },
        equipment: { width: 1200, height: 1200, crop: 'limit' },
        progress: { width: 1600, height: 900, crop: 'limit' } // 16:9 for progress docs
    };
    return transformations[serviceType] || transformations.aerial;
}

/**
 * Upload images for a specific client
 * @param {string} clientId - Client folder ID
 * @param {object} options - Upload options
 * @param {string} options.serviceType - 'aerial', 'ground', 'infrastructure', 'equipment', 'progress'
 * @param {string} options.projectType - Project type for tagging
 * @param {string} options.equipment - Equipment used for capture
 * @param {string} options.pilot - Operator/photographer name
 * @param {string} options.location - Capture location
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

    // Determine service type from options or infer from project
    const serviceType = options.serviceType || inferServiceType(clientId, options.projectType);
    const serviceFolder = getServiceFolder(serviceType);

    // Get image files
    const imageFiles = fs.readdirSync(imagesDir)
        .filter(f => /\.(jpg|jpeg|png|tiff|raw|dng)$/i.test(f))
        .filter(f => !f.startsWith('thumb-')); // Skip thumbnails for main upload

    console.log(`📤 Starting upload for client: ${clientId}`);
    console.log(`🎯 Service Type: ${serviceType.toUpperCase()}`);
    console.log(`📁 Found ${imageFiles.length} images to upload`);

    const results = [];

    for (const filename of imageFiles) {
        const filePath = path.join(imagesDir, filename);
        const fileStats = fs.statSync(filePath);
        
        console.log(`⬆️  Uploading: ${filename} (${(fileStats.size / 1024 / 1024).toFixed(2)} MB)`);

        try {
            // Generate public ID based on service type and client
            const publicId = `edis-clients/${serviceFolder}/${clientId}/${path.parse(filename).name}`;
            
            // Upload options with EDIS-specific context
            const uploadOptions = {
                public_id: publicId,
                folder: `edis-clients/${serviceFolder}/${clientId}`,
                tags: [
                    serviceType,
                    'edis-portal',
                    clientId,
                    options.projectType || 'documentation',
                    'edis' // EDIS brand tag
                ],
                context: {
                    project: clientId,
                    service_type: serviceType,
                    client_name: clientMeta.name || 'Unknown Client',
                    upload_date: new Date().toISOString().split('T')[0],
                    equipment: options.equipment || getDefaultEquipment(serviceType),
                    operator: options.pilot || options.photographer || 'EDIS Team',
                    location: options.location || 'Unknown Location',
                    project_type: options.projectType || 'documentation',
                    ...options.customContext
                },
                // FREE TIER OPTIMIZATION
                quality: 'auto:eco',
                fetch_format: 'auto',
                format: 'jpg',
                
                // Service-specific transformations
                ...getServiceTransformation(serviceType),
                
                // SKIP EAGER TRANSFORMATIONS (saves transformation credits)
                eager: options.generateEager ? [
                    { width: 300, height: 200, crop: 'fill', quality: 'auto:low' }
                ] : [],
                
                bytes_step: 100000,
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
            const serviceType = args[2] || 'aerial';
            const projectType = args[3] || 'documentation';
            const operator = args[4] || 'EDIS Team';
            const equipment = args[5];
            const location = args[6];
            
            if (!clientId) {
                console.error('Usage: node cloudinary-upload.js upload <client-id> [service-type] [project-type] [operator] [equipment] [location]');
                console.error('Service types: aerial, ground, infrastructure, equipment, progress');
                process.exit(1);
            }
            await uploadClientImages(clientId, {
                serviceType,
                projectType,
                pilot: operator,
                photographer: operator,
                equipment,
                location
            });
            break;

        case 'upload-all':
            const globalServiceType = args[1] || 'aerial';
            await uploadAllClients({
                serviceType: globalServiceType
            });
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
            const listServiceType = args[2];
            if (!listClientId) {
                console.error('Usage: node cloudinary-upload.js list <client-id> [service-type]');
                process.exit(1);
            }
            await listClientImages(listClientId, listServiceType);
            break;

        default:
            console.log('EDIS Cloudinary Upload Tool');
            console.log('Supports both Aerial and Ground-Based Imaging');
            console.log('');
            console.log('Usage:');
            console.log('  node scripts/cloudinary-upload.js upload <client-id> [service-type] [project-type] [operator] [equipment] [location]');
            console.log('  node scripts/cloudinary-upload.js upload-all [default-service-type]');
            console.log('  node scripts/cloudinary-upload.js list <client-id> [service-type]');
            console.log('  node scripts/cloudinary-upload.js delete <client-id>');
            console.log('');
            console.log('Service Types:');
            console.log('  aerial        - Drone/UAV imaging (default)');
            console.log('  ground        - Ground-based photography');
            console.log('  infrastructure- Infrastructure documentation');
            console.log('  equipment     - Equipment/asset photography');
            console.log('  progress      - Progress documentation');
            console.log('');
            console.log('Examples:');
            console.log('  # Aerial imaging (default)');
            console.log('  node scripts/cloudinary-upload.js upload demo-mosaic aerial mapping "John Smith" "DJI Mavic 3 Pro" "Bartow, FL"');
            console.log('');
            console.log('  # Ground-based imaging');
            console.log('  node scripts/cloudinary-upload.js upload office-interior ground documentation "Jane Doe" "Canon EOS R5" "Orlando, FL"');
            console.log('');
            console.log('  # Equipment documentation');
            console.log('  node scripts/cloudinary-upload.js upload hvac-audit equipment inspection "Mike Johnson" "Sony A7R IV" "Tampa, FL"');
            console.log('');
            console.log('  # List specific service type');
            console.log('  node scripts/cloudinary-upload.js list demo-mosaic aerial');
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