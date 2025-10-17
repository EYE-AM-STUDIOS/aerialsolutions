# 🆓 EAS Cloudinary Free Tier Setup Guide

## Free Tier Limits & Optimization

### Current Free Tier (October 2025)
- ✅ **25GB Storage** - Enough for ~2,500-5,000 high-res aerial photos
- ✅ **25GB Bandwidth/month** - Supports ~100-200 client visits/month
- ✅ **25,000 Transformations/month** - Sufficient for active usage
- ✅ **1,000 Uploads/month** - Perfect for small-medium operations

### 💡 Optimization Strategies

#### 1. **Smart Compression Settings**
```javascript
// Optimized for free tier - maximum compression
const freetierPresets = {
    thumb: 'w_300,h_200,c_fill,f_auto,q_auto:low',     // Smaller thumbs
    preview: 'w_800,h_533,c_fill,f_auto,q_auto:eco',   // Eco quality
    large: 'w_1200,h_800,c_fill,f_auto,q_auto:eco',    // Eco quality
    download: 'w_1600,c_limit,f_auto,q_80'             // 80% quality max
};
```

#### 2. **Selective Upload Strategy**
- Upload only **final processed images** (not RAW files)
- Use **local storage** for backups and originals
- Upload **customer-facing deliverables** only

#### 3. **Bandwidth Conservation**
- Implement **lazy loading**
- Use **progressive JPEG**
- Cache images aggressively
- Minimize unnecessary transformations

## 🚀 Free Tier Setup

### 1. Create Optimized Upload Presets

In your Cloudinary dashboard, create these presets:

#### Preset: `eas-free-tier` (Unsigned)
```json
{
  "name": "eas-free-tier",
  "unsigned": true,
  "folder": "eas-clients",
  "tags": "aerial,eas-portal",
  "format": "auto",
  "quality": "auto:eco",
  "allowed_formats": ["jpg", "png"],
  "max_file_size": 10485760,
  "transformation": [
    {"width": 1600, "height": 1067, "crop": "limit"},
    {"quality": "auto:eco"},
    {"format": "auto"}
  ]
}
```

### 2. Update Environment Configuration

```bash
# .env.local - Free tier optimized
CLOUDINARY_CLOUD_NAME=your-free-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=eas-free-tier

# Free tier flags
CLOUDINARY_FREE_TIER=true
CLOUDINARY_MAX_FILE_SIZE=10485760
CLOUDINARY_QUALITY=auto:eco
```

### 3. Recommended Workflow

#### For Client Projects:
1. **Capture** → Process locally → **Upload final 5-10 best images**
2. **Store originals** locally/external drive
3. **Upload to Cloudinary** only customer deliverables
4. **Use local files** for internal processing/backup

#### Monthly Budget Planning:
- **Small project** (5-10 images): ~50MB storage, 500MB bandwidth
- **Medium project** (15-20 images): ~150MB storage, 1.5GB bandwidth
- **Can handle**: 10-15 projects/month comfortably

## 💰 Cost-Effective Usage Patterns

### Upload Strategy
```javascript
// Free tier optimized upload
const freetierUpload = {
    // Compress before upload
    quality: 'auto:eco',
    format: 'auto',
    
    // Limit dimensions
    width: 1600,
    height: 1067,
    crop: 'limit',
    
    // No eager transformations (save transformation credits)
    eager: null,
    
    // Essential metadata only
    context: {
        project: clientId,
        date: new Date().toISOString().split('T')[0] // Date only
    }
};
```

### Transformation Strategy
```javascript
// Minimize transformations - use base sizes
const baseUrls = {
    thumb: `w_300,h_200,c_fill,f_auto,q_auto:low`,
    medium: `w_800,h_533,c_fill,f_auto,q_auto:eco`, 
    large: `f_auto,q_auto:eco` // No resize = no extra transformation
};
```

## 🛠️ Updated Helper Functions

Let me update the Cloudinary helpers for free tier optimization: