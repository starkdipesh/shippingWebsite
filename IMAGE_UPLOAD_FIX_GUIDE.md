# Cargo Items Image Upload Fix - Documentation

## Issue Summary
The admin panel's "Cargo Items" edit form was not properly uploading images. The issue was in the frontend code's `handleFileUpload` function and inconsistent axios configuration.

## Root Causes Identified

### 1. **Manual Content-Type Header Issue**
**Problem:** The code was manually setting `'Content-Type': 'multipart/form-data'` in axios headers:
```javascript
// WRONG - Don't do this!
const response = await axios.post(`${API_BASE}/upload`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',  // ❌ This breaks multipart
    'Authorization': `Bearer ${token}`,
  },
});
```

**Why it fails:** When you manually set `Content-Type: multipart/form-data`, axios/browser cannot add the required `boundary` parameter that separates form data parts. This causes the backend to receive malformed data.

**Solution:** Remove the manual Content-Type header and let axios handle it automatically:
```javascript
// CORRECT - Let axios handle it
const response = await axiosInstance.post('/api/upload', formData, {
  headers: {
    // Don't set Content-Type manually for FormData!
  }
});
```

### 2. **Inconsistent API Endpoint URLs**
**Problem:** Different axios calls used different URL patterns:
- Some used relative URLs: `axios.get('/api/settings')`
- Others used full URLs: `axios.post(`${API_BASE}/upload`, ...)`
- Auth headers were manually added to each call

**Solution:** Create a centralized axios instance with:
- Base URL configuration
- Automatic token injection via interceptor
```javascript
const axiosInstance = axios.create({
  baseURL: API_BASE,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. **Image URL Format Issue**
**Problem:** The backend returns relative paths like `/uploads/filename.png`, which might not resolve correctly in the frontend if the API_BASE is different.

**Solution:** Convert relative paths to absolute URLs in the frontend:
```javascript
const imageUrl = response.data.url;

// If URL is relative, prepend the API_BASE
if (imageUrl.startsWith('/')) {
  return `${API_BASE}${imageUrl}`;
}

return imageUrl;
```

## Changes Made

### File: `frontend/src/components/AdminPanel.js`

#### 1. Added Axios Instance Configuration
```javascript
const axiosInstance = axios.create({
  baseURL: API_BASE,
});

// Add token interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

#### 2. Updated `handleFileUpload` Function
- Removed manual `Content-Type` header
- Used `axiosInstance` instead of `axios`
- Added logic to convert relative URLs to absolute URLs
- Added error logging for better debugging

```javascript
const handleFileUpload = async (file, type) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  try {
    const response = await axiosInstance.post('/api/upload', formData, {
      headers: {
        // Don't set Content-Type - let axios handle it
      }
    });
    
    const imageUrl = response.data.url;
    
    // Ensure we have the full URL
    if (imageUrl.startsWith('/')) {
      return `${API_BASE}${imageUrl}`;
    }
    
    return imageUrl;
  } catch (error) {
    console.error('File upload error:', error);
    toast.error('File upload failed');
    return null;
  }
};
```

#### 3. Replaced All axios Calls with axiosInstance
All API calls throughout the component now use `axiosInstance`:
- `fetchAllData()`
- `handleSettingsSubmit()`
- `handleCategorySubmit()`
- `handleItemSubmit()`
- `handleDeleteCategory()`
- `handleDeleteItem()`
- `handleDeleteLead()`

Benefits:
- Consistent URL handling
- Automatic token injection
- Cleaner code
- Easier maintenance

## Testing Results

### Backend Tests (test_upload_comprehensive.py)
✓ Server connection verified
✓ Admin login successful
✓ File upload with proper headers working
✓ Cargo categories retrieved
✓ Cargo item created with image URL
✓ Item retrieval with image verified
✓ Image file accessibility confirmed
✓ Uploads directory verified

### Verification
- Files are properly saved to `backend/uploads/` directory
- Image URLs are stored in MongoDB database
- Images are accessible via HTTP
- Full URLs are working correctly

## How to Test in Admin Panel

### 1. **Navigate to Admin Panel**
   - Go to `/admin`
   - Login with password: `dev19patel`
   - Click on "Cargo Items" tab

### 2. **Add New Cargo Item with Image**
   - Click "Add Item" button
   - Fill in the form:
     - Name: Test Item
     - Category: Select any category
     - Description: Test description
   - Upload an image:
     - Click on the image upload field
     - Select a PNG/JPG/GIF file
     - Wait for "Image uploaded successfully!" message
   - Click "Save" button

### 3. **Edit Existing Cargo Item**
   - Click "Edit" button on any existing item
   - Upload a new image or keep the existing one
   - Modify other fields as needed
   - Click "Save" button

### 4. **Verify in Database**
   - New/updated item should show the image thumbnail in the table
   - The image URL should be stored in the database
   - Images should display correctly

## Files Modified
- `frontend/src/components/AdminPanel.js` - Updated axios configuration and file upload handling

## Backend Files (No changes needed)
- `backend/main.py` - Backend is working correctly as-is
- `backend/requirements.txt` - All dependencies are installed

## Deployment Notes

### Environment Variables
Ensure the following environment variable is set in your `.env` file (if different from default):
```
REACT_APP_API_URL=http://localhost:8000
```

### For Production
If deploying to production, update `REACT_APP_API_URL` to point to your production backend URL:
```
REACT_APP_API_URL=https://your-api-domain.com
```

## Additional Testing Scripts

### 1. Basic Upload Test
```bash
python backend/test_upload.py
```

### 2. Comprehensive Test
```bash
python backend/test_upload_comprehensive.py
```

Both scripts will test the entire upload workflow and provide detailed feedback.

## Common Issues & Solutions

### Issue: "File upload failed" message in admin panel
**Solution:**
1. Check browser console for error details (Press F12)
2. Verify backend is running on port 8000
3. Check that `REACT_APP_API_URL` environment variable is correctly set
4. Verify token is being stored in localStorage

### Issue: Image not displaying after upload
**Solution:**
1. Verify the file was uploaded (check `backend/uploads/` directory)
2. Check that the image URL is absolute (starts with `http://`)
3. Verify the file is accessible via the URL in browser
4. Check browser console for 404 errors

### Issue: "401 Unauthorized" error
**Solution:**
1. Re-login to admin panel
2. Check that token is stored in localStorage
3. Verify backend is receiving the Authorization header

## Performance Considerations

- Max file size: 5MB (recommended)
- Supported formats: PNG, JPG, GIF, WebP
- Images are stored on the server's file system
- For production, consider using cloud storage (S3, Azure Blob Storage, etc.)

## Future Improvements

1. **Client-side Image Validation**
   - Validate file size before upload
   - Validate file type
   - Preview image before upload

2. **Cloud Storage Integration**
   - Move uploads to S3/Azure/GCS
   - Add CDN for faster image delivery

3. **Image Optimization**
   - Compress images on upload
   - Generate thumbnails
   - Lazy loading for images in tables

4. **Progress Tracking**
   - Show upload progress percentage
   - Cancel uploads mid-way
   - Pause/resume capability

## References

- [Axios Documentation](https://axios-http.com/)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [FastAPI File Upload](https://fastapi.tiangolo.com/tutorial/request-files/)
