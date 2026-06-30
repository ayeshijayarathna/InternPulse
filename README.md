<div align="center">

# ⚡ InternPulse

**A modern intern management platform built with the MERN stack**

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

</div>

---

## 📌 Overview

InternPulse is a full-stack intern management platform designed for real-world deployment. It supports three user roles — **Super Admin**, **Supervisor**, and **Intern** — each with their own dedicated dashboard and feature set.

---

## ✨ Features

### 👑 Super Admin
- Create and manage supervisors
- Post announcements to all supervisors
- View interns under each supervisor
- Avatar upload

### 🧑‍💼 Supervisor
- Create and manage interns (with internship dates)
- Assign tasks with priority, due dates, and descriptions
- View intern submissions and download attachments
- View and download intern CVs
- Reply to intern inquiries
- View announcements from Super Admin
- Real-time notifications (Socket.IO)
- Avatar upload

### 🎓 Intern
- View assigned tasks
- Submit progress updates with file attachments (PDF, Word, etc.)
- Send inquiries to supervisor
- Edit profile — university, hometown, avatar
- Upload CV
- Real-time notifications (Socket.IO)
- Deadline reminder notifications (7 days before due date)

### 🔔 Notifications & Emails
- Welcome email with login credentials on account creation
- Task assignment email + in-app notification
- 7-day deadline reminder email + in-app notification
- Submission received notification (supervisor)
- Inquiry received / reply notifications
- Announcement notifications (supervisors)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Atlas / Local) |
| Real-time | Socket.IO |
| Email | Nodemailer (Gmail SMTP) |
| File Storage | Cloudinary (avatars) · Local disk (attachments, CVs) |
| Containerization | Docker, Docker Compose |
| Scheduling | node-cron |

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ayeshijayarathna/InternPulse.git
cd InternPulse
```

### 2. Create environment files

**`backend/.env`**
```env
MONGO_URI=mongodb://mongodb:27017/InternPulse
JWT_SECRET=your_jwt_secret
PORT=5000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_gmail_app_password

FRONTEND_URL=http://localhost
TZ=Asia/Colombo

SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=superadmin@gmail.com
SUPER_ADMIN_PASSWORD=Admin_password
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_ADMIN_PATH=system/admin
```

### 3. Build and run with Docker

```bash
docker compose up -d --build
```

### 4. Seed the Super Admin

```bash
docker exec internpulse-backend node src/scripts/seed.js
```

### 5. Open in browser

```
http://localhost
```

---

## 📁 Project Structure

```
InternPulse/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, Cloudinary config
│   │   ├── controllers/    # Route controllers
│   │   ├── cron/           # Deadline reminder scheduler
│   │   ├── middleware/      # Auth, file upload
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── scripts/        # Seed script
│   │   ├── services/       # Email, notification services
│   │   └── server.js       # Entry point
│   ├── uploads/            # Local file storage
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth, Notification contexts
│   │   └── pages/          # Dashboard pages per role
│   ├── Dockerfile
│   └── .env
└── docker-compose.yml
```

---

## 🐳 Docker Commands

```bash
# Start all containers
docker compose up -d

# Stop all containers
docker compose down

# Rebuild after code changes
docker compose up -d --build

# View backend logs
docker logs internpulse-backend -f

# Access MongoDB shell
docker exec -it internpulse-mongodb mongosh
```

---

## 📄 License

This project is for educational and demonstration purposes.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/ayeshijayarathna">Ayeshi Jayarathna</a>
</div>
