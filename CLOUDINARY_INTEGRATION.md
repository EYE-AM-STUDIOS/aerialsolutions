# Cloudinary Integration for EDIS Portal

## Overview
This integration connects your EDIS portal with Cloudinary for professional media management, automatic optimization, and secure delivery of aerial imaging deliverables.

## Features
- 🚀 **Automatic Optimization**: Images converted to WebP, videos to optimized MP4
- 🔒 **Secure Downloads**: Time-limited, signed URLs for client access
- 📱 **Responsive Delivery**: Multiple sizes generated automatically
- 🎬 **Video Processing**: Automatic transcoding and thumbnail generation
- 📊 **Analytics**: Download tracking and access logs
- 💾 **Bulk Upload**: Efficient batch processing for large projects

## Setup Instructions

### 1. Cloudinary Account Setup
1. Log into your Cloudinary console: https://console.cloudinary.com
2. Get your credentials from the Dashboard:
   - Cloud Name: `c-dc04824f271ccdb280b7ef65e662c1`
   - API Key: (from your dashboard)
   - API Secret: (from your dashboard)

### 2. Environment Variables
Add to your `.env` file:
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=c-dc04824f271ccdb280b7ef65e662c1
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Optional: Custom domain for branded URLs
CLOUDINARY_SECURE_DISTRIBUTION=your-domain.com
```

### 3. Install Dependencies
```bash
npm install cloudinary multer multer-storage-cloudinary
```

### 4. Database Schema Updates
Add these columns to your existing `deliverables` table:
```sql
ALTER TABLE deliverables ADD COLUMN cloudinary_public_id VARCHAR(255);
ALTER TABLE deliverables ADD COLUMN cloudinary_url TEXT;
ALTER TABLE deliverables ADD COLUMN secure_url TEXT;
ALTER TABLE deliverables ADD COLUMN thumbnail_path TEXT;
ALTER TABLE deliverables ADD COLUMN download_count INT DEFAULT 0;
ALTER TABLE deliverables ADD COLUMN metadata JSON;
```

### 5. Server Integration
Add to your `server.js`:
```javascript
const cloudinaryIntegration = require('./cloudinary-integration');

// File upload routes
app.post('/api/upload/deliverable', 
    authenticateToken, 
    cloudinaryIntegration.upload.single('file'), 
    cloudinaryIntegration.uploadDeliverable
);

app.post('/api/upload/bulk', 
    authenticateToken, 
    cloudinaryIntegration.upload.array('files', 50), 
    cloudinaryIntegration.bulkUploadDeliverables
);

app.get('/api/client/:projectId/deliverables', 
    authenticateClientToken, 
    cloudinaryIntegration.getClientDeliverables
);

app.get('/api/download/:deliverableId', 
    authenticateClientToken, 
    cloudinaryIntegration.generateDownloadUrl
);
```

## File Organization Structure

Your Cloudinary media library will be organized as:
```
edis-portal/
├── project_001/
│   ├── image/
│   │   ├── aerial_001.jpg
│   │   └── ground_002.jpg
│   ├── map/
│   │   └── orthomosaic_001.tiff
│   ├── model/
│   │   └── 3d_model_001.glb
│   └── video/
│       └── drone_footage_001.mp4
└── project_002/
    └── ...
```

## Automatic Transformations

### Images (Aerial/Ground)
- **Full Resolution**: WebP format, quality auto:good
- **Thumbnails**: 400x300, cropped and optimized
- **Progressive Loading**: Automatic blur-to-sharp loading

### Maps/Orthomosaics
- **High Quality**: 2048px max, WebP format, quality auto:best
- **Optimized Delivery**: Automatic format selection based on browser

### Videos
- **Optimized Streaming**: H.264 encoding, auto quality
- **Thumbnails**: Generated at 10% timestamp
- **Multiple Formats**: MP4 primary, WebM fallback

### 3D Models
- **Preview Images**: 800x600 rendered previews
- **Optimized Delivery**: CDN-accelerated downloads

## Admin Upload Interface

Add this to your admin dashboard HTML:

```html
<!-- Upload Form -->
<form id="uploadForm" enctype="multipart/form-data" class="premium-form">
    <div class="form-group">
        <label for="projectSelect">Project</label>
        <select id="projectSelect" name="projectId" required class="premium-select">
            <!-- Populated dynamically -->
        </select>
    </div>
    
    <div class="form-group">
        <label for="typeSelect">Deliverable Type</label>
        <select id="typeSelect" name="type" required class="premium-select">
            <option value="image">Images</option>
            <option value="map">Maps/Orthomosaics</option>
            <option value="model">3D Models</option>
            <option value="video">Videos</option>
            <option value="report">Reports</option>
        </select>
    </div>
    
    <div class="form-group">
        <label for="categoryInput">Category</label>
        <input type="text" id="categoryInput" name="category" 
               placeholder="e.g., Raw Images, Final Deliverables" class="premium-input">
    </div>
    
    <div class="form-group">
        <label for="fileInput">Files</label>
        <input type="file" id="fileInput" name="files" multiple 
               accept="image/*,video/*,.pdf,.zip,.glb,.obj,.ply" class="premium-file-input">
        <div class="file-preview" id="filePreview"></div>
    </div>
    
    <button type="submit" class="premium-btn primary">
        <i class="fas fa-cloud-upload-alt"></i>
        Upload Deliverables
    </button>
</form>

<!-- Upload Progress -->
<div id="uploadProgress" class="upload-progress" style="display: none;">
    <div class="progress-bar">
        <div class="progress-fill"></div>
    </div>
    <div class="progress-text">Uploading... 0%</div>
</div>
```

## Client Portal Integration

Add this JavaScript to your `dashboard.html`:

```javascript
// Enhanced deliverables loading with Cloudinary optimization
async function loadDeliverables() {
    try {
        const response = await fetch('/api/client/' + PROJECT_ID + '/deliverables', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('clientToken')
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayOptimizedDeliverables(data.deliverables);
        }
    } catch (error) {
        console.error('Error loading deliverables:', error);
    }
}

function displayOptimizedDeliverables(deliverables) {
    const container = document.getElementById('deliverablesGrid');
    
    container.innerHTML = deliverables.map(deliverable => `
        <div class="deliverable-card" data-type="${deliverable.type}">
            ${deliverable.urls.preview ? `
                <div class="deliverable-preview">
                    <img src="${deliverable.urls.preview}" 
                         alt="${deliverable.filename}"
                         loading="lazy"
                         onclick="openDeliverableModal('${deliverable.id}')">
                </div>
            ` : `
                <div class="deliverable-icon">
                    <i class="fas fa-${getFileIcon(deliverable.type)}"></i>
                </div>
            `}
            
            <div class="deliverable-info">
                <h4>${deliverable.filename}</h4>
                <p class="deliverable-type">${deliverable.type.toUpperCase()}</p>
                <p class="deliverable-size">${formatFileSize(deliverable.file_size)}</p>
                <p class="deliverable-date">${formatDate(deliverable.upload_date)}</p>
            </div>
            
            <div class="deliverable-actions">
                <button onclick="previewDeliverable('${deliverable.id}')" class="action-btn preview">
                    <i class="fas fa-eye"></i> Preview
                </button>
                <button onclick="downloadDeliverable('${deliverable.id}')" class="action-btn download">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `).join('');
}

// Secure download with tracking
async function downloadDeliverable(deliverableId) {
    try {
        const response = await fetch('/api/download/' + deliverableId, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('clientToken')
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Create temporary download link
            const link = document.createElement('a');
            link.href = data.downloadUrl;
            link.download = data.filename;
            link.click();
        }
    } catch (error) {
        console.error('Download error:', error);
    }
}
```

## API Endpoints

### Upload Deliverable
```
POST /api/upload/deliverable
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

Body:
- file: File
- projectId: String
- type: String (image|map|model|video|report)
- category: String (optional)
- description: String (optional)
```

### Bulk Upload
```
POST /api/upload/bulk
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

Body:
- files: File[] (max 50)
- projectId: String
- type: String
- category: String (optional)
```

### Get Client Deliverables
```
GET /api/client/:projectId/deliverables
Authorization: Bearer <client_token>

Response: {
  success: true,
  deliverables: [...],
  total: number
}
```

### Generate Download URL
```
GET /api/download/:deliverableId
Authorization: Bearer <client_token>

Response: {
  success: true,
  downloadUrl: string,
  filename: string,
  expiresIn: number
}
```

## Cloudinary Dashboard Features

### Folders & Organization
- Automatic folder creation per project
- Type-based sub-folders (image, map, model, video)
- Searchable metadata and tags

### Transformations & Optimization
- Automatic WebP conversion for modern browsers
- Progressive JPEG for legacy support
- Video transcoding for universal playback
- Responsive image delivery

### Analytics & Insights
- Download statistics
- Bandwidth usage tracking
- Popular content analysis
- Geographic delivery data

## Best Practices

### File Naming
- Use consistent naming: `type_project_sequence.ext`
- Include date stamps for chronological sorting
- Use descriptive categories for easy filtering

### Storage Organization
- Group related files in project folders
- Use consistent type categorization
- Add metadata for searchability

### Performance Optimization
- Lazy load images in client portal
- Use progressive enhancement
- Implement caching strategies
- Monitor bandwidth usage

### Security Considerations
- Use signed URLs for sensitive content
- Implement access logging
- Set appropriate expiration times
- Regular security audits

## Troubleshooting

### Common Issues

**Upload Failures**
- Check file size limits (500MB max)
- Verify Cloudinary credentials
- Ensure proper file types

**Slow Loading**
- Enable auto-optimization
- Use progressive loading
- Check CDN configuration

**Access Denied**
- Verify JWT tokens
- Check project permissions
- Confirm client access rights

### Monitoring
```javascript
// Add to your server for monitoring
app.get('/api/admin/cloudinary/stats', authenticateToken, async (req, res) => {
    try {
        const usage = await cloudinary.api.usage();
        res.json({
            bandwidth: usage.bandwidth,
            storage: usage.storage,
            requests: usage.requests,
            transformations: usage.transformations
        });
    } catch (error) {
        res.status(500).json({ error: 'Stats unavailable' });
    }
});
```

## Cost Optimization

### Free Tier Limits
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

### Optimization Strategies
- Use auto-quality for size reduction
- Implement responsive breakpoints
- Cache transformed images
- Monitor usage regularly

---

Your Cloudinary integration is now ready! This setup provides professional-grade media management with automatic optimization, secure delivery, and comprehensive tracking for your EDIS portal.