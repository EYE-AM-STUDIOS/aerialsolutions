<<<<<<< HEAD
# 🌥️ EAS Cloudinary Integration Guide

This document provides comprehensive instructions for integrating Cloudinary with your EAS Aerial Imaging Portal.

## 🚀 Quick Start

### 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account
2. Navigate to your Dashboard to get your credentials:
   - **Cloud Name**: `your-cloud-name`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdef123456789_example`

### 2. Configure Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
CLOUDINARY_UPLOAD_PRESET=eas-aerial-images
```

### 3. Set Up Upload Presets (Cloudinary Dashboard)

In your Cloudinary console, create upload presets:

#### Preset: `eas-aerial-images`
- **Upload preset name**: `eas-aerial-images`
- **Signing mode**: Unsigned (for client-side uploads)
- **Folder**: `eas-clients`
- **Tags**: `aerial, eas-portal`
- **Transformations**:
  - Automatic quality: `q_auto:eco`
  - Automatic format: `f_auto`
  - Maximum dimensions: `w_2400,h_1600,c_limit`

#### Preset: `eas-signed-upload` (for admin uploads)
- **Upload preset name**: `eas-signed-upload`  
- **Signing mode**: Signed
- **Folder**: `eas-clients`
- **Allowed formats**: `jpg,png,tiff,raw,dng`
- **Max file size**: 50MB

## 📁 Folder Structure in Cloudinary

```
your-cloud-name/
└── eas-clients/
    ├── demo-mosaic/
    │   ├── aerial-overview
    │   ├── aerial-progress-north
    │   └── aerial-progress-south
    ├── acme-construction/
    │   ├── site-overview
    │   └── foundation-progress
    └── sunset-development/
        ├── pre-construction
        └── phase1-complete
```

## 🛠️ Usage Examples

### Command Line Upload

```bash
# Install Cloudinary CLI (optional)
npm install -g cloudinary-cli

# Set environment variables
export CLOUDINARY_CLOUD_NAME=your-cloud-name
export CLOUDINARY_API_KEY=your-api-key
export CLOUDINARY_API_SECRET=your-api-secret

# Upload single client
npm run cloudinary:upload demo-mosaic

# Upload all clients
npm run cloudinary:upload-all

# List client images
npm run cloudinary:list demo-mosaic

# Delete client images (careful!)
npm run cloudinary:delete demo-mosaic
```

### Programmatic Upload (Node.js)

```javascript
const cloudinary = require('cloudinary').v2;

// Configure
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload with metadata
const result = await cloudinary.uploader.upload('./aerial-image.jpg', {
    public_id: 'eas-clients/demo-mosaic/aerial-overview',
    tags: ['aerial', 'construction', 'demo-mosaic'],
    context: {
        project: 'demo-mosaic',
        pilot: 'John Smith',
        equipment: 'DJI Mavic 3 Pro',
        altitude: '250ft AGL',
        date: '2025-10-17'
    }
});

console.log('Uploaded:', result.secure_url);
```

### Client-Side Upload Widget

```html
<!-- Include Cloudinary upload widget -->
<script src="https://upload-widget.cloudinary.com/global/all.js"></script>

<script>
// Initialize upload widget
const widget = cloudinary.createUploadWidget({
    cloudName: 'your-cloud-name',
    uploadPreset: 'eas-aerial-images',
    folder: 'eas-clients/demo-mosaic',
    sources: ['local', 'camera'],
    multiple: true,
    maxFiles: 10,
    maxFileSize: 52428800, // 50MB
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'tiff'],
    tags: ['aerial', 'construction'],
    context: {
        project: 'demo-mosaic',
        date: new Date().toISOString()
    }
}, (error, result) => {
    if (!error && result && result.event === "success") {
        console.log('Upload successful:', result.info);
        // Refresh gallery or update UI
    }
});

// Open widget
document.getElementById('upload-btn').addEventListener('click', () => {
    widget.open();
});
</script>
```

## 🎨 Image Transformations

### URL-Based Transformations

```javascript
// Using the CloudinaryHelpers class
const cloudinary = new CloudinaryHelpers('your-cloud-name');

// Different sizes
const thumb = cloudinary.getImageUrl('eas-clients/demo-mosaic/aerial-overview', 'thumb');
// Result: https://res.cloudinary.com/your-cloud-name/image/upload/w_400,h_267,c_fill,f_auto,q_auto:good/eas-clients/demo-mosaic/aerial-overview

const fullRes = cloudinary.getImageUrl('eas-clients/demo-mosaic/aerial-overview', 'full');
// Result: https://res.cloudinary.com/your-cloud-name/image/upload/f_auto,q_auto:eco/eas-clients/demo-mosaic/aerial-overview

// With watermark
const watermarked = cloudinary.getImageUrl('eas-clients/demo-mosaic/aerial-overview', 'large', {
    watermark: true
});

// With custom overlay
const overlayed = cloudinary.getImageUrl('eas-clients/demo-mosaic/aerial-overview', 'medium', {
    overlay: 'Property of EAS'
});
```

### Advanced Transformations

```javascript
// Aerial-specific optimizations
const aerialOptimized = 'w_1600,h_1067,c_fill,f_auto,q_auto:eco,e_sharpen:60,e_vibrance:20';

// Orthomosaic map (preserve aspect ratio)
const mapOptimized = 'w_3000,c_limit,f_auto,q_auto:best,e_sharpen:40';

// Mobile-friendly
const mobileOptimized = 'w_800,h_600,c_fill,f_auto,q_auto:good,dpr_auto';
```

## 🔧 Dashboard Integration

### Update Existing Dashboard

Replace the image loading function in `dashboard.html`:

```javascript
async function getProjectImages(projectId) {
    try {
        // Load from Cloudinary instead of local files
        const response = await fetch(`./clients/${projectId}/images/cloudinary-index.json`);
        const config = await response.json();
        
        return config.items.map(item => ({
            name: item.name,
            src: cloudinary.getImageUrl(item.publicId, 'large'),
            thumb: cloudinary.getImageUrl(item.publicId, 'thumb'),
            alt: item.alt,
            caption: item.caption,
            publicId: item.publicId // Store for download/sharing
        }));
    } catch (error) {
        console.error('Failed to load Cloudinary images:', error);
        return []; // Fallback to empty array
    }
}
```

### Use Cloudinary Dashboard

Simply open `dashboard-cloudinary.html` which includes full Cloudinary integration:

```bash
# Start local server
npm run dev

# Open Cloudinary dashboard
open http://localhost:8000/dashboard-cloudinary.html
```

## 📊 Benefits for Aerial Imaging

### 1. **Automatic Optimization**
- WebP/AVIF format conversion for 40-80% smaller files
- Responsive image delivery based on device
- Progressive JPEG for faster loading

### 2. **Advanced Features**
- **Auto-crop**: AI-powered smart cropping
- **Object detection**: Identify buildings, vehicles, equipment
- **Quality analysis**: Automatic blur/quality detection
- **Background removal**: For equipment/drone isolation

### 3. **Performance**
- Global CDN with 200+ locations
- Automatic caching and compression
- Lazy loading support
- Bandwidth optimization

### 4. **Workflow Integration**
- Direct upload from drone software
- Batch processing and tagging
- Metadata preservation (GPS, camera settings)
- Team collaboration features

## 🔒 Security & Access Control

### Upload Security

```javascript
// Signed uploads for admin/pilot uploads
const signedUpload = await cloudinary.uploader.upload('image.jpg', {
    signature: cloudinary.utils.api_sign_request(params, api_secret),
    api_key: api_key,
    // ... other params
});

// Unsigned uploads for client access (with restrictions)
const unsignedUpload = await cloudinary.uploader.upload('image.jpg', {
    upload_preset: 'eas_client_upload', // Preset with restrictions
    // No API secret needed
});
```

### Access Control

```javascript
// Generate private download URLs
const privateUrl = cloudinary.utils.private_download_url(
    'eas-clients/demo-mosaic/aerial-overview',
    'jpg',
    {
        expires_at: Math.round((Date.now() + 24 * 60 * 60 * 1000) / 1000) // 24 hours
    }
);
```

## 💰 Pricing Considerations

### Free Tier Limits
- **Storage**: 25GB
- **Bandwidth**: 25GB/month  
- **Transformations**: 25,000/month
- **Images**: 1,000 uploads/month

### Recommended Plans for Aerial Business
- **Plus Plan** ($99/month): 100GB storage, 100GB bandwidth
- **Advanced Plan** ($224/month): 500GB storage, 500GB bandwidth
- **Custom Plans**: For high-volume operations

### Cost Optimization
1. Use `q_auto:eco` for smaller file sizes
2. Implement progressive loading
3. Set up automatic cleanup of old images
4. Use eager transformations sparingly

## 🚀 Deployment

### Vercel Deployment

The Cloudinary integration works seamlessly with Vercel:

```bash
# Set environment variables in Vercel
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY  
vercel env add CLOUDINARY_API_SECRET

# Deploy
npm run deploy
```

### Environment Variables for Production

```bash
# Production Cloudinary config
CLOUDINARY_CLOUD_NAME=eas-production
CLOUDINARY_API_KEY=your-prod-key
CLOUDINARY_API_SECRET=your-prod-secret
CLOUDINARY_UPLOAD_PRESET=eas-production-preset

# Optional: Different folder structure
CLOUDINARY_BASE_FOLDER=eas-prod-clients
```

## 🛠️ Troubleshooting

### Common Issues

1. **Upload failing**: Check API credentials and upload preset
2. **Images not loading**: Verify public_id format and transformations
3. **Slow loading**: Implement progressive loading and proper image sizes
4. **CORS errors**: Configure allowed origins in Cloudinary settings

### Debug Commands

```bash
# Test Cloudinary connection
node -e "
const cloudinary = require('cloudinary').v2;
cloudinary.config({cloud_name: 'your-cloud-name', api_key: 'your-key', api_secret: 'your-secret'});
cloudinary.api.ping().then(console.log).catch(console.error);
"

# List all resources
npm run cloudinary:list demo-mosaic

# Check upload preset
curl "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload_presets"
```

## 📚 Next Steps

1. **Set up your Cloudinary account**
2. **Configure upload presets** 
3. **Upload sample images** using the CLI tool
4. **Test the Cloudinary dashboard** at `/dashboard-cloudinary.html`
5. **Integrate with your existing workflow**
6. **Set up automated uploads** from drone software
7. **Configure team access** and permissions

## 🔗 Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload Widget Guide](https://cloudinary.com/documentation/upload_widget)
- [Transformation Reference](https://cloudinary.com/documentation/transformation_reference)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)

---

For questions or support with the EAS Cloudinary integration, contact the development team.
=======
# EDIS Cloudinary Integration Guide

## Overview
This integration adds Cloudinary-powered media management to your EDIS client and admin portals, providing optimized delivery, dynamic transformations, and seamless upload capabilities for aerial imagery and project deliverables.

## Quick Start

### 1. Get Cloudinary Account
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Note your **Cloud Name** from the dashboard
3. Create upload presets (see section below)

### 2. Configure Your Cloud Name
Edit `config/cloudinary.js` and replace `'edis-imaging'` with your actual cloud name:

```javascript
export const CLOUDINARY_CONFIG = {
  cloudName: 'your-actual-cloud-name', // Replace this!
  // ... rest of config
};
```

### 3. Create Upload Presets
In your Cloudinary dashboard, create these upload presets:

| Preset Name | Usage | Settings |
|-------------|-------|----------|
| `edis_aerial_images` | Orthomosaics, aerial photos | Large file support, auto-optimize |
| `edis_3d_models` | 3D models, point clouds | Raw file support, large uploads |
| `edis_ground_docs` | Ground documentation | Standard image optimization |
| `edis_client_assets` | Client branding | Secure, restricted access |
| `edis_documents` | PDFs, reports | Raw file support, document handling |

### 4. Access the Portals

**Client Portal (Cloudinary-powered):**
- File: `dashboard-cloudinary.html`
- Features: Interactive maps, image galleries, optimized delivery

**Admin Portal (Cloudinary management):**
- File: `admin-cloudinary.html`  
- Features: Upload widgets, file management, transformations

## Features Breakdown

### Client Portal Features
- ✅ **Interactive Orthomosaic Viewer** - Zoom, pan, measure tools
- ✅ **Optimized Image Gallery** - Auto-responsive, lazy loading
- ✅ **3D Model Previews** - Preview images with download links
- ✅ **Progressive Loading** - Fast initial load, high-res on demand
- ✅ **Mobile Optimized** - Automatic device optimization
- ✅ **Download Management** - Secure access to full-resolution files

### Admin Portal Features
- ✅ **Drag & Drop Upload** - Multiple file types, organized by preset
- ✅ **File Management** - Filter, search, organize by client/project
- ✅ **Dynamic Transformations** - Real-time image optimization
- ✅ **Client Assignment** - Assign uploaded files to specific projects
- ✅ **Analytics Dashboard** - Usage tracking and optimization insights
- ✅ **Bulk Operations** - Mass optimization and organization tools

## Upload Presets Configuration

### Aerial Images Preset (`edis_aerial_images`)
```json
{
  "unsigned": true,
  "resource_type": "auto",
  "allowed_formats": ["jpg", "jpeg", "png", "tiff"],
  "max_file_size": 100000000,
  "eager": [
    { "width": 300, "height": 200, "crop": "fill", "quality": "auto", "format": "auto" },
    { "width": 800, "height": 600, "crop": "fit", "quality": "auto", "format": "auto" }
  ],
  "folder": "edis/aerial",
  "tags": ["aerial", "edis", "orthomosaic"]
}
```

### 3D Models Preset (`edis_3d_models`)
```json
{
  "unsigned": true,
  "resource_type": "auto",
  "allowed_formats": ["jpg", "png", "ply", "obj", "stl", "las"],
  "max_file_size": 500000000,
  "folder": "edis/3d-models",
  "tags": ["3d", "model", "edis"]
}
```

### Documents Preset (`edis_documents`)
```json
{
  "unsigned": true,
  "resource_type": "auto", 
  "allowed_formats": ["pdf", "doc", "docx", "xls", "xlsx"],
  "max_file_size": 50000000,
  "folder": "edis/documents",
  "tags": ["document", "report", "edis"]
}
```

## Transformation Examples

### Responsive Orthomosaic Display
```javascript
// Thumbnail for gallery
const thumbnail = CloudinaryHelpers.getImageUrl(publicId, 'c_fill,w_300,h_200,q_auto,f_auto');

// Full-screen viewing
const fullscreen = CloudinaryHelpers.getImageUrl(publicId, 'c_fit,w_1920,h_1080,q_90,f_auto');

// Mobile optimized
const mobile = CloudinaryHelpers.getImageUrl(publicId, 'c_fit,w_400,h_300,q_auto,f_auto');
```

### Watermarked Preview
```javascript
const preview = CloudinaryHelpers.getImageUrl(publicId, 'l_text:Arial_30:EDIS%20Preview,co_white,o_60');
```

## Folder Structure

Recommended Cloudinary folder organization:
```
edis/
├── clients/
│   ├── demo-mosaic/
│   │   ├── bartow-site/
│   │   │   ├── orthomosaic_main.jpg
│   │   │   ├── aerial_001.jpg
│   │   │   └── 3d_model.ply
│   │   └── reports/
│   │       └── site_analysis.pdf
│   ├── tampa-industrial/
│   └── orlando-dev/
├── templates/
│   ├── logos/
│   └── watermarks/
└── system/
    ├── backgrounds/
    └── ui-assets/
```

## Advanced Features

### Auto-Optimization
All images are automatically optimized with:
- **f_auto**: Best format selection (WebP, AVIF when supported)
- **q_auto**: Intelligent quality optimization
- **dpr_auto**: Automatic device pixel ratio handling

### Progressive Loading
Large orthomosaics load progressively:
1. **Thumbnail**: Instant load (< 50KB)
2. **Medium**: Fast preview (< 500KB)  
3. **Full**: High-resolution on demand

### CDN Delivery
Global CDN ensures fast delivery:
- **50+ Edge Locations** worldwide
- **Automatic Caching** with smart invalidation
- **HTTP/2 & HTTP/3** support for faster loading

## Integration with Existing Portal

To integrate with your existing `dashboard.html` and `admin-dashboard.html`:

### 1. Add Cloudinary SDK
```html
<script src="https://upload-widget.cloudinary.com/global/all.js"></script>
<script src="https://unpkg.com/cloudinary-core/cloudinary-core-shrinkwrap.min.js"></script>
```

### 2. Import Configuration
```javascript
import { CLOUDINARY_CONFIG, CloudinaryHelpers } from './config/cloudinary.js';
```

### 3. Replace Image Sources
```javascript
// Before
const imageUrl = './images/aerial-photo.jpg';

// After  
const imageUrl = CloudinaryHelpers.getImageUrl('edis/clients/demo/aerial_001', 'medium');
```

## Cost Optimization

### Free Tier Limits
- **25 GB** storage
- **25 GB** monthly bandwidth
- **25,000** transformations/month

### Optimization Tips
1. **Use transformations wisely** - Cache frequently used sizes
2. **Implement lazy loading** - Only load images when needed
3. **Choose appropriate quality** - q_auto for most uses
4. **Leverage CDN caching** - Set appropriate cache headers

## Security Considerations

### Upload Security
- Use **signed uploads** for production
- Implement **folder restrictions** by client
- Set **file size limits** per project type
- Enable **virus scanning** for uploads

### Access Control
- Use **authenticated URLs** for sensitive content
- Implement **time-limited access** for downloads
- Set **IP restrictions** if needed
- Enable **audit logging**

## Monitoring & Analytics

Track these key metrics:
- **Bandwidth usage** by client
- **Storage growth** over time
- **Popular transformations**
- **Geographic delivery patterns**
- **Performance metrics** (load times, CDN hit rates)

## Troubleshooting

### Common Issues

**Upload Widget Not Opening:**
- Check cloud name configuration
- Verify upload preset exists
- Check console for JavaScript errors

**Images Not Loading:**
- Verify public_id format
- Check transformation syntax
- Ensure files exist in Cloudinary

**Slow Loading:**
- Use appropriate transformation sizes
- Implement progressive loading
- Check CDN cache hit rates

### Debug Mode
Enable debug logging:
```javascript
const cl = cloudinary.Cloudinary.new({
  cloud_name: CLOUDINARY_CONFIG.cloudName,
  secure: true,
  debug: true // Add this for debugging
});
```

## Support

- **Cloudinary Documentation**: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **EDIS Support**: Contact your development team
- **Community**: Cloudinary community forums

---

**Ready to go live?** Just update your cloud name and upload presets, then your EDIS portal will have enterprise-grade media management powered by Cloudinary! 🚀
>>>>>>> 207c6df71a29863d0fa8728212b6dfe66361f7a6
