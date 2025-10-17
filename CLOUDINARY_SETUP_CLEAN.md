# Cloudinary Setup for EDIS - Aerial & Ground-Based Imaging

This guide will help you set up Cloudinary to manage images for both **Aerial Imaging** (drone-based) and **Ground-Based Imaging** (traditional photography) services in your EDIS dashboard.

## Overview

EDIS supports two main service types:
- **Aerial Imaging**: Drone photography, orthomosaics, 3D mapping, progress monitoring
- **Ground-Based Imaging**: Traditional photography, equipment documentation, site surveys

## Prerequisites

1. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com) (free tier provides 25GB storage, 25GB bandwidth/month)
2. **Node.js**: Version 14 or higher installed on your system
3. **Git**: For cloning the repository

## Step 1: Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Add your Cloudinary credentials to `.env`:
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

## Step 2: Install Dependencies

```bash
npm install
```

This will install the Cloudinary SDK and other required packages.

## Step 3: Upload Images by Service Type

### Option A: Upload Aerial Images
```bash
npm run cloudinary:upload-aerial
```

### Option B: Upload Ground-Based Images  
```bash
npm run cloudinary:upload-ground
```

### Option C: Upload All Images (Auto-Detect Service Type)
```bash
npm run cloudinary:upload-all
```

## Step 4: Using the Enhanced Dashboard

1. Open `dashboard-cloudinary-clean.html` in your browser
2. Use the service type filter to switch between:
   - **All Services**: Show both aerial and ground images
   - **Aerial Services**: Drone photography, orthomosaics, 3D mapping
   - **Ground Services**: Traditional photography, equipment docs

## Image Organization

### Service Type Classification

Images are automatically organized by service type:

```
cloudinary_folder_structure/
├── aerial/
│   ├── orthomosaic/
│   ├── drone-photography/
│   ├── 3d-mapping/
│   └── progress-monitoring/
└── ground/
    ├── traditional-photography/
    ├── equipment-documentation/
    └── site-survey/
```

### Automatic Transformations

Different transformations are applied based on service type:

**Aerial Service Presets:**
- `aerial_thumb`: 300x200 thumbnails for drone images
- `aerial_preview`: 800x600 previews with quality optimization
- `orthomosaic_full`: Full resolution for detailed mapping

**Ground Service Presets:**
- `ground_thumb`: 250x250 square thumbnails
- `ground_preview`: 600x400 standard previews  
- `equipment_full`: Full resolution for equipment documentation

## Monitoring Usage (Free Tier)

Keep track of your Cloudinary usage to stay within the free tier limits:

```bash
# Check current usage
npm run cloudinary:usage

# Brief usage summary
npm run cloudinary:usage:brief
```

### Free Tier Limits:
- **Storage**: 25GB
- **Bandwidth**: 25GB/month  
- **Transformations**: 25,000/month
- **Uploads**: 1,000/month

## Service Type Examples

### Aerial Imaging Use Cases:
- Construction progress monitoring
- Agricultural surveys
- Real estate photography
- Infrastructure inspection
- Event coverage from above

### Ground-Based Imaging Use Cases:
- Equipment documentation
- Interior photography
- Product photography
- Portrait sessions
- Close-up detail work

## Troubleshooting

### Common Issues:

1. **Upload fails**: Check your API credentials in `.env`
2. **Service type not detected**: Ensure folder structure follows naming conventions
3. **Free tier exceeded**: Use `npm run cloudinary:usage` to monitor limits

### Getting Help:

- Review the `CLOUDINARY_FREE_TIER.md` for optimization tips
- Check logs in the terminal during upload processes
- Verify image file paths and formats are supported

## Next Steps

1. Test uploads with both service types
2. Customize transformations for your specific needs
3. Set up automated monitoring for usage limits
4. Consider upgrading to paid plan when needed

For more detailed information on optimizing for the free tier, see `CLOUDINARY_FREE_TIER.md`.