#!/usr/bin/env node
/**
 * EAS Cloudinary Free Tier Usage Monitor
 * Track usage against free tier limits to avoid overage
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Free tier limits (October 2025)
const FREE_TIER_LIMITS = {
    storage_gb: 25,
    bandwidth_gb_monthly: 25,
    transformations_monthly: 25000,
    uploads_monthly: 1000,
    videos_monthly: 1000
};

/**
 * Get current usage statistics
 */
async function getUsageStats() {
    try {
        console.log('📊 Fetching Cloudinary usage statistics...\n');
        
        // Get account usage
        const usage = await cloudinary.api.usage();
        
        // Get storage info
        const resources = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'eas-clients/',
            max_results: 500
        });

        // Calculate storage used (in bytes, convert to GB)
        const totalBytes = resources.resources.reduce((sum, resource) => sum + (resource.bytes || 0), 0);
        const storageUsedGB = totalBytes / (1024 * 1024 * 1024);

        // Get current month's stats
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        const stats = {
            // Storage
            storage: {
                used_gb: storageUsedGB,
                limit_gb: FREE_TIER_LIMITS.storage_gb,
                percentage: (storageUsedGB / FREE_TIER_LIMITS.storage_gb) * 100,
                files_count: resources.resources.length
            },
            
            // Bandwidth (from usage API)
            bandwidth: {
                used_gb: usage.bandwidth?.usage || 0,
                limit_gb: FREE_TIER_LIMITS.bandwidth_gb_monthly,
                percentage: ((usage.bandwidth?.usage || 0) / FREE_TIER_LIMITS.bandwidth_gb_monthly) * 100
            },
            
            // Transformations 
            transformations: {
                used: usage.transformations?.usage || 0,
                limit: FREE_TIER_LIMITS.transformations_monthly,
                percentage: ((usage.transformations?.usage || 0) / FREE_TIER_LIMITS.transformations_monthly) * 100
            },
            
            // Uploads (approximate based on resources)
            uploads: {
                used: resources.resources.length,
                limit: FREE_TIER_LIMITS.uploads_monthly,
                percentage: (resources.resources.length / FREE_TIER_LIMITS.uploads_monthly) * 100
            }
        };

        return stats;
        
    } catch (error) {
        console.error('❌ Error fetching usage stats:', error.message);
        return null;
    }
}

/**
 * Display usage report
 */
function displayUsageReport(stats) {
    console.log('🆓 CLOUDINARY FREE TIER USAGE REPORT');
    console.log('====================================\n');

    // Storage
    console.log('💾 STORAGE');
    console.log(`   Used: ${stats.storage.used_gb.toFixed(2)} GB / ${stats.storage.limit_gb} GB (${stats.storage.percentage.toFixed(1)}%)`);
    console.log(`   Files: ${stats.storage.files_count} images`);
    console.log(`   Status: ${getStatusIcon(stats.storage.percentage)} ${getStatusText(stats.storage.percentage)}\n`);

    // Bandwidth
    console.log('🌐 BANDWIDTH (This Month)');
    console.log(`   Used: ${stats.bandwidth.used_gb.toFixed(2)} GB / ${stats.bandwidth.limit_gb} GB (${stats.bandwidth.percentage.toFixed(1)}%)`);
    console.log(`   Status: ${getStatusIcon(stats.bandwidth.percentage)} ${getStatusText(stats.bandwidth.percentage)}\n`);

    // Transformations
    console.log('🔄 TRANSFORMATIONS (This Month)');
    console.log(`   Used: ${stats.transformations.used.toLocaleString()} / ${stats.transformations.limit.toLocaleString()} (${stats.transformations.percentage.toFixed(1)}%)`);
    console.log(`   Status: ${getStatusIcon(stats.transformations.percentage)} ${getStatusText(stats.transformations.percentage)}\n`);

    // Uploads
    console.log('📤 UPLOADS');
    console.log(`   Used: ${stats.uploads.used} / ${stats.uploads.limit} (${stats.uploads.percentage.toFixed(1)}%)`);
    console.log(`   Status: ${getStatusIcon(stats.uploads.percentage)} ${getStatusText(stats.uploads.percentage)}\n`);

    // Warnings and recommendations
    displayRecommendations(stats);
}

function getStatusIcon(percentage) {
    if (percentage < 50) return '✅';
    if (percentage < 80) return '⚠️';
    return '🚨';
}

function getStatusText(percentage) {
    if (percentage < 50) return 'Good';
    if (percentage < 80) return 'Monitor';
    if (percentage < 95) return 'Warning';
    return 'Critical';
}

function displayRecommendations(stats) {
    console.log('💡 RECOMMENDATIONS');
    console.log('==================\n');

    // Storage recommendations
    if (stats.storage.percentage > 80) {
        console.log('🚨 STORAGE WARNING:');
        console.log('   - Consider deleting old/unused images');
        console.log('   - Store originals locally, upload only final deliverables');
        console.log('   - Compress images more aggressively\n');
    }

    // Bandwidth recommendations  
    if (stats.bandwidth.percentage > 80) {
        console.log('🚨 BANDWIDTH WARNING:');
        console.log('   - Implement image lazy loading');
        console.log('   - Use smaller thumbnail sizes');
        console.log('   - Cache images in browser\n');
    }

    // Transformation recommendations
    if (stats.transformations.percentage > 80) {
        console.log('🚨 TRANSFORMATIONS WARNING:');
        console.log('   - Avoid unnecessary image resizing');
        console.log('   - Use fewer transformation presets');
        console.log('   - Pre-process images before upload\n');
    }

    // Upload recommendations
    if (stats.uploads.percentage > 80) {
        console.log('🚨 UPLOADS WARNING:');
        console.log('   - Upload only final customer-facing images');
        console.log('   - Delete test/duplicate images');
        console.log('   - Consider upgrading to paid plan\n');
    }

    // General optimization tips
    console.log('📈 OPTIMIZATION TIPS:');
    console.log('   - Use q_auto:eco for all images');
    console.log('   - Limit image dimensions to 1600px max');
    console.log('   - Upload JPEG instead of PNG when possible');
    console.log('   - Avoid eager transformations');
    console.log('   - Use progressive JPEG format');
}

/**
 * Estimate monthly costs if upgrading
 */
function estimateUpgradeCost(stats) {
    console.log('\n💰 UPGRADE COST ESTIMATION');
    console.log('=========================\n');

    const plusPlan = {
        price: 99,
        storage_gb: 100,
        bandwidth_gb: 100,
        transformations: 275000
    };

    const advancedPlan = {
        price: 224,
        storage_gb: 500,
        bandwidth_gb: 500,
        transformations: 750000
    };

    console.log('📊 If current usage continues:');
    console.log(`   Plus Plan ($${plusPlan.price}/month): ${stats.storage.used_gb < plusPlan.storage_gb ? '✅' : '❌'} Storage, ${stats.bandwidth.used_gb < plusPlan.bandwidth_gb ? '✅' : '❌'} Bandwidth`);
    console.log(`   Advanced Plan ($${advancedPlan.price}/month): ✅ All limits covered\n`);
}

/**
 * Project capacity calculator
 */
function calculateProjectCapacity(stats) {
    const avgImageSizeMB = (stats.storage.used_gb * 1024) / stats.storage.files_count || 2;
    const imagesPerProject = 10; // Average
    
    const remainingStorageGB = FREE_TIER_LIMITS.storage_gb - stats.storage.used_gb;
    const remainingUploads = FREE_TIER_LIMITS.uploads_monthly - stats.uploads.used;
    
    const projectsByStorage = Math.floor((remainingStorageGB * 1024) / (avgImageSizeMB * imagesPerProject));
    const projectsByUploads = Math.floor(remainingUploads / imagesPerProject);
    
    const maxProjects = Math.min(projectsByStorage, projectsByUploads);
    
    console.log('\n🏗️ PROJECT CAPACITY');
    console.log('===================\n');
    console.log(`   Average image size: ${avgImageSizeMB.toFixed(1)} MB`);
    console.log(`   Estimated remaining capacity: ${maxProjects} projects`);
    console.log(`   (Assuming ${imagesPerProject} images per project)\n`);
}

/**
 * Main execution
 */
async function main() {
    const command = process.argv[2];
    
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        console.error('❌ Cloudinary credentials not found. Please set environment variables.');
        process.exit(1);
    }

    const stats = await getUsageStats();
    
    if (!stats) {
        console.error('❌ Could not retrieve usage statistics');
        process.exit(1);
    }

    switch (command) {
        case 'brief':
            console.log(`Storage: ${stats.storage.percentage.toFixed(1)}% | Bandwidth: ${stats.bandwidth.percentage.toFixed(1)}% | Transformations: ${stats.transformations.percentage.toFixed(1)}%`);
            break;
            
        case 'json':
            console.log(JSON.stringify(stats, null, 2));
            break;
            
        default:
            displayUsageReport(stats);
            calculateProjectCapacity(stats);
            estimateUpgradeCost(stats);
            break;
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { getUsageStats, displayUsageReport };