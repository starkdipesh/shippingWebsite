# Quick Start Testing Guide - Image Upload Fix

## Environment Setup

### Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3000` (or your dev server)
- Virtual environment activated: `. .venv/bin/activate`

## Step 1: Verify Backend is Running

```bash
# Check if backend is running
curl http://localhost:8000/api/settings

# Should return JSON with company settings (no error)
```

## Step 2: Run Automated Tests

### Option A: Quick Test (5 minutes)
```bash
cd backend
python test_upload.py
```
Expected output:
```
✓ Login successful
✓ File upload successful  
✓ Categories retrieved
✓ Cargo item created successfully
✓ All critical tests passed!
```

### Option B: Comprehensive Test (10 minutes)
```bash
cd backend
python test_upload_comprehensive.py
```
Expected output:
```
✓ ALL TESTS PASSED!

The image upload functionality is working correctly:
  • Backend upload endpoint is functional
  • Files are being saved to uploads directory
  • Image URLs are stored in the database
  • Cargo items can be created with image URLs
  • Images are properly linked to items
```

## Step 3: Manual Testing in Admin Panel

### 1. Access Admin Panel
1. Open browser → `http://localhost:3000/admin`
2. Password: `dev19patel`
3. Click "Login"

### 2. Navigate to Cargo Items
1. Click "Cargo Items" in left sidebar
2. Click "Add Item" button

### 3. Test Image Upload
1. Fill in form:
   - **Name**: `Test Product`
   - **Category**: Select any category
   - **Description**: `Testing image upload`

2. Upload Image:
   - Click the file input area
   - Select a PNG/JPG/GIF file
   - Wait for toast message: `"Image uploaded successfully!"`
   - Verify thumbnail appears

3. Save Item:
   - Click "Save" button
   - Wait for toast: `"Item created successfully"`
   - Check that new item appears in table with image

### 4. Test Image Edit
1. Find the newly created item in table
2. Click Edit (pencil icon)
3. Upload a different image
4. Click Save
5. Verify image updates in table

## Step 4: Verify Database Changes

### Check MongoDB
```bash
# Connect to MongoDB
mongosh

# Switch to database
use vknath_shipping

# Check cargo items
db.cargo_items.find().pretty()

# Should show items with image_url field populated
```

### Check File System
```bash
# List uploaded files
ls -la backend/uploads/

# Should show recently modified files
# Example: 20260425_194108.png
```

## Troubleshooting

### Issue: "Cannot connect to server"
```bash
# Start backend
cd backend
python main.py

# Verify it's running
curl http://localhost:8000/api/settings
```

### Issue: "File upload failed" in admin panel
1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Try uploading a file**
4. **Check the `/api/upload` request**:
   - Should show `200` status
   - Response should include `url` field
5. **Check Console tab** for error messages

### Issue: Image not displaying
1. **Check the image URL** in MongoDB
2. **Test URL in browser** directly
3. **Verify file exists** in `backend/uploads/` directory
4. **Check file permissions** if needed

## Performance Verification

### Test Upload Speed
```bash
# Time a file upload
time curl -X POST http://localhost:8000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@backend/uploads/sample.png" \
  -F "type=cargo"

# Should complete in < 1 second for small files
```

### Verify Concurrent Uploads
The test script creates items sequentially. In production, you can:
1. Open multiple admin panels in different browser tabs
2. Upload images simultaneously
3. Verify all complete without errors

## Success Criteria

✓ **All tests pass** (automated test scripts)
✓ **Image uploads** show success message
✓ **Thumbnails display** in item list
✓ **Database stores** image URLs correctly
✓ **Edit works** - can update item images
✓ **Files exist** in backend/uploads directory
✓ **URLs accessible** via HTTP

## What Was Fixed

### Before (Broken)
```javascript
// ❌ WRONG - Manual Content-Type breaks multipart upload
axios.post(`${API_BASE}/upload`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',  // Breaks it!
    'Authorization': `Bearer ${token}`,
  },
});
```

### After (Fixed)
```javascript
// ✓ CORRECT - Let axios handle Content-Type automatically
axiosInstance.post('/api/upload', formData, {
  headers: {
    // Don't set Content-Type manually!
  }
});
```

## Key Changes Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Content-Type Header** | Manually set (broke uploads) | Auto-handled by axios |
| **Axios Configuration** | Not configured | Centralized with baseURL & interceptor |
| **Authentication** | Manual header on each call | Auto-injected via interceptor |
| **Image URLs** | Relative paths only | Absolute URLs with API_BASE |
| **Consistency** | Mixed approaches | Unified across all API calls |

## Next Steps

1. ✓ Verify tests pass locally
2. ✓ Test in admin panel
3. ✓ Commit changes to git
4. Deploy to production
5. Monitor error logs
6. Gather user feedback

## References

- [Fix Documentation](./IMAGE_UPLOAD_FIX_GUIDE.md)
- [Test Scripts](./backend/)
  - `test_upload.py` - Basic test
  - `test_upload_comprehensive.py` - Full test
- [AdminPanel Component](./frontend/src/components/AdminPanel.js)

---

**Last Updated**: 2026-04-25
**Status**: ✓ All tests passing
**Ready for**: Production deployment
