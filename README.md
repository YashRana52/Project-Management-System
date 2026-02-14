# 🎓 Project Management & Supervision System

A comprehensive **web-based academic project management platform** designed to streamline **final-year projects, minor projects, and faculty supervision**.

The system provides three dedicated portals for seamless coordination and transparency:

**Student Dashboard • Teacher / Supervisor Portal • Admin Control Panel**

---

## 🚀 Live Demo
🔗 **[View Live](https://project-management-system-client-omega.vercel.app)**

---

## 📸 Screenshots

### 📌 System Overview

| Project Details | Admin Dashboard | Assign Supervisor |
|-----------------|----------------|------------------|
| ![Project Details](https://github.com/YashRana52/bedu/blob/main/Screenshot%202026-02-15%20012452.png?raw=true) | ![Admin Dashboard](https://github.com/YashRana52/bedu/blob/main/Screenshot%202026-02-15%20012420.png?raw=true) | ![Assign Supervisor](https://github.com/YashRana52/bedu/blob/main/Screenshot%202026-02-15%20012515.png?raw=true) |

### 📁 File & Student Management

| Upload Files | Assign Students | File Management |
|-------------|----------------|----------------|
| ![Upload](https://github.com/YashRana52/bedu/blob/main/Screenshot%202026-02-15%20012547.png?raw=true) | ![Students](https://github.com/YashRana52/bedu/blob/main/Screenshot%202026-02-15%20012657.png?raw=true) | ![Files](https://github.com/YashRana52/bedu/blob/main/Screenshot%202026-02-15%20012716.png?raw=true) |

---

## ✨ Key Features

### 🎓 Student Dashboard
- Submit project proposals (title, abstract, domain, technologies)
- Request faculty members as project supervisor
- Real-time notification system (approval, rejection, feedback)
- View detailed evaluation & remarks from supervisors
- Track project progress, milestones & current status
- Upload project documents (PDF, ZIP, Images)

---

### 👨‍🏫 Teacher / Supervisor Portal
- View and manage assigned students & projects
- Accept or reject supervision requests
- Monitor real-time project progress
- Provide structured feedback & comments
- Evaluate reports, presentations & viva
- Download submitted project documents

---

### ⚙️ Admin Control Panel
- Full **CRUD operations** on Student & Teacher accounts
- Global approval/rejection of project proposals
- Assign or reassign supervisors
- View all ongoing & completed projects
- Centralized file management system
- System monitoring & usage overview
- Role-based access control & security logs

---

## 🔐 Authentication & Security
- Secure JWT-based authentication
- Role-based access (Student / Teacher / Admin)
- Protected backend APIs
- Encrypted credentials & secure sessions

---

## 🛠 Tech Stack

| Layer            | Technology |
|------------------|------------|
| Frontend         | React.js |
| Backend          | Node.js, Express.js |
| Database         | MongoDB |
| Authentication   | JWT |
| Real-time        | Socket.io |
| File Storage     | Cloudinary |
| Styling          | Tailwind CSS |
| State Management | Redux |
| Deployment       | Vercel / Render |

---

## 🧰 Environment Variables Setup

Create a `.env` file in the **backend root directory** and add the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Email (SMTP - Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SENDER_EMAIL=your_email_address

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

```
## 👨‍💻 Author

**Yash Rana**  
🎓 IET Lucknow  
📧 [yashrana2200520100072@gmail.com](mailto:yashrana2200520100072@gmail.com)  
🔗 LinkedIn: [https://www.linkedin.com/in/yashrana52](https://www.linkedin.com/in/yashrana52)  
💻 GitHub: [https://github.com/YashRana52](https://github.com/YashRana52)

---

⭐ **Star the repository if you find this project helpful!**
