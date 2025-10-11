# EDIS Cloudinary Setup - Upload Presets

## 🎯 **Next Step: Create Upload Presets**

You have your cloud name configured (`eastudios-dam`), now you need to create upload presets for the EDIS integration.

### **Required Upload Presets:**

Go to your Cloudinary Settings → Upload → Add upload preset:

#### 1. **edis_aerial_images** (For orthomosaics, drone photos)
```
Preset name: edis_aerial_images
Signing mode: Unsigned
Upload folder: edis/aerial
Max file size: 100000000 (100MB)
Allowed formats: jpg, jpeg, png, tiff
Tags: aerial, edis, orthomosaic
Eager transformations:
  - c_fill,w_300,h_200,q_auto,f_auto (thumbnail)
  - c_fit,w_800,h_600,q_auto,f_auto (medium)
```

#### 2. **edis_ground_docs** (For ground photography, 360° images)
```
Preset name: edis_ground_docs  
Signing mode: Unsigned
Upload folder: edis/ground
Max file size: 50000000 (50MB)
Allowed formats: jpg, jpeg, png
Tags: ground, documentation, edis
Eager transformations:
  - c_fill,w_300,h_200,q_auto,f_auto (thumbnail)
  - c_fit,w_800,h_600,q_auto,f_auto (medium)
```

#### 3. **edis_3d_models** (For point clouds, 3D models)
```
Preset name: edis_3d_models
Signing mode: Unsigned  
Upload folder: edis/3d-models
Max file size: 500000000 (500MB)
Allowed formats: jpg, png, ply, obj, stl, las
Tags: 3d, models, pointcloud, edis
```

#### 4. **edis_documents** (For PDF reports, documents)
```
Preset name: edis_documents
Signing mode: Unsigned
Upload folder: edis/documents  
Max file size: 50000000 (50MB)
Allowed formats: pdf, doc, docx, xls, xlsx
Tags: documents, reports, edis
```

#### 5. **edis_client_assets** (For client branding, logos)
```
Preset name: edis_client_assets
Signing mode: Unsigned
Upload folder: edis/clients
Max file size: 10000000 (10MB)
Allowed formats: jpg, jpeg, png, svg
Tags: client, branding, edis
```

### **Test Your Setup:**

Once presets are created:

1. **Open**: `dashboard-cloudinary.html` in browser
2. **Open**: `admin-cloudinary.html` in browser  
3. **Test uploads**: Try uploading through admin portal
4. **View delivery**: Check if images display in client portal

### **Using Your Existing 140 Images:**

Your existing images can be:
1. **Organized into folders**: Move to `edis/aerial/`, `edis/ground/`, etc.
2. **Used as demo content**: Perfect for testing the portal
3. **Tagged appropriately**: Add `aerial`, `ground`, `edis` tags

### **Folder Organization Example:**
```
eastudios-dam/
├── edis/
│   ├── aerial/
│   │   ├── orthomosaic_site1.jpg
│   │   ├── drone_inspection_001.jpg
│   │   └── progress_oct2025.jpg
│   ├── ground/
│   │   ├── site_reference_001.jpg
│   │   ├── 360_walkthrough.jpg
│   │   └── equipment_portrait.jpg
│   ├── 3d-models/
│   │   ├── site_pointcloud.ply
│   │   └── model_preview.jpg
│   ├── documents/
│   │   └── site_analysis_report.pdf
│   └── clients/
│       ├── demo-mosaic/
│       └── client-logos/
```

## 🎯 **You're 5 Minutes Away from Launch!**

Create those upload presets, and your EDIS portal will be fully functional with Cloudinary integration!