# 🔗 HoneyBook Integration Setup Guide
## Automatic Client Creation & Portal Access

### 📋 **Overview**
This integration automatically creates EDIS portal accounts when clients book through HoneyBook and sends them login credentials via email.

### 🛠️ **Setup Steps**

#### 1. **Server Setup**
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your actual values
nano .env
```

#### 2. **Database Setup**
```bash
# Create MySQL database
mysql -u root -p < database/schema.sql

# Or run the SQL commands manually:
mysql -u root -p
> source database/schema.sql
```

#### 3. **HoneyBook Webhook Configuration**

##### Step 1: Create Webhook in HoneyBook
1. Log into your HoneyBook account
2. Go to **Settings** → **Integrations** → **Webhooks**
3. Click **Create Webhook**
4. Configure:
   - **URL**: `https://your-domain.com/api/webhooks/honeybook`
   - **Events**: Select these events:
     - `project.booked`
     - `invoice.paid` 
     - `contract.signed`
     - `project.updated`
   - **Secret**: Generate a secure secret key

##### Step 2: Update Environment Variables
```env
HONEYBOOK_WEBHOOK_SECRET=your_generated_secret_key
PORTAL_URL=https://your-domain.com
ADMIN_EMAIL=admin@edis-imaging.com
```

#### 4. **Email Configuration**

##### Gmail SMTP Setup:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
```

##### Other Email Providers:
```env
# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key

# Mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASS=your_mailgun_password
```

#### 5. **Start the Server**
```bash
# Development mode
npm run dev

# Production mode
npm start

# Using PM2 (recommended for production)
npm install -g pm2
pm2 start server.js --name edis-portal
pm2 startup
pm2 save
```

### 🔄 **How It Works**

#### **Booking Flow:**
1. **Client books service** in HoneyBook
2. **HoneyBook sends webhook** to your server
3. **Server automatically:**
   - Creates client account in database
   - Generates secure login credentials
   - Sends welcome email with portal access
   - Notifies admin of new client
4. **Client receives email** with:
   - Portal login URL
   - Username (their email)
   - Temporary password
   - Project ID

#### **Admin Notification:**
Admins receive email with:
- New client information
- Project details
- Direct link to admin dashboard

### 📧 **Email Templates**

#### **Client Welcome Email Features:**
- ✅ Premium EDIS branding
- ✅ Login credentials
- ✅ Portal access link
- ✅ Project information
- ✅ What they can access
- ✅ Security instructions

#### **Admin Notification Features:**
- ✅ Client contact information
- ✅ Project details from HoneyBook
- ✅ Quick admin dashboard link
- ✅ Next steps checklist

### 🔐 **Security Features**

- **Webhook Signature Verification**: Ensures requests are from HoneyBook
- **JWT Authentication**: Secure token-based client sessions
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Sanitizes all inputs
- **HTTPS Required**: Secure data transmission

### 📱 **API Endpoints**

#### **Webhook Endpoint:**
```
POST /api/webhooks/honeybook
Content-Type: application/json
X-HoneyBook-Signature: sha256=...
```

#### **Client Authentication:**
```
POST /api/auth/login
{
  "username": "client@email.com",
  "password": "temporary_password"
}
```

#### **Client Dashboard Data:**
```
GET /api/client/dashboard
Authorization: Bearer <jwt_token>
```

#### **Admin Endpoints:**
```
POST /api/admin/login
GET /api/admin/clients
PUT /api/admin/clients/:clientId/access
POST /api/admin/deliverables
```

### 🎯 **Customization Options**

#### **Modify Welcome Email:**
Edit the email template in `honeybook-webhook.js`:
```javascript
const emailTemplate = `
  <!-- Your custom HTML template -->
`;
```

#### **Adjust Client Permissions:**
Default deliverables access in `createClientRecord()`:
```javascript
deliverables_access: {
    maps: true,
    models: true,
    images: true,
    reports: true,
    videos: true
}
```

#### **Custom Project ID Format:**
Modify in `generateClientCredentials()`:
```javascript
projectId: `CUSTOM_${uuidv4().substr(0, 8).toUpperCase()}`
```

### 🔧 **Testing the Integration**

#### **Test Webhook Locally:**
```bash
# Install ngrok for local testing
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use ngrok URL in HoneyBook webhook settings
# https://abcd1234.ngrok.io/api/webhooks/honeybook
```

#### **Manual Test:**
```bash
# Send test webhook
curl -X POST https://your-domain.com/api/webhooks/honeybook \
  -H "Content-Type: application/json" \
  -H "X-HoneyBook-Signature: sha256=test_signature" \
  -d '{
    "eventType": "project.booked",
    "client": {
      "name": "Test Client",
      "email": "test@example.com",
      "phone": "555-1234",
      "businessName": "Test Company"
    },
    "project": {
      "name": "Test Project",
      "serviceType": "Aerial Photography",
      "scheduledDate": "2024-01-15",
      "totalAmount": 2500
    }
  }'
```

### 📊 **Monitoring & Logs**

#### **Check Webhook Logs:**
```sql
SELECT * FROM webhook_logs 
WHERE processing_status = 'failed' 
ORDER BY processed_at DESC;
```

#### **Monitor Email Delivery:**
```sql
SELECT * FROM email_notifications 
WHERE delivery_status = 'failed' 
ORDER BY sent_at DESC;
```

#### **View Client Activity:**
```sql
SELECT * FROM file_access_logs 
WHERE access_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY access_date DESC;
```

### 🚨 **Troubleshooting**

#### **Common Issues:**

1. **Webhook Not Received:**
   - Check HoneyBook webhook URL
   - Verify server is accessible
   - Check firewall settings
   - Test with ngrok locally

2. **Email Not Sending:**
   - Verify SMTP credentials
   - Check spam folder
   - Test with different email provider
   - Review email logs

3. **Database Connection:**
   - Verify MySQL is running
   - Check database credentials
   - Test connection manually

4. **Authentication Issues:**
   - Check JWT secret configuration
   - Verify password hashing
   - Test login endpoint manually

### 🔄 **Production Deployment**

#### **Recommended Stack:**
- **Server**: Ubuntu 20.04+ or CentOS 8+
- **Web Server**: Nginx (reverse proxy)
- **Process Manager**: PM2
- **Database**: MySQL 8.0+
- **SSL**: Let's Encrypt

#### **Nginx Configuration:**
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    location / {
        root /path/to/edis/portal;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 📈 **Next Steps After Setup**

1. **Test the complete flow** with a real HoneyBook booking
2. **Customize email templates** with your branding
3. **Set up file upload system** for deliverables
4. **Configure backup strategy** for database
5. **Set up monitoring** and alerts
6. **Train admin users** on the system

### 🎉 **Success!**

Once configured, your workflow becomes:
1. Client books through HoneyBook ✅
2. Portal account created automatically ✅
3. Client receives login credentials ✅
4. Admin gets notified ✅
5. Client accesses premium portal ✅

**No manual client setup required!** 🚀

### 📞 **Support**

For technical support or customization needs:
- 📧 Email: support@edis-imaging.com
- 📚 Documentation: [Link to docs]
- 🐛 Issues: [GitHub Issues]