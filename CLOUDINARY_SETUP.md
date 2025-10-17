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