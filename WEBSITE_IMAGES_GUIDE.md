# Adding Images to Your EDIS Website with Cloudinary

## 🚀 **Quick Start Guide**

### **Method 1: Upload via Cloudinary Console (Recommended for Website Images)**

1. **Go to your Cloudinary Console**: https://console.cloudinary.com/app/c-dc04824f271ccdb280b7ef65e662c1

2. **Create Website Folder Structure**:
   ```
   edis-website/
   ├── hero-aerial-bg (main hero background)
   ├── hero-overlay (optional overlay image)
   ├── service-aerial
   ├── service-ground
   ├── service-mapping
   ├── service-3d-modeling
   ├── portfolio-construction-1
   ├── portfolio-industrial-1
   ├── portfolio-mapping-1
   ├── portfolio-drone-1
   ├── about-team
   ├── about-equipment
   ├── tech-drone-1
   ├── tech-drone-2
   ├── tech-camera
   └── tech-lidar
   ```

3. **Upload Your Images**:
   - Click "Upload" in your media library
   - Drag & drop your images
   - Rename them to match the structure above
   - Add to folder: `edis-website`

4. **Images Are Ready!** - The website will automatically use optimized versions

## 📸 **Recommended Image Sizes**

### **Hero Background**
- **Size**: 1920x1080 or larger
- **Type**: Aerial shot, construction site, drone in action
- **Style**: High contrast, professional, dramatic

### **Service Images** (600x400)
- **Aerial**: Drone in flight, aerial construction view
- **Ground**: Ground-level equipment, surveying
- **Mapping**: Orthomosaic maps, survey data
- **3D Modeling**: 3D visualizations, point clouds

### **Portfolio Images** (800x600)
- **Construction Projects**: Before/after, progress shots
- **Industrial Sites**: Facilities, infrastructure
- **Mapping Results**: Completed maps, surveys
- **Drone Footage**: Action shots, equipment

### **Technology Images** (400x300)
- **Equipment**: Drones, cameras, sensors
- **In Action**: Team working, equipment deployed

## 🎨 **Image Optimization (Automatic)**

Your images will be automatically:
- ✅ **Converted to WebP** for faster loading
- ✅ **Optimized for quality** with `q_auto`
- ✅ **Resized responsively** for different devices
- ✅ **Lazy loaded** for better performance
- ✅ **Progressive enhanced** with loading states

## 🔄 **Easy Updates**

### **To Replace an Image**:
1. Upload new image to Cloudinary
2. Rename to match existing image name
3. Website updates automatically!

### **To Add New Images**:
1. Update `js/edis-images.js` with new image URLs
2. Add image containers to HTML
3. Upload images to Cloudinary

## 📱 **What You Get**

### **Hero Section**
- Stunning aerial background image
- Professional overlay effects
- Responsive across all devices

### **Service Cards**
- Visual representation of each service
- Hover effects and animations
- Optimized loading

### **Portfolio Gallery**
- Showcase your best work
- Lightbox viewing
- Professional presentation

### **Technology Section**
- Equipment and capability highlights
- Interactive image cards
- Technical credibility

## 🛠 **Advanced: Using the Upload API**

If you want to programmatically upload images:

```javascript
// Upload via API (requires API key)
const formData = new FormData();
formData.append('file', imageFile);
formData.append('upload_preset', 'edis-website');
formData.append('folder', 'edis-website');

fetch('https://api.cloudinary.com/v1_1/c-dc04824f271ccdb280b7ef65e662c1/image/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Image uploaded:', data.secure_url);
});
```

## 🎯 **Next Steps**

1. **Upload Hero Image**: Start with one stunning aerial shot for the hero background
2. **Add Service Images**: 4 images showcasing your capabilities
3. **Portfolio Shots**: 6-8 of your best project images
4. **Equipment Photos**: Show your professional gear

## 💡 **Pro Tips**

### **Image Selection**
- Use high-contrast images with clear subjects
- Ensure images align with your brand colors (blues, cyans)
- Include human elements for scale and relatability
- Show variety in angles and perspectives

### **Performance**
- Images are automatically optimized
- Lazy loading improves page speed
- Progressive enhancement for slower connections
- Error handling for missing images

### **SEO Benefits**
- Proper alt tags included
- Fast loading improves rankings
- Professional imagery builds trust
- Mobile-optimized delivery

---

**Ready to get started?** Just upload your first hero background image to Cloudinary and watch your website transform!