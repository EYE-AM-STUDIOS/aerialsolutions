// EDIS Cloudinary Configuration
// Replace with your actual Cloudinary credentials
export const CLOUDINARY_CONFIG = {
  // Your Cloudinary cloud name (replace with YOUR actual cloud name)
  cloudName: 'eastudios-dam', // ← Your actual cloud name from dashboard
  
  // Upload presets (create these in your Cloudinary dashboard)
  uploadPresets: {
    // For orthomosaic maps and large imagery
    aerialImages: 'edis_aerial_images',
    // For 3D models and point clouds  
    threeDModels: 'edis_3d_models',
    // For ground-level documentation
    groundImages: 'edis_ground_docs',
    // For client profile/branding images
    clientAssets: 'edis_client_assets',
    // For reports and documents
    documents: 'edis_documents'
  },
  
  // Transformation presets for different use cases
  transformations: {
    // Thumbnail for gallery views
    thumbnail: 'c_fill,w_300,h_200,q_auto,f_auto',
    // Medium size for modal viewing
    medium: 'c_fit,w_800,h_600,q_auto,f_auto',
    // Large for full-screen viewing
    large: 'c_fit,w_1920,h_1080,q_auto,f_auto',
    // Ultra high-res for orthomosaics (maintain quality)
    orthomosaic: 'q_90,f_auto',
    // Optimized for mobile viewing
    mobile: 'c_fit,w_400,h_300,q_auto,f_auto',
    // For 3D model previews
    modelPreview: 'c_fill,w_400,h_400,q_auto,f_auto',
    // Watermarked versions for demo/preview
    watermarked: 'l_text:Arial_30:EDIS%20Preview,co_white,o_60'
  },
  
  // Folder structure in Cloudinary
  folders: {
    clients: 'edis/clients',
    projects: 'edis/projects',
    templates: 'edis/templates',
    system: 'edis/system'
  }
};

// Helper functions for Cloudinary URLs
export const CloudinaryHelpers = {
  // Generate URL for image with transformations
  getImageUrl(publicId, transformation = 'thumbnail') {
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    const transform = CLOUDINARY_CONFIG.transformations[transformation] || transformation;
    return `${baseUrl}/${transform}/${publicId}`;
  },
  
  // Generate URL for video
  getVideoUrl(publicId, transformation = 'q_auto,f_auto') {
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/video/upload`;
    return `${baseUrl}/${transformation}/${publicId}`;
  },
  
  // Generate URL for raw files (PDFs, models, etc.)
  getRawUrl(publicId) {
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/raw/upload/${publicId}`;
  },
  
  // Get upload widget configuration
  getUploadConfig(preset, folder = '') {
    return {
      cloudName: CLOUDINARY_CONFIG.cloudName,
      uploadPreset: CLOUDINARY_CONFIG.uploadPresets[preset] || preset,
      folder: folder,
      multiple: true,
      maxFileSize: 100000000, // 100MB for large aerial images
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'tiff', 'pdf', 'mp4', 'mov'],
      sources: ['local', 'url', 'camera'],
      showUploadMoreButton: true,
      cropping: false, // Don't crop aerial imagery
      eager: [
        { transformation: CLOUDINARY_CONFIG.transformations.thumbnail },
        { transformation: CLOUDINARY_CONFIG.transformations.medium }
      ]
    };
  },
  
  // Generate folder path for client projects
  getClientFolder(clientId, projectId = '') {
    const base = `${CLOUDINARY_CONFIG.folders.clients}/${clientId}`;
    return projectId ? `${base}/${projectId}` : base;
  }
};

// Sample data structure for client deliverables
export const SAMPLE_DELIVERABLES = {
  'demo-mosaic': {
    orthomosaic: {
      publicId: 'edis/clients/demo-mosaic/bartow-site/orthomosaic_main',
      title: 'Bartow Construction Site - Orthomosaic Map',
      type: 'orthomosaic',
      format: 'jpg',
      size: '45MB',
      resolution: '2.5cm/pixel',
      coordinates: { lat: 27.8964, lng: -81.8317 }
    },
    aerialPhotos: [
      {
        publicId: 'edis/clients/demo-mosaic/bartow-site/aerial_001',
        title: 'Site Overview - North Perspective',
        type: 'aerial_photo',
        format: 'jpg'
      },
      {
        publicId: 'edis/clients/demo-mosaic/bartow-site/aerial_002', 
        title: 'Progress Documentation - East View',
        type: 'aerial_photo',
        format: 'jpg'
      }
    ],
    threeDModel: {
      publicId: 'edis/clients/demo-mosaic/bartow-site/3d_model_preview',
      title: '3D Site Model Preview',
      type: '3d_model',
      format: 'jpg', // Preview image of 3D model
      modelFile: 'edis/clients/demo-mosaic/bartow-site/site_model.ply'
    },
    reports: [
      {
        publicId: 'edis/clients/demo-mosaic/reports/site_analysis_report',
        title: 'Site Analysis Report',
        type: 'pdf',
        format: 'pdf',
        pages: 12
      }
    ]
  }
};

// Configuration for interactive features
export const INTERACTIVE_CONFIG = {
  // Map viewer settings
  mapViewer: {
    enableZoom: true,
    enableMeasurement: true,
    enableAnnotations: true,
    maxZoom: 20,
    enableDownload: true
  },
  
  // Gallery settings
  gallery: {
    thumbnailSize: 'thumbnail',
    lightboxSize: 'large',
    enableSlideshow: true,
    enableFullscreen: true
  },
  
  // 3D viewer settings (for model previews)
  threeDViewer: {
    previewSize: 'modelPreview',
    enableRotation: true,
    showMetadata: true
  }
};