/**
 * EAS Cloudinary Integration Library
 * Handles image/video transformations and delivery for aerial imaging portal
 */

class CloudinaryHelpers {
    constructor(cloudName, uploadPreset = null) {
        this.cloudName = cloudName;
        this.uploadPreset = uploadPreset;
        this.baseUrl = `https://res.cloudinary.com/${cloudName}`;
    }

    /**
     * Generate optimized image URL with transformations
     * FREE TIER OPTIMIZED - Supports both Aerial and Ground-Based Imaging
     * @param {string} publicId - Cloudinary public ID
     * @param {string} preset - Size preset (thumb, small, medium, large, full)
     * @param {object} options - Additional transformation options
     */
    getImageUrl(publicId, preset = 'medium', options = {}) {
        // FREE TIER OPTIMIZED PRESETS - Both Aerial and Ground-Based
        const presets = {
            // Basic presets (minimize transformations)
            thumb: 'w_300,h_200,c_fill,f_auto,q_auto:low',
            small: 'w_600,h_400,c_fill,f_auto,q_auto:eco', 
            medium: 'w_800,h_533,c_fill,f_auto,q_auto:eco',
            large: 'w_1200,h_800,c_fill,f_auto,q_auto:eco',
            full: 'f_auto,q_auto:eco', // No resize = minimal transformation cost
            
            // AERIAL IMAGING PRESETS
            aerial_thumb: 'w_300,h_200,c_fill,f_auto,q_auto:low',
            aerial_preview: 'w_800,h_533,c_fill,f_auto,q_auto:eco',
            aerial_full: 'w_1600,h_1067,c_limit,f_auto,q_auto:eco',
            aerial_ortho: 'w_2000,c_limit,f_auto,q_auto:eco', // Orthomosaic maps
            
            // GROUND-BASED IMAGING PRESETS
            ground_thumb: 'w_300,h_200,c_fill,f_auto,q_auto:low',
            ground_preview: 'w_800,h_533,c_fill,f_auto,q_auto:eco',
            ground_full: 'w_1600,h_1067,c_limit,f_auto,q_auto:eco',
            ground_detail: 'w_1200,h_1600,c_limit,f_auto,q_auto:eco', // Portrait orientation for equipment/structural
            
            // SPECIALIZED PRESETS
            // Infrastructure/Construction Documentation
            infra_thumb: 'w_300,h_225,c_fill,f_auto,q_auto:low',
            infra_preview: 'w_800,h_600,c_fill,f_auto,q_auto:eco',
            infra_full: 'w_1600,h_1200,c_limit,f_auto,q_auto:eco',
            
            // Equipment/Asset Documentation  
            equipment_thumb: 'w_200,h_200,c_fill,f_auto,q_auto:low', // Square for equipment
            equipment_preview: 'w_600,h_600,c_fill,f_auto,q_auto:eco',
            equipment_full: 'w_1200,h_1200,c_limit,f_auto,q_auto:eco',
            
            // Progress Documentation (Time-lapse style)
            progress_thumb: 'w_300,h_169,c_fill,f_auto,q_auto:low', // 16:9 aspect
            progress_preview: 'w_800,h_450,c_fill,f_auto,q_auto:eco',
            progress_full: 'w_1600,h_900,c_limit,f_auto,q_auto:eco'
        };

        const transformation = presets[preset] || presets.medium;
        
        // Add custom transformations (FREE TIER: minimize expensive operations)
        let customTransforms = [];
        
        // Skip expensive transformations on free tier to save credits
        if (options.watermark && !options.freeTier) {
            customTransforms.push('l_eas_watermark,o_30,g_south_east,x_20,y_20');
        }
        if (options.blur && !options.freeTier) {
            customTransforms.push(`e_blur:${options.blur}`);
        }
        // Text overlays are expensive - avoid on free tier
        if (options.overlay && !options.freeTier) {
            customTransforms.push(`l_text:Arial_40:${encodeURIComponent(options.overlay)},co_white,g_north_west,x_20,y_20`);
        }

        const finalTransform = [transformation, ...customTransforms].join(',');
        return `${this.baseUrl}/image/upload/${finalTransform}/${publicId}`;
    }

    /**
     * Generate video URL with transformations
     */
    getVideoUrl(publicId, preset = 'web', options = {}) {
        const presets = {
            thumb: 'w_400,h_225,c_fill,f_jpg,fl_getinfo',
            preview: 'w_800,h_450,c_fill,br_500k,f_auto,q_auto:good',
            web: 'w_1280,h_720,c_limit,br_1000k,f_auto,q_auto:good',
            hd: 'w_1920,h_1080,c_limit,br_2000k,f_auto,q_auto:best'
        };

        const transformation = presets[preset] || presets.web;
        return `${this.baseUrl}/video/upload/${transformation}/${publicId}`;
    }

    /**
     * Upload image to Cloudinary (requires signed upload or upload preset)
     */
    async uploadImage(file, folder = 'eas-clients', tags = []) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', folder);
        formData.append('tags', tags.join(','));
        
        // Add metadata for aerial images
        formData.append('context', `project=${folder}|date=${new Date().toISOString()}|type=aerial`);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        return await response.json();
    }

    /**
     * Generate gallery data structure for EDIS client projects
     * Supports both Aerial and Ground-Based Imaging
     */
    formatGalleryData(cloudinaryAssets, projectId, serviceType = 'aerial') {
        return cloudinaryAssets.map(asset => ({
            name: asset.context?.custom?.title || asset.display_name || this.getDefaultImageName(serviceType),
            publicId: asset.public_id,
            serviceType: serviceType,
            src: this.getImageUrl(asset.public_id, `${serviceType}_full`),
            thumb: this.getImageUrl(asset.public_id, `${serviceType}_thumb`), 
            alt: asset.context?.custom?.alt || `${this.getServiceDisplayName(serviceType)} image from ${projectId} project`,
            caption: asset.context?.custom?.caption || '',
            metadata: {
                width: asset.width,
                height: asset.height,
                size: asset.bytes,
                format: asset.format,
                created: asset.created_at,
                serviceType: serviceType,
                equipment: asset.context?.custom?.equipment || 'Unknown',
                location: asset.context?.custom?.location || 'Unknown',
                ...asset.context?.custom
            }
        }));
    }

    /**
     * Get default image name based on service type
     */
    getDefaultImageName(serviceType) {
        const defaults = {
            aerial: 'Aerial Photo',
            ground: 'Ground-Based Image',
            infrastructure: 'Infrastructure Documentation',
            equipment: 'Equipment Photo',
            progress: 'Progress Documentation'
        };
        return defaults[serviceType] || 'EDIS Image';
    }

    /**
     * Get service display name
     */
    getServiceDisplayName(serviceType) {
        const names = {
            aerial: 'Aerial',
            ground: 'Ground-Based',
            infrastructure: 'Infrastructure',
            equipment: 'Equipment',
            progress: 'Progress'
        };
        return names[serviceType] || 'EDIS';
    }

    /**
     * Get responsive image srcset for better performance
     */
    getResponsiveSrcSet(publicId) {
        return [
            `${this.getImageUrl(publicId, 'small')} 800w`,
            `${this.getImageUrl(publicId, 'medium')} 1200w`, 
            `${this.getImageUrl(publicId, 'large')} 1600w`,
            `${this.getImageUrl(publicId, 'full')} 2400w`
        ].join(', ');
    }

    /**
     * Generate download URL with original quality
     */
    getDownloadUrl(publicId, filename = null) {
        const name = filename ? `dl_${filename}` : 'dl_original';
        return `${this.baseUrl}/image/upload/fl_attachment:${name}/${publicId}`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudinaryHelpers;
}

// Make available globally for dashboard usage
if (typeof window !== 'undefined') {
    window.CloudinaryHelpers = CloudinaryHelpers;
}