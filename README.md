<div align="center">

# ⚡ InternPulse

**A full-stack intern management platform built with the MERN stack**

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

</div>

---

## 📌 Overview

InternPulse is a full-stack intern management platform designed for real-world deployment. It supports three user roles — **Super Admin**, **Supervisor**, and **Intern** — each with their own dedicated dashboard, feature set, and theming.

---

## ✨ Features

### 👑 Super Admin Dashboard
- Create, edit, and manage supervisors (with toggle active/inactive)
- Post announcements to all supervisors
- View interns under each supervisor with detailed profiles
- View and reply to supervisor inquiries
- Platform-wide analytics with interactive charts (Recharts)
- Export data as CSV or PDF reports (Supervisors, Interns, Tasks)
- Red+yellow themed dashboard with notification bell

### 🧑‍💼 Supervisor Dashboard
- Create and manage interns (with internship dates, CV upload)
- Create and manage projects (with color, description, GitHub repo, assigned interns)
- Assign tasks to interns with priority, due dates, status, and project linking
- View and manage submissions with Completed/Pending status toggle
- View and download intern CVs and submission attachments
- Reply to intern inquiries and manage inquiry status (Open/Replied/Closed)
- View announcements from Super Admin
- Send inquiries directly to Super Admin
- Assign and manage required days for interns
- Teal themed dashboard with analytics charts
- Real-time notifications (Socket.IO)

### 🎓 Intern Dashboard
- View assigned tasks with project context
- Submit progress updates with file attachments (PDF, Word, images)
- View submission status (Completed/Pending)
- Send inquiries to supervisor
- Edit profile — university, hometown, avatar, GitHub username
- Upload CV
- View required days assigned by supervisor
- Record book (PDF download)
- First-time welcome popup guide
- Violet themed dashboard with notification bell

### 🔔 Notifications & Emails
- Welcome email with login credentials on account creation
- Task assignment email + in-app notification (with GitHub links)
- 7-day deadline reminder email + in-app notification (via node-cron)
- Submission received notification (supervisor)
- Project assignment notification + email
- Inquiry received / reply notifications (supervisor ↔ intern)
- Supervisor → Super Admin inquiry notifications
- Required day assignment notifications
- Toast notifications for all user actions (success/error, 3s auto-dismiss)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Recharts |
| Backend | Node.js, Express 5 |
| Database | MongoDB 7 (via Docker) |
| Real-time | Socket.IO |
| Email | Nodemailer (Gmail SMTP) |
| File Storage | Cloudinary (avatars) · Local disk via Multer (attachments, CVs) |
| PDF Generation | jsPDF + jspdf-autotable (frontend), pdfkit (backend Record Book) |
| Containerization | Docker, Docker Compose |
| Scheduling | node-cron (deadline reminders) |

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### 1. Clone the repository

```bash
git clone https://github.com/your-username/InternPulse.git
cd InternPulse
```

### 2. Create environment files

**`backend/.env`**

```env
MONGO_URI=mongodb://mongodb:27017/InternPulse
JWT_SECRET=your_jwt_secret_key_here
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

SUPER_ADMIN_NAME=Your Name
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=your_secure_password
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

This starts three containers:
- `internpulse-mongodb` — MongoDB on port `27017`
- `internpulse-backend` — Express API on port `5000`
- `internpulse-frontend` — Nginx serving React on port `80`

### 4. Seed the database

```bash
# Seed Super Admin + Supervisor + 10 interns
docker exec internpulse-backend node src/scripts/seed.js

# Seed 21 additional interns across other supervisors
docker exec internpulse-backend node src/scripts/seedOtherInterns.js
```

### 5. Open in browser

```
http://localhost
```

The Super Admin account is created automatically from the `SUPER_ADMIN_*` values in your `backend/.env`. Supervisors and Interns are created from within the app.

---

## 📁 Project Structure

```
InternPulse/
├── backend/
│   ├── src/
│   │   ├── config/             # MongoDB connection, Cloudinary config
│   │   ├── controllers/        # Route controllers (12 files)
│   │   │   ├── authController.js
│   │   │   ├── superAdminController.js
│   │   │   ├── taskController.js
│   │   │   ├── updateController.js
│   │   │   ├── projectController.js
│   │   │   ├── inquiryController.js
│   │   │   ├── announcementController.js
│   │   │   ├── notificationController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── recordBookController.js
│   │   │   ├── requiredDayController.js
│   │   │   └── userController.js
│   │   ├── cron/               # Deadline reminder scheduler
│   │   │   └── deadlineReminder.js
│   │   ├── middleware/          # Auth middleware, file upload (Multer)
│   │   ├── models/             # Mongoose models (9 models)
│   │   │   ├── User.js
│   │   │   ├── Task.js
│   │   │   ├── TaskUpdate.js
│   │   │   ├── Project.js
│   │   │   ├── Inquiry.js
│   │   │   ├── Announcement.js
│   │   │   ├── Notification.js
│   │   │   ├── RecordBook.js
│   │   │   └── RequiredDay.js
│   │   ├── routes/             # Express routes (12 files)
│   │   ├── scripts/            # Seed scripts
│   │   │   ├── seed.js
│   │   │   └── seedOtherInterns.js
│   │   ├── services/           # Email service (Nodemailer)
│   │   └── server.js           # Express + Socket.IO entry point
│   ├── uploads/                # Local file storage
│   │   ├── attachments/        # Submission attachments
│   │   └── cvs/                # Intern CVs
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   ├── images/             # Logo
│   │   └── videos/             # Login background videos
│   ├── src/
│   │   ├── api/                # Axios instance with auth interceptor
│   │   ├── components/         # Reusable components
│   │   ├── context/            # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── index.css           # CSS custom properties, light/dark mode
│   │   └── pages/
│   │       ├── auth/           # Login pages (3 roles)
│   │       │   ├── SuperAdminLogin.jsx
│   │       │   ├── Adminlogin.jsx
│   │       │   └── Internlogin.jsx
│   │       ├── superadmin/     # Super Admin dashboard
│   │       │   ├── Dashboard.jsx
│   │       │   └── sections/
│   │       ├── supervisor/     # Supervisor dashboard
│   │       │   ├── Dashboard.jsx
│   │       │   └── sections/   # 11 section pages
│   │       └── intern/         # Intern dashboard
│   │           ├── Dashboard.jsx
│   │           └── sections/   # 6 section pages
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── docker-compose.yml
├── .gitignore
└── README.md
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

# View frontend logs
docker logs internpulse-frontend -f

# Access MongoDB shell
docker exec -it internpulse-mongodb mongosh

# Run seed scripts
docker exec internpulse-backend node src/scripts/seed.js
docker exec internpulse-backend node src/scripts/seedOtherInterns.js

# Restart a single service
docker compose restart backend
docker compose restart frontend
```

---

## 📡 API Routes

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/register` | Register new user |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/interns` | Supervisor | List interns |
| POST | `/api/users/intern` | Supervisor | Create intern |
| PATCH | `/api/users/intern/:id` | Supervisor | Update intern |
| PATCH | `/api/users/intern/:id/toggle` | Supervisor | Toggle active/inactive |
| DELETE | `/api/users/intern/:id` | Supervisor | Delete intern |
| GET | `/api/users/intern/:id/cv` | Supervisor | Download intern CV |

### Tasks
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/tasks` | Supervisor | List all tasks |
| POST | `/api/tasks` | Supervisor | Create task |
| PATCH | `/api/tasks/:id` | Supervisor | Update task |
| DELETE | `/api/tasks/:id` | Supervisor | Delete task |
| GET | `/api/tasks/my` | Intern | Get assigned tasks |

### Task Updates (Submissions)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/updates` | Supervisor | List all submissions |
| GET | `/api/updates/my` | Intern | List my submissions |
| POST | `/api/updates` | Intern | Create submission |
| PATCH | `/api/updates/:id/status` | Supervisor | Mark complete/pending |

### Projects
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | Supervisor | List all projects |
| GET | `/api/projects/my` | Intern | Get assigned projects |
| POST | `/api/projects` | Supervisor | Create project |
| PATCH | `/api/projects/:id` | Supervisor | Update project |
| DELETE | `/api/projects/:id` | Supervisor | Delete project |

### Inquiries
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/inquiries/my` | Intern | My inquiries |
| POST | `/api/inquiries` | Intern | Create inquiry |
| PATCH | `/api/inquiries/:id` | Intern | Update inquiry |
| DELETE | `/api/inquiries/:id` | Intern | Delete inquiry |
| POST | `/api/inquiries/:id/reply` | Supervisor | Reply to inquiry |
| PATCH | `/api/inquiries/:id/status` | Supervisor | Close inquiry |
| GET | `/api/inquiries/admin/mine` | Supervisor/Admin | Admin inquiries |
| POST | `/api/inquiries/admin` | Super Admin | Create admin inquiry |
| POST | `/api/inquiries/admin/from-supervisor` | Supervisor | Inquiry to Super Admin |

### Announcements
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/announcements` | Supervisor | List announcements |
| POST | `/api/announcements` | Super Admin | Create announcement |
| PATCH | `/api/announcements/:id` | Super Admin | Update announcement |
| DELETE | `/api/announcements/:id` | Super Admin | Delete announcement |

### Notifications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | Any | Get my notifications |
| PATCH | `/api/notifications/:id/read` | Any | Mark as read |
| PATCH | `/api/notifications/read-all` | Any | Mark all as read |

### Analytics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics` | Any | Dashboard analytics |

### Super Admin Reports
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/super-admin/reports/supervisors` | Super Admin | CSV: Supervisors |
| GET | `/api/super-admin/reports/interns` | Super Admin | CSV: Interns |
| GET | `/api/super-admin/reports/tasks` | Super Admin | CSV: Tasks |
| GET | `/api/super-admin/reports-json/supervisors` | Super Admin | JSON: Supervisors (for PDF) |
| GET | `/api/super-admin/reports-json/interns` | Super Admin | JSON: Interns (for PDF) |
| GET | `/api/super-admin/reports-json/tasks` | Super Admin | JSON: Tasks (for PDF) |

### Required Days
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/required-days` | Any | List required days |
| POST | `/api/required-days` | Supervisor | Assign required day |
| PATCH | `/api/required-days/:id` | Intern | Reply to required day |
| DELETE | `/api/required-days/:id` | Supervisor | Delete required day |

### Record Book
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/record-book` | Intern | Get record book data |
| GET | `/api/record-book/pdf` | Intern | Download record book PDF |

---

## 🎨 Theming

Each role has its own color scheme:

| Role | Primary | Secondary | Accent |
|---|---|---|---|
| Super Admin | `#dc2626` (red) | `#f59e0b` (yellow) | `#ef4444` |
| Supervisor | `#059669` (green) | `#0891b2` (teal) | `#34d399` |
| Intern | `#7c3aed` (violet) | `#2563eb` (blue) | `#a78bfa` |

All dashboards support **dark mode** (default) and **light mode** via the theme toggle. Login pages use role-specific background videos.

---

## 📜 License

This project is for educational and demonstration purposes.
