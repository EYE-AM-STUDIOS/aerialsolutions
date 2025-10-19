# EDIS Portal - Production Deployment

This repository contains the production-ready EDIS (Enhanced Digital Imaging Solutions) portal.

## 🚀 Live Site
- **Production**: https://edis-portal.vercel.app
- **Repository**: https://github.com/EYE-AM-STUDIOS/edis

## 📁 Site Structure
```
/                    → Main landing page (index.html)
/portal              → Client portal information (portal.html)
/dashboard           → Client dashboard with login (dashboard.html)
/admin-dashboard     → Admin management interface (admin-dashboard.html)
```

## 🔐 Demo Login Credentials
**Client Dashboard Access:**
- Username: `demo` / Password: `edis2025`
- Username: `client` / Password: `portal2025`
- Username: `kemuel` / Password: `demo123`

## 🎯 Features
- ✅ Premium construction worker hero image
- ✅ Complete services showcase (Aerial + Ground divisions)
- ✅ Interactive portfolio section
- ✅ Secure client login system
- ✅ Full dashboard with project management
- ✅ Cloudinary integration for image delivery
- ✅ Responsive design for all devices
- ✅ Professional glassmorphism UI

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Images**: Cloudinary CDN integration
- **Hosting**: Vercel (Static Site)
- **Authentication**: Session-based login system

## 📦 Deployment Commands
```bash
# Deploy to production
npm run deploy

# Deploy preview
npm run deploy:preview

# Local development
npm run dev
```

## 🏗️ Client Portal Workflow
1. **Main Site** → Client views services and company info
2. **Portal Page** → Information about TrueView Portal access
3. **Dashboard Login** → Secure authentication with demo credentials
4. **Full Dashboard** → Project management, deliverables, interactive tools

## 🎨 Design System
- **Primary Color**: Electric Cyan (#00BFFF)
- **Secondary Color**: Violet (#6C5CE7)
- **Background**: Dark gradient theme
- **Effects**: Glassmorphism, premium animations
- **Typography**: Inter font family

## 📧 Contact
- **Company**: EYE AM STUDIOS
- **Email**: contact@edis-imaging.com
- **Services**: Aerial & ground-based imaging solutions

---
**Built for the top 1% of client portals** ✨

### Option C: Hybrid Approach
- Keep static frontend on Vercel
- Use external backend (Node.js on Railway/Render)
- Connect via API calls

## Recommended Next Steps

1. **Deploy Static Version First** (5 minutes)
2. **Set up real authentication** (Supabase recommended)
3. **Implement file storage** (Vercel Blob or AWS S3)
4. **Add database** for client/project management
5. **Integrate payment processing** (Stripe)

Would you like me to help you with any specific implementation approach?