require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const connectDB  = require('../../src/config/db');
const User       = require('../../src/models/User');
const Project    = require('../../src/models/Project');
const Task       = require('../../src/models/Task');
const TaskUpdate = require('../../src/models/TaskUpdate');
const Announcement = require('../../src/models/Announcement');
const Inquiry    = require('../../src/models/Inquiry');
const RequiredDay = require('../../src/models/RequiredDay');
const Notification = require('../../src/models/Notification');

// ── helpers ──────────────────────────────────────────────────────────────────
const d = (y, m, day) => new Date(y, m - 1, day);
const future = (days) => { const dt = new Date(); dt.setDate(dt.getDate() + days); return dt; };

// ── data ─────────────────────────────────────────────────────────────────────
const SUPERVISORS = [
  { name: 'Bhanuka Aththanayaka',   email: 'bhanuka@internpulse.com',    password: 'Bhanuka@1234!' },
  { name: 'Nipun Perera',           email: 'nipun@internpulse.com'      },
  { name: 'Shashika Ranasinghe',    email: 'shashika@internpulse.com'   },
  { name: 'Tharindu Bandara',       email: 'tharindu@internpulse.com'   },
  { name: 'Hasitha Jayasuriya',     email: 'hasitha@internpulse.com'    },
  { name: 'Dinesh Kumara',          email: 'dinesh@internpulse.com'     },
  { name: 'Sachin Rajapaksa',       email: 'sachin@internpulse.com'     },
  { name: 'Lakmal Fernando',        email: 'lakmal@internpulse.com'     },
  { name: 'Ravindu Silva',          email: 'ravindu@internpulse.com'    },
  { name: 'Amila Weerasinghe',      email: 'amila@internpulse.com'      },
];

const INTERNS = [
  { name: 'Kavinda Perera',       email: 'kavinda@internpulse.com',   university: 'University of Colombo',     github: 'kavinda-dev' },
  { name: 'Dilini Fernando',      email: 'dilini@internpulse.com',    university: 'University of Moratuwa',    github: 'dilini-f' },
  { name: 'Ayeshi I.Jayarathna',  email: 'inuujashi@gmail.com',       university: 'NSBM Green University',     github: 'ayeshi-ij' },
  { name: 'Thisal Karunaratne',   email: 'thisal@internpulse.com',    university: 'University of Peradeniya',  github: 'thisal-k' },
  { name: 'Nethmi Senanayake',    email: 'nethmi@internpulse.com',    university: 'University of Colombo',     github: 'nethmi-s' },
  { name: 'Dishan Jayawardena',   email: 'dishan@internpulse.com',    university: 'University of Moratuwa',    github: 'dishan-j' },
  { name: 'Rashmi Wickramasinghe', email: 'rashmi@internpulse.com',   university: 'SLIIT',                     github: 'rashmi-w' },
  { name: 'Kusal Mendis',         email: 'kusal@internpulse.com',     university: 'NSBM Green University',     github: 'kusal-m' },
  { name: 'Hashini de Silva',     email: 'hashini@internpulse.com',   university: 'University of Kelaniya',    github: 'hashini-ds' },
  { name: 'Milinda Perera',       email: 'milinda@internpulse.com',   university: 'University of Peradeniya',  github: 'milinda-p' },
];

const PROJECTS = [
  { name: 'InternPulse Platform',     description: 'Full-stack MERN platform for managing interns, tasks, submissions and analytics.', status: 'active',   color: '#7c3aed', start: d(2026,2,1),  end: d(2026,8,10) },
  { name: 'Client CRM Dashboard',     description: 'Customer relationship management dashboard with lead tracking and reporting.',     status: 'planning', color: '#3b82f6', start: d(2026,3,1),  end: d(2026,7,31) },
  { name: 'Inventory Management App',  description: 'Real-time inventory tracking system for warehouse operations.',                    status: 'active',   color: '#f97316', start: d(2026,2,15), end: d(2026,6,30) },
  { name: 'E-Learning Portal',         description: 'Online learning platform with course modules, quizzes and progress tracking.',     status: 'completed',color: '#22c55e', start: d(2026,1,10), end: d(2026,4,30) },
  { name: 'Mobile App Backend',        description: 'REST API backend for a cross-platform mobile application.',                         status: 'on-hold',  color: '#ef4444', start: d(2026,4,1),  end: d(2026,9,15) },
];

const SUPER_ADMIN = {
  name:     'Super Admin',
  email:    'superadmin@internpulse.com',
  password: 'Admin@1234!',
};

// ── main ─────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // ── Clear everything ──
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      TaskUpdate.deleteMany({}),
      Announcement.deleteMany({}),
      Inquiry.deleteMany({}),
      RequiredDay.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Cleared all collections');

    // ── 1. Super Admin ──
    const sa = await User.create({
      name:         SUPER_ADMIN.name,
      email:        SUPER_ADMIN.email,
      passwordHash: SUPER_ADMIN.password,
      role:         'super_admin',
      isActive:     true,
    });
    console.log('Super Admin created:', sa.email);

    // ── 2. Supervisors ──
    const supervisors = [];
    for (const s of SUPERVISORS) {
      const user = await User.create({
        name:         s.name,
        email:        s.email,
        passwordHash: s.password || 'Supervisor@1234!',
        role:         'supervisor',
        isActive:     true,
      });
      supervisors.push(user);
    }
    console.log(`${supervisors.length} Supervisors created`);

    const bhanuka = supervisors[0];

    // ── 3. Interns under Bhanuka ──
    const interns = [];
    for (const i of INTERNS) {
      const user = await User.create({
        name:             i.name,
        email:            i.email,
        passwordHash:     'Intern@1234!',
        role:             'intern',
        isActive:         true,
        createdBy:        bhanuka._id,
        university:       i.university,
        githubUsername:    i.github,
        internshipStart:  d(2026, 2, 10),
        internshipEnd:    d(2026, 8, 10),
      });
      interns.push(user);
    }
    console.log(`${interns.length} Interns created under Bhanuka`);

    // ── 4. Projects under Bhanuka (all 10 interns assigned, 2 each) ──
    const projects = [];
    for (let idx = 0; idx < PROJECTS.length; idx++) {
      const p = PROJECTS[idx];
      const assigned = interns.slice(idx * 2, idx * 2 + 2);
      const project = await Project.create({
        name:                    p.name,
        description:             p.description,
        createdBy:               bhanuka._id,
        assignedInterns:         assigned.map(i => i._id),
        status:                  p.status,
        startDate:               p.start,
        endDate:                 p.end,
        color:                   p.color,
        githubLink:              `https://github.com/bhanuka/${p.name.toLowerCase().replace(/\s+/g, '-')}`,
        supervisorGithubUsername: 'bhanuka-dev',
      });
      projects.push(project);
    }
    console.log(`${projects.length} Projects created under Bhanuka`);

    // ── 5. Tasks (linked to projects + interns) ──
    const TASKS = [
      // Project 0 – InternPulse Platform
      { title: 'Fix authentication bug',            desc: 'Resolve login timeout issue for intern portal.',              priority: 'high',   status: 'completed', proj: 0, assignees: [0, 1], due: -2 },
      { title: 'Add project filter to tasks',       desc: 'Implement project-wise filtering on the tasks page.',        priority: 'medium', status: 'in-progress', proj: 0, assignees: [2, 3], due: 5 },
      { title: 'Write unit tests for API',           desc: 'Cover auth, tasks, and submissions controllers.',            priority: 'medium', status: 'pending',    proj: 0, assignees: [0, 2], due: 14 },
      // Project 1 – Client CRM Dashboard
      { title: 'Design lead management UI',          desc: 'Create wireframes and Figma mockups.',                       priority: 'high',   status: 'completed', proj: 1, assignees: [4, 5], due: -5 },
      { title: 'Implement lead API endpoints',       desc: 'CRUD operations for leads with filtering.',                  priority: 'medium', status: 'in-progress', proj: 1, assignees: [4, 5], due: 7 },
      // Project 2 – Inventory Management App
      { title: 'Set up barcode scanning',            desc: 'Integrate barcode scanner library for product entry.',       priority: 'high',   status: 'in-progress', proj: 2, assignees: [6, 7], due: 3 },
      { title: 'Build stock alert system',           desc: 'Email alerts when stock drops below threshold.',             priority: 'low',    status: 'pending',    proj: 2, assignees: [6, 7], due: 21 },
      // Project 3 – E-Learning Portal
      { title: 'Finalize quiz module',               desc: 'Complete MCQ quiz engine with timer.',                       priority: 'medium', status: 'completed', proj: 3, assignees: [8, 9], due: -10 },
      { title: 'Deploy to production',               desc: 'Deploy to AWS EC2 and configure domain.',                    priority: 'high',   status: 'completed', proj: 3, assignees: [8, 9], due: -3 },
      // Project 4 – Mobile App Backend
      { title: 'Design database schema',             desc: 'Define MongoDB collections for mobile API.',                priority: 'medium', status: 'pending',    proj: 4, assignees: [0, 9], due: 30 },
    ];

    const tasks = [];
    for (const t of TASKS) {
      const task = await Task.create({
        title:       t.title,
        description: t.desc,
        createdBy:   bhanuka._id,
        assignedTo:  t.assignees.map(i => interns[i]._id),
        priority:    t.priority,
        status:      t.status,
        dueDate:     future(t.due),
        projectId:   projects[t.proj]._id,
      });
      tasks.push(task);
    }
    console.log(`${tasks.length} Tasks created`);

    // ── 6. Submissions / Task Updates ──
    const UPDATES = [
      { intern: 0, type: 'update',    content: 'Fixed the login timeout issue. Token refresh now works correctly across all routes.',                           task: 0, proj: 0 },
      { intern: 1, type: 'update',    content: 'Reviewed and tested the authentication fix. All edge cases covered. Ready for QA.',                              task: 0, proj: 0 },
      { intern: 2, type: 'update',    content: 'Started working on project filter UI. Dropdown and tab components are complete.',                                task: 1, proj: 0 },
      { intern: 3, type: 'self_task', content: 'Reading documentation on React Query for state management in the task filtering feature.',                      task: null, proj: null },
      { intern: 4, type: 'update',    content: 'Completed wireframes for lead management. Shared Figma link with the team for review.',                         task: 3, proj: 1 },
      { intern: 5, type: 'update',    content: 'Working on the lead API. GET and POST endpoints are done. PATCH is in progress.',                                task: 4, proj: 1 },
      { intern: 6, type: 'update',    content: 'Integrated ZXing barcode scanner library. Camera-based scanning is working on mobile.',                          task: 5, proj: 2 },
      { intern: 7, type: 'self_task', content: 'Testing barcode scanning on different devices. Found some Android compatibility issues to fix.',                  task: null, proj: null },
      { intern: 8, type: 'update',    content: 'Quiz module is fully functional. Timer, scoring, and result display are all implemented.',                       task: 7, proj: 3 },
      { intern: 9, type: 'update',    content: 'Production deployment is live. DNS configured and SSL certificate installed successfully.',                    task: 8, proj: 3 },
      { intern: 0, type: 'update',    content: 'Started on the task filter backend. Created GET /tasks endpoint with projectId query param.',                  task: 1, proj: 0 },
      { intern: 1, type: 'self_task', content: 'Working on accessibility improvements for the intern dashboard. ARIA labels added to all interactive elements.', task: null, proj: null },
    ];

    const updates = [];
    for (const u of UPDATES) {
      const update = await TaskUpdate.create({
        createdBy: interns[u.intern]._id,
        type:      u.type,
        content:   u.content,
        taskId:    u.task !== null ? tasks[u.task]._id : null,
        projectId: u.proj !== null ? projects[u.proj]._id : null,
        locked:    true,
      });
      updates.push(update);
    }
    console.log(`${updates.length} Submissions created`);

    // ── 7. Announcements ──
    const ANNOUNCEMENTS = [
      { title: 'Welcome to InternPulse 2026',       content: 'We are excited to have all interns onboard. Please complete your profile setup by end of this week.', priority: 'high' },
      { title: 'Office Hours Reminder',              content: 'Regular office hours are 9:00 AM – 5:00 PM. Please ensure attendance on required office days.',          priority: 'medium' },
      { title: 'Code Review Guidelines',             content: 'All pull requests must have at least one supervisor approval before merging. Follow the coding standards.', priority: 'medium' },
      { title: 'Monthly Evaluation Schedule',        content: 'First monthly evaluation will be conducted on March 15, 2026. Prepare your progress reports.',            priority: 'high' },
      { title: 'Holiday Notice – April 14',          content: 'April 14 is a public holiday (Sinhala & Tamil New Year). Office will be closed.',                       priority: 'low' },
      { title: 'Hackathon Event – May 20',           content: 'Join our internal hackathon! Teams of 3-4. Registration closes May 10. Great prizes to be won.',         priority: 'medium' },
      { title: 'Updated Submission Policy',          content: 'All submissions must include a project assignment. Updates without project linkage will not be counted.', priority: 'high' },
      { title: 'GitHub Organization Invitation',     content: 'All interns must join the GitHub organization. Check your email for the invitation link.',                 priority: 'medium' },
      { title: 'Internship Completion Certificates', content: 'Certificates will be issued upon successful completion of the internship period and all required tasks.', priority: 'low' },
      { title: 'New Mentorship Program',             content: 'Starting June, each intern will be paired with a senior developer for 1-on-1 mentorship sessions.',        priority: 'medium' },
    ];

    const announcements = [];
    for (const a of ANNOUNCEMENTS) {
      const ann = await Announcement.create({
        title:     a.title,
        content:   a.content,
        priority:  a.priority,
        createdBy: sa._id,
      });
      announcements.push(ann);
    }
    console.log(`${announcements.length} Announcements created`);

    // ── 8. Inquiries (intern → supervisor) ──
    const INQUIRIES = [
      { intern: 0, subject: 'Task deadline extension',    message: 'Can I get a 3-day extension for the authentication fix task? I found additional issues.', status: 'replied',
        replies: [{ sender: bhanuka._id, message: 'Approved. Please ensure all edge cases are covered in the extended time.' }] },
      { intern: 2, subject: 'Project filter guidance',   message: 'I need some guidance on implementing the project filter. Should I use URL params or state?', status: 'replied',
        replies: [{ sender: bhanuka._id, message: 'Use React state for the filter. URL params can be added later for shareability.' }] },
      { intern: 4, subject: 'Figma access request',      message: 'Could you share edit access to the Figma file for the CRM dashboard?', status: 'replied',
        replies: [{ sender: bhanuka._id, message: 'Access granted. Check your email for the Figma invitation.' }] },
      { intern: 6, subject: 'Barcode library issue',     message: 'The ZXing library has compatibility issues on older Android devices. Should I use an alternative?', status: 'open', replies: [] },
      { intern: 8, subject: 'Quiz timer bug',            message: 'The quiz timer sometimes resets when switching browser tabs. How should I fix this?', status: 'replied',
        replies: [{ sender: bhanuka._id, message: 'Use Web Workers or Page Visibility API to handle tab switching.' }] },
    ];

    const inquiries = [];
    for (const inq of INQUIRIES) {
      const inquiry = await Inquiry.create({
        subject:   inq.subject,
        message:   inq.message,
        createdBy: interns[inq.intern]._id,
        supervisor: bhanuka._id,
        type:      'intern',
        status:    inq.status,
        replies:   inq.replies.map(r => ({ sender: r.sender, message: r.message })),
      });
      inquiries.push(inquiry);
    }
    console.log(`${inquiries.length} Inquiries created`);

    // ── 9. Admin Inquiries (super admin ↔ supervisor) ──
    const ADMIN_INQUIRIES = [
      { supervisor: 1, subject: 'Intern performance report', message: 'Please submit the monthly performance report for your interns by the 5th of each month.', status: 'replied',
        replies: [{ sender: bhanuka._id, message: 'Understood. I will submit the reports on time going forward.' }] },
      { supervisor: 2, subject: 'Project milestone update',  message: 'Provide an update on all active project milestones for the board meeting.', status: 'open', replies: [] },
    ];

    for (const aq of ADMIN_INQUIRIES) {
      await Inquiry.create({
        subject:    aq.subject,
        message:    aq.message,
        createdBy:  sa._id,
        targetAdmin: sa._id,
        supervisor: supervisors[aq.supervisor]._id,
        type:       'admin',
        status:     aq.status,
        replies:    aq.replies.map(r => ({ sender: r.sender, message: r.message })),
      });
    }
    console.log('Admin inquiries created');

    // ── 10. Required Office Days ──
    const REQUIRED_DAYS = [];
    for (let i = 0; i < 8; i++) {
      const dayDate = future(i * 2 + 1);
      // assign 3-4 random interns
      const assignedInterns = interns.slice(i % 6, i % 6 + 3);
      for (const intern of assignedInterns) {
        const isUnavailable = Math.random() > 0.8;
        REQUIRED_DAYS.push({
          date:              dayDate,
          intern:            intern._id,
          supervisor:        bhanuka._id,
          status:            isUnavailable ? 'unavailable' : 'confirmed',
          unavailableReason: isUnavailable ? 'Doctor appointment scheduled' : null,
          supervisorReply:   isUnavailable ? 'Noted. Please submit a medical certificate.' : null,
        });
      }
    }
    await RequiredDay.insertMany(REQUIRED_DAYS);
    console.log(`${REQUIRED_DAYS.length} Required Office Days created`);

    // ── 11. Notifications ──
    const NOTIFS = [];
    // Welcome notifications for all interns
    for (const intern of interns) {
      NOTIFS.push({
        recipient: intern._id,
        type:      'welcome',
        title:     'Welcome to InternPulse!',
        message:   `Welcome ${intern.name}! Your account has been set up. Please complete your profile.`,
      });
    }
    // Submission received notifications for supervisor
    for (let i = 0; i < 5; i++) {
      NOTIFS.push({
        recipient: bhanuka._id,
        type:      'submission_received',
        title:     'New Submission Received',
        message:   `${interns[i].name} submitted an update.`,
        updateId:  updates[i]._id,
      });
    }
    // Inquiry notifications
    for (let i = 0; i < 3; i++) {
      NOTIFS.push({
        recipient: bhanuka._id,
        type:      'inquiry_received',
        title:     'New Inquiry',
        message:   `${interns[INQUIRIES[i].intern].name} sent an inquiry: "${INQUIRIES[i].subject}"`,
        inquiryId: inquiries[i]._id,
      });
    }
    // Announcement notifications for supervisor
    for (let i = 0; i < 3; i++) {
      NOTIFS.push({
        recipient: bhanuka._id,
        type:      'announcement',
        title:     'New Announcement',
        message:   `New announcement: "${ANNOUNCEMENTS[i].title}"`,
        announcementId: announcements[i]._id,
      });
    }
    // Project assigned notifications
    for (const intern of interns.slice(0, 6)) {
      NOTIFS.push({
        recipient: intern._id,
        type:      'project_assigned',
        title:     'New Project Assigned',
        message:   `You have been assigned to a new project by ${bhanuka.name}.`,
        projectId: projects[0]._id,
      });
    }
    // Task assigned notifications
    for (let i = 0; i < 4; i++) {
      for (const aIdx of tasks[i].assignedTo) {
        NOTIFS.push({
          recipient: aIdx,
          type:      'task_assigned',
          title:     'New Task Assigned',
          message:   `You have been assigned: "${tasks[i].title}"`,
          taskId:    tasks[i]._id,
        });
      }
    }
    // Required day notifications
    for (let i = 0; i < 3; i++) {
      NOTIFS.push({
        recipient: REQUIRED_DAYS[i].intern,
        type:      'required_day_assigned',
        title:     'Required Office Day',
        message:   `You are required in office on ${REQUIRED_DAYS[i].date.toDateString()}.`,
        requiredDayId: null,
      });
    }
    await Notification.insertMany(NOTIFS);
    console.log(`${NOTIFS.length} Notifications created`);

    // ── Summary ──
    console.log('\n========== SEED COMPLETE ==========');
    console.log(`Super Admin : 1  (${SUPER_ADMIN.email})`);
    console.log(`Supervisors : ${supervisors.length}`);
    console.log(`Interns     : ${interns.length}`);
    console.log(`Projects    : ${projects.length}`);
    console.log(`Tasks       : ${tasks.length}`);
    console.log(`Submissions : ${updates.length}`);
    console.log(`Announcements: ${announcements.length}`);
    console.log(`Inquiries   : ${inquiries.length}`);
    console.log(`Required Days: ${REQUIRED_DAYS.length}`);
    console.log(`Notifications: ${NOTIFS.length}`);
    console.log('\nLogin credentials:');
    console.log(`  Super Admin : ${SUPER_ADMIN.email} / ${SUPER_ADMIN.password}`);
    console.log(`  Supervisor  : bhanuka@internpulse.com / Supervisor@1234!`);
    console.log(`  Intern      : kavinda@internpulse.com / Intern@1234!`);
    console.log('====================================');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
