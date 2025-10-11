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