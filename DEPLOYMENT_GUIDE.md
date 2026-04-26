# 🚀 Free Deployment Guide - V K Shipping Services

This guide will help you deploy your V K Shipping Services platform for free using various hosting providers.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Free Hosting Options](#free-hosting-options)
3. [Option 1: Vercel + MongoDB Atlas](#option-1-vercel--mongodb-atlas)
4. [Option 2: Netlify + MongoDB Atlas + Render](#option-2-netlify--mongodb-atlas--render)
5. [Option 3: GitHub Pages + MongoDB Atlas + Render](#option-3-github-pages--mongodb-atlas--render)
6. [Email Configuration](#email-configuration)
7. [Environment Setup](#environment-setup)
8. [Testing Your Deployment](#testing-your-deployment)

## 🔧 Prerequisites

- **Git**: Installed and configured
- **Node.js 18+**: For frontend build
- **Python 3.11+**: For backend
- **GitHub Account**: For code hosting
- **Email Account**: For SMTP configuration

## 🌐 Free Hosting Options

| Service | Frontend | Backend | Database | Storage | Custom Domain |
|---------|----------|---------|----------|---------|---------------|
| **Vercel + Render + MongoDB Atlas** | ✅ Vercel | ✅ Render | ✅ Atlas | ❌ | ✅ |
| **Netlify + Render + MongoDB Atlas** | ✅ Netlify | ✅ Render | ✅ Atlas | ❌ | ✅ |
| **GitHub Pages + Render + MongoDB Atlas** | ✅ GitHub Pages | ✅ Render | ✅ Atlas | ❌ | ✅ |

---

## 🎯 Option 1: Vercel + MongoDB Atlas (Recommended)

### Step 1: Set up MongoDB Atlas

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. **Create Cluster**: 
   - Choose "Shared Cluster" (Free)
   - Select region closest to you
   - Name your cluster (e.g., `vknath-shipping`)
3. **Configure Network**:
   - Add your current IP to whitelist
   - Enable "Allow access from anywhere" (0.0.0.0/0)
4. **Create Database User**:
   - Username: `vknathadmin`
   - connection string: mongodb+srv://vknathadmin:dev19patel@cluster0.jkugicn.mongodb.net/?appName=Cluster0
   - Password: dev19patel
5. **Get Connection String**:
   - Go to Database → Connect → Connect your application
   - Copy the connection string

### Step 2: Deploy Backend on Render

1. **Create Account**: Go to [Render](https://render.com/)
2. **Create New Web Service**:
   - Connect your GitHub repository
   - Select the repository
3. **Configure Service**:
   ```yaml
   Name: vknath-shipping-backend
   Runtime: Python 3
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```
4. **Add Environment Variables**:
   ```
   MONGO_URI=mongodb+srv://vknathadmin:PASSWORD@cluster.mongodb.net/vknath_shipping?retryWrites=true&w=majority
   SECRET_KEY=your-super-secret-jwt-key
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```
5. **Deploy**: Click "Create Web Service"

### Step 3: Deploy Frontend on Vercel

1. **Create Account**: Go to [Vercel](https://vercel.com/)
2. **Import Project**:
   - Connect your GitHub repository
   - Select the repository
3. **Configure Project**:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Add Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-name.onrender.com
   ```
5. **Deploy**: Click "Deploy"

### Step 4: Update Frontend API URL

In `frontend/src/components/PublicWebsite.js` and `AdminPanel.js`, update the API calls:

```javascript
// Replace all axios calls with the full URL
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Example:
axios.get(`${API_BASE}/api/settings`)
```

---

## 🎯 Option 2: Netlify + Render + MongoDB Atlas

### Step 1: Set up MongoDB Atlas
*(Same as Option 1)*

### Step 2: Deploy Backend on Render
*(Same as Option 1)*

### Step 3: Deploy Frontend on Netlify

1. **Create Account**: Go to [Netlify](https://www.netlify.com/)
2. **Add New Site**:
   - Connect to GitHub
   - Select repository
3. **Build Settings**:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/build`
4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-name.onrender.com
   ```
5. **Deploy Site**

---

## 🎯 Option 3: GitHub Pages + Render + MongoDB Atlas

### Step 1: Set up MongoDB Atlas
*(Same as Option 1)*

### Step 2: Deploy Backend on Render
*(Same as Option 1)*

### Step 3: Deploy Frontend on GitHub Pages

1. **Install gh-pages**:
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   ```json
   {
     "homepage": "https://yourusername.github.io/shippingWebsite",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

---

## 📧 Email Configuration

### Gmail Setup (Free)

1. **Enable 2-Factor Authentication** in your Google Account
2. **Generate App Password**:
   - Go to Google Account → Security → App Passwords
   - Select "Mail" and your device
   - Copy the generated password
3. **Use in Environment Variables**:
   ```
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-character-app-password
   ```

### Alternative Free Email Services

- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month)
- **Brevo** (Free tier: 300 emails/day)

---

## 🔧 Environment Setup

### Backend Environment Variables

Create `.env` file in backend directory:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vknath_shipping?retryWrites=true&w=majority

# JWT Secret Key
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend Environment Variables

Create `.env` file in frontend directory:

```env
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

---

## 🧪 Testing Your Deployment

### 1. Backend Testing

```bash
# Test your deployed backend
curl https://your-backend-name.onrender.com/api/settings
```

### 2. Frontend Testing

1. Visit your frontend URL
2. Check browser console for errors
3. Test all features:
   - Page navigation
   - Contact forms
   - Admin panel (login with `dev19patel`)

### 3. Email Testing

1. Submit a contact form
2. Check your email for notifications
3. Verify email content and formatting

---

## 🚨 Common Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Add CORS origins in backend `main.py`
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 2: Database Connection Failed
**Solution**: 
- Check MongoDB Atlas whitelist
- Verify connection string
- Ensure database user has correct permissions

### Issue 3: Email Not Sending
**Solution**:
- Verify SMTP credentials
- Check app password for Gmail
- Ensure SMTP server is accessible

### Issue 4: Render Backend Sleeps
**Solution**: Free Render services sleep after 15 minutes inactivity
- Use a cron job service like [UptimeRobot](https://uptimerobot.com/) to ping your backend every 5 minutes

---

## 📋 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user configured
- [ ] Backend deployed on Render
- [ ] Frontend deployed (Vercel/Netlify/GitHub Pages)
- [ ] Environment variables set
- [ ] Email SMTP configured
- [ ] CORS settings updated
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] Monitoring setup (UptimeRobot)
- [ ] All features tested

---

## 🔄 Maintenance

### Monthly Tasks
1. **Monitor Usage**: Check free tier limits
2. **Backup Database**: Export MongoDB data
3. **Update Dependencies**: Keep packages updated
4. **Review Logs**: Check for errors

### Quarterly Tasks
1. **Security Audit**: Review access and credentials
2. **Performance Review**: Optimize slow endpoints
3. **Feature Updates**: Add new functionality
4. **Backup Strategy**: Ensure data safety

---

## 💡 Pro Tips

1. **Use Custom Domains**: Free services support custom domains for professional appearance
2. **Monitor Uptime**: Use free monitoring services to track availability
3. **Optimize Images**: Compress images for faster loading
4. **Implement Caching**: Add caching headers for better performance
5. **Set Up Analytics**: Use Google Analytics for visitor tracking

---

## 🆘 Support

If you encounter issues:

1. **Check Logs**: Review deployment logs
2. **Test Locally**: Ensure app works locally first
3. **Verify Environment**: Double-check all environment variables
4. **Community Help**: Ask questions on Stack Overflow or GitHub Discussions

---

**🎉 Congratulations!** Your V K Shipping Services platform is now deployed and accessible worldwide!

For additional help, refer to the [main README.md](README.md) or contact support.
