# 🔐 User Accounts for Testing

## Management Users (Full Access - 10/10 Navigation Items)

### 👑 Master Administrator
- **Email:** `masteradmin@sentimentai.com`
- **Password:** `MasterAdmin@123`
- **Role:** `master`
- **Access:** Full system access (all features)

### 🎯 Director  
- **Email:** `director@sentimentai.com`
- **Password:** `Director@123`
- **Role:** `director`
- **Access:** Full management access (same as master)

### 🏢 Chairman
- **Email:** `chairman@sentimentai.com`
- **Password:** `Chairman@123`
- **Role:** `chairman`
- **Access:** Full executive access (same as master)

## Employee Users (Restricted Access - 5/10 Navigation Items)

### 👨‍💼 Employee
- **Email:** `john.smith@sentimentai.com`
- **Password:** `Employee@123`
- **Role:** `employee`
- **Access:** Basic task management and communication only

---

## 📊 Permission Summary

### ✅ **All Management Roles** (Master, Director, Chairman)
**Full Access to:**
- Dashboard
- Tasks  
- Projects
- Categories
- User Management
- Messages
- Notifications
- Analytics
- WhatsApp
- Calendar
- Settings (available to all)

### 🔒 **Employee Role**
**Limited Access to:**
- Dashboard
- Tasks
- Messages
- Notifications  
- Calendar
- Settings (available to all)

**Restricted from:**
- Projects
- Categories
- User Management
- Analytics
- WhatsApp

---

## 🧪 Testing Instructions

1. **Start the development server:**
   ```
   npm run dev
   ```
   
2. **Access the application:**
   - URL: http://localhost:5174/
   
3. **Test different user roles:**
   - Login with any management user → Should see all 10 navigation items
   - Login with employee user → Should see only 5 navigation items
   
4. **Verify Firebase Authentication:**
   - All users are created in Firebase Auth
   - All users have corresponding Firestore documents
   - Authentication and authorization work seamlessly

---

## ✅ Current Status

- ✅ All management roles have identical permissions
- ✅ Employees have restricted access as specified
- ✅ Firebase Auth integration working
- ✅ Sidebar permissions properly configured
- ✅ Dashboard titles display correctly
- ✅ Settings accessible to all user types