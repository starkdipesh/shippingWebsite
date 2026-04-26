# V K Shipping Services - Dynamic Platform

A fully dynamic import-export business platform with comprehensive admin panel, built with React + FastAPI + MongoDB.

## 🚀 Features

### Public Website
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dynamic Content**: All content managed via admin panel
- **Cargo Gallery**: Categorized showcase of export products
- **Lead Generation**: Functional contact and quote forms with email integration
- **Real-time Updates**: Instant reflection of admin changes

### Admin Panel
- **Secure Authentication**: Password-protected admin access (default: `dev19patel`)
- **Global Settings Management**: Update company info, logo, contact details
- **Cargo Categories**: Full CRUD for product categories
- **Cargo Items**: Manage individual products with images
- **Lead Management**: View and manage customer inquiries
- **Dashboard Analytics**: Overview of categories, items, and leads

### Technical Features
- **Email Notifications**: Instant email alerts for new leads
- **File Upload**: Support for product images
- **Database Persistence**: MongoDB for reliable data storage
- **API Integration**: RESTful API with FastAPI
- **Simple Setup**: Easy local development without Docker

## 🛠 Tech Stack

### Frontend
- **React 18**: Modern UI framework
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **React Hot Toast**: User notifications
- **Lucide React**: Icon library

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database
- **JWT Authentication**: Secure admin access
- **SMTP Integration**: Email functionality
- **File Upload**: Image handling

### DevOps
- **Simple Scripts**: Easy startup scripts for local development
- **Manual Deployment**: Traditional server deployment

## 📁 Project Structure

```
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application file
│   ├── requirements.txt    # Python dependencies
│   └── uploads/           # File upload directory
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
├── start.sh               # Linux/Mac startup script
├── start.bat              # Windows startup script
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- MongoDB (for database)

### Simple Setup (Recommended)

**Option 1: Use Startup Scripts**

1. **Clone the repository**:
```bash
git clone [repository-url]
cd shippingWebsite
```

2. **Run the startup script**:
```bash
# On Linux/Mac
./start.sh

# On Windows
start.bat
```

3. **Access the application**:
- Public Website: `http://localhost:3000`
- Admin Panel: `http://localhost:3000/admin`
- API Documentation: `http://localhost:8000/docs`

**Option 2: Manual Setup**

1. **Backend Setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configurations
uvicorn main:app --reload
```

2. **Frontend Setup**:
```bash
cd frontend
npm install
npm start
```

3. **Database Setup**:
```bash
# Install and start MongoDB
mongod
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017

# Email Configuration (Required for lead notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# JWT Secret Key
SECRET_KEY=your-super-secret-key-change-this-in-production
```

### Email Setup

1. **Gmail Setup**:
   - Enable 2-factor authentication
   - Generate an app password
   - Use app password in `SMTP_PASSWORD`

2. **Other SMTP Providers**:
   - Update `SMTP_SERVER` and `SMTP_PORT` accordingly
   - Use appropriate credentials

## 📊 Admin Features

### Default Login
- **URL**: `http://localhost:3000/admin`
- **Password**: `dev19patel`

### Admin Capabilities
1. **Dashboard**: Overview of all data
2. **Global Settings**: Company information management
3. **Cargo Categories**: Add/edit/delete product categories
4. **Cargo Items**: Manage individual products
5. **Lead Management**: View customer inquiries

## 🌐 Deployment

### Production Deployment

1. **Prepare production environment**:
```bash
# Set production environment variables
export NODE_ENV=production
export SMTP_USER=your-production-email
export SMTP_PASSWORD=your-production-password
```

2. **Backend Deployment**:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

3. **Frontend Deployment**:
```bash
cd frontend
npm run build
# Serve the build directory with nginx or Apache
```

## 🔄 Database Schema

### Global Settings
```javascript
{
  company_name: String,
  tagline: String,
  about_us: String,
  phone: String,
  email: String,
  address: String,
  logo_url: String
}
```

### Cargo Categories
```javascript
{
  name: String,
  description: String,
  image_url: String
}
```

### Cargo Items
```javascript
{
  category_id: String,
  name: String,
  description: String,
  image_url: String
}
```

### Leads
```javascript
{
  type: String, // 'contact' or 'quote'
  name: String,
  email: String,
  subject: String, // contact form
  cargo_type: String, // quote form
  message: String,
  created_at: Date
}
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check MONGO_URI in environment variables
   - Verify network connectivity

2. **Email Not Sending**:
   - Verify SMTP credentials
   - Check app password for Gmail
   - Ensure SMTP server is accessible

3. **File Upload Issues**:
   - Check uploads directory permissions
   - Verify file size limits
   - Ensure sufficient disk space

4. **Frontend Build Errors**:
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Logs

- **Backend**: Check terminal output from uvicorn
- **Frontend**: Check browser console and terminal output
- **MongoDB**: Check MongoDB logs in `/var/log/mongodb.log`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and inquiries:
- **Email**: export@vknathgroup.in
- **Phone**: +91-7573041747/7573041744
- **Address**: Office No. M-1, first floor, Kashish Arcade, Master Marine Services Pvt. Ltd, near Zero Point, Mundra, Gujarat 370421

---

Built By Dipesh Patel for V K Shipping Services