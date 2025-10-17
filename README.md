# EDIS | Enhanced Digital Imaging Solutions

Comprehensive aerial and ground imaging with an integrated client portal system. Serving Florida and nationwide with orthomosaic mapping, 3D/RTK modeling, inspections, and industrial documentation.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/EYE-AM-STUDIOS/edis)

## 📁 Project Structure

```
edis/
├── index.html              # Main landing page
├── portal.html             # Portal information (how access works)
├── signin.html             # Client sign-in
├── dashboard.html          # Client portal dashboard
├── admin-dashboard.html    # Admin management
├── vercel.json             # Vercel deployment config
├── package.json            # Project metadata
└── DEPLOYMENT.md           # Deployment guide
```

## 🌟 Features

### Landing Page
- Aerial and Ground Imaging overview with collapsible details
- Clear Client Portal vs. Client Login separation
- Contact CTA and inline iconography (no external icon packages)
- Responsive, Tailwind-powered layout

### Client Portal System
- **Secure Login**: Demo authentication (admin@eyeamstudios.com/admin123)
- **Project Tracking**: 6-stage progress pipeline
- **File Management**: Storage tracking and deliverable downloads
- **Package Details**: Transparent pricing and included services

### Admin Dashboard
- **Client Management**: Full CRUD operations
- **Storage Management**: Usage tracking and retention policies
- **HoneyBook Integration**: Contract and invoice automation
- **Progress Updates**: Real-time status management

## 🛠️ Current Implementation

**Status**: Static Frontend (Demo Mode)
- ✅ Fully functional UI/UX
- ✅ Responsive design
- ✅ Contact form integration
- ⚠️ Demo authentication only
- ⚠️ Simulated data storage

## 🚀 Deployment Options

### Option 1: Static Deployment (Immediate)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set custom domain (optional)
vercel --prod
```

### Option 2: Full Production Setup
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production implementation guide.

## 🔧 Local Development

```bash
# Clone repository
git clone https://github.com/EYE-AM-STUDIOS/edis.git
cd edis

# Start local server (choose one)
python -m http.server 8000    # Python
php -S localhost:8000         # PHP
npx live-server               # Node.js

# Open browser
open http://localhost:8000
```

## 🎯 Demo Credentials

### Admin Access
- **Email**: admin@eyeamstudios.com
- **Password**: admin123

### Client Access  
- **Email**: demo@test.com
- **Password**: demo123

## 📧 Contact Integration

The contact form is connected to Formspree:
- **Endpoint**: https://formspree.io/f/myzndjra
- **Validation**: Client-side and server-side
- **Response**: Automatic confirmation emails

## 🎨 Brand Guidelines

### Colors
- **Jet Black**: #000000 (Primary backgrounds)
- **Midnight Blue**: #0D1B2A (Secondary backgrounds)  
- **Electric Cyan**: #00BFFF (Accent & highlights)
- **White**: #FFFFFF (Text & contrasts)

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Fallbacks**: -apple-system, BlinkMacSystemFont, "Segoe UI"

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔜 Roadmap

### Phase 1: Production Backend
- [ ] Real authentication system
- [ ] Database integration
- [ ] File storage implementation
- [ ] Payment processing

### Phase 2: Advanced Features  
- [ ] Automated project pipelines
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Multi-user account management

### Phase 3: Enterprise Features
- [ ] API access
- [ ] Custom branding
- [ ] Advanced reporting
- [ ] Third-party integrations

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Support

For questions or support:
- **Email**: admin@eyeamstudios.com
- **Website**: [EDIS](https://your-vercel-domain.vercel.app)

---

**Built with ❤️ by EYE AM STUDIOS**