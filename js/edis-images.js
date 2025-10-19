/**
 * EDIS Website Images - Cloudinary Direct URLs
 * Upload images to your Cloudinary media library and update URLs below
 */

// Your Cloudinary base URL
const CLOUDINARY_BASE = 'https://res.cloudinary.com/c-dc04824f271ccdb280b7ef65e662c1';

// Website Images Configuration
const EDIS_IMAGES = {
  // Hero Section Background
  hero: {
    background: 'https://asset.cloudinary.com/eastudios-dam/fe890f57e7937c9d2c4e045bad64cfff',
    mobile: 'https://asset.cloudinary.com/eastudios-dam/fe890f57e7937c9d2c4e045bad64cfff',
    overlay: 'https://asset.cloudinary.com/eastudios-dam/fe890f57e7937c9d2c4e045bad64cfff'
  },

  // Service Section Images
  services: {
    aerial: `${CLOUDINARY_BASE}/image/upload/c_fill,w_600,h_400,q_auto,f_webp/v1/edis-website/service-aerial`,
    ground: `${CLOUDINARY_BASE}/image/upload/c_fill,w_600,h_400,q_auto,f_webp/v1/edis-website/service-ground`,
    mapping: `${CLOUDINARY_BASE}/image/upload/c_fill,w_600,h_400,q_auto,f_webp/v1/edis-website/service-mapping`,
    modeling: `${CLOUDINARY_BASE}/image/upload/c_fill,w_600,h_400,q_auto,f_webp/v1/edis-website/service-3d-modeling`
  },

  // Gallery/Portfolio Images
  portfolio: {
    project1: `${CLOUDINARY_BASE}/image/upload/c_fill,w_800,h_600,q_auto,f_webp/v1/edis-website/portfolio-construction-1`,
    project2: `${CLOUDINARY_BASE}/image/upload/c_fill,w_800,h_600,q_auto,f_webp/v1/edis-website/portfolio-industrial-1`,
    project3: `${CLOUDINARY_BASE}/image/upload/c_fill,w_800,h_600,q_auto,f_webp/v1/edis-website/portfolio-mapping-1`,
    project4: `${CLOUDINARY_BASE}/image/upload/c_fill,w_800,h_600,q_auto,f_webp/v1/edis-website/portfolio-drone-1`
  },

  // About Section
  about: {
    team: `${CLOUDINARY_BASE}/image/upload/c_fill,w_600,h_400,q_auto,f_webp/v1/edis-website/about-team`,
    equipment: `${CLOUDINARY_BASE}/image/upload/c_fill,w_600,h_400,q_auto,f_webp/v1/edis-website/about-equipment`
  },

  // Technology/Equipment Section
  technology: {
    drone1: `${CLOUDINARY_BASE}/image/upload/c_fill,w_400,h_300,q_auto,f_webp/v1/edis-website/tech-drone-1`,
    drone2: `${CLOUDINARY_BASE}/image/upload/c_fill,w_400,h_300,q_auto,f_webp/v1/edis-website/tech-drone-2`,
    camera: `${CLOUDINARY_BASE}/image/upload/c_fill,w_400,h_300,q_auto,f_webp/v1/edis-website/tech-camera`,
    lidar: `${CLOUDINARY_BASE}/image/upload/c_fill,w_400,h_300,q_auto,f_webp/v1/edis-website/tech-lidar`
  }
};

// Responsive Image Helper
function getResponsiveImage(baseUrl, sizes = { mobile: 400, tablet: 800, desktop: 1200 }) {
  return {
    mobile: baseUrl.replace(/w_\d+/, `w_${sizes.mobile}`),
    tablet: baseUrl.replace(/w_\d+/, `w_${sizes.tablet}`),
    desktop: baseUrl.replace(/w_\d+/, `w_${sizes.desktop}`),
    default: baseUrl
  };
}

// Image with Loading States
function createOptimizedImage(src, alt, className = '', lazy = true) {
  return `
    <img 
      src="${lazy ? src.replace('/upload/', '/upload/w_50,q_auto,f_auto/') : src}" 
      data-src="${src}"
      alt="${alt}" 
      class="${className} ${lazy ? 'lazy-load' : ''}"
      loading="${lazy ? 'lazy' : 'eager'}"
      onload="this.classList.add('loaded')"
      onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='"
    />
  `;
}

// Export for use in HTML
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EDIS_IMAGES, getResponsiveImage, createOptimizedImage };
}