# EDIS Free Tier Optimization Guide

## 🎯 **Maximizing Your Cloudinary Free Tier**

### **Smart Upload Strategy:**
1. **Start with Demo Projects**: Use the demo-mosaic client for testing
2. **Optimize Before Upload**: 
   - Compress large orthomosaics to ~30MB before upload
   - Use JPEG for aerial photos, PNG only when transparency needed
3. **Strategic File Management**:
   - Delete test uploads regularly
   - Archive completed projects to free space

### **Bandwidth Optimization:**
```javascript
// Use progressive loading to reduce bandwidth
const thumbnail = CloudinaryHelpers.getImageUrl(publicId, 'c_fill,w_200,h_150,q_60');
const medium = CloudinaryHelpers.getImageUrl(publicId, 'c_fit,w_800,h_600,q_80');
const full = CloudinaryHelpers.getImageUrl(publicId, 'q_90,f_auto');
```

### **Transformation Efficiency:**
- **Cache thumbnails**: Generate once, serve many times
- **Use q_auto**: Automatic quality optimization saves bandwidth
- **Lazy loading**: Only load images when viewed

### **Free Tier Project Capacity:**

**Realistic Project Breakdown:**
```
Small Project (Residential):
- 1 orthomosaic (30MB)
- 10 aerial photos (80MB)  
- 20 ground photos (100MB)
- 1 PDF report (3MB)
Total: ~213MB per project
= 117 small projects on free tier

Medium Project (Commercial):
- 2 orthomosaics (100MB)
- 25 aerial photos (200MB)
- 50 ground photos (250MB)
- 3 PDF reports (9MB)
Total: ~559MB per project  
= 44 medium projects on free tier

Large Project (Industrial):
- 5 orthomosaics (250MB)
- 50 aerial photos (400MB)
- 100 ground photos (500MB)
- 5 PDF reports (15MB)
Total: ~1.165GB per project
= 21 large projects on free tier
```

### **When to Upgrade:**

**Upgrade Signals:**
- Storage > 20GB (upgrade to Pro at $99/month)
- Bandwidth > 20GB/month consistently
- Need for advanced features (video, AI)
- Multiple simultaneous large projects

### **Free Tier Business Model:**
```
Month 1-3: Free Tier
- Complete 5-10 demo projects
- Perfect the client portal experience
- Build client testimonials

Month 4-6: Pro Upgrade ($99/month)  
- Scale to 20+ active clients
- Add video deliverables
- Advanced analytics

Month 7+: Growth/Enterprise
- Custom pricing for volume
- White-label solutions
- API integrations
```

### **Cost-Effective Workflow:**

**Phase 1: Free Development**
1. Build and test portal with demo data
2. Perfect upload workflows
3. Configure client assignment process
4. Create transformation presets

**Phase 2: Limited Client Launch**  
1. Start with 2-3 pilot clients
2. Monitor usage closely
3. Optimize file sizes and workflows
4. Gather feedback and testimonials

**Phase 3: Scale with Confidence**
1. Upgrade when hitting 80% of limits
2. Full client onboarding
3. Advanced features and automation

### **Emergency Space Management:**

If approaching limits:
```javascript
// Quick space-saving transformations
const compressed = CloudinaryHelpers.getImageUrl(publicId, 'q_70,f_auto');
const webp = CloudinaryHelpers.getImageUrl(publicId, 'f_webp,q_80');
```

**Archive Strategy:**
- Move completed projects to local backup
- Keep only active projects in Cloudinary
- Re-upload when client needs access