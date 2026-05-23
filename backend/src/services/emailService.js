const nodemailer = require('nodemailer');

//------------------Transporter--------------------------------
const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === 'true', // true for 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

//---------------------------Base HTML template wrapper----------------------------------
const htmlWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { margin:0; padding:0; background:#0f172a; font-family:'Segoe UI',sans-serif; color:#e2e8f0; }
    .container { max-width:600px; margin:32px auto; background:#1e293b; border-radius:16px; overflow:hidden; border:1px solid #334155; }
    .header { background:linear-gradient(135deg,#f97316,#fb923c); padding:32px 40px; text-align:center; }
    .header h1 { margin:0; color:#fff; font-size:24px; letter-spacing:1px; }
    .header p  { margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:14px; }
    .body  { padding:32px 40px; }
    .body p { margin:0 0 16px; line-height:1.7; color:#cbd5e1; font-size:15px; }
    .badge { display:inline-block; padding:4px 12px; border-radius:8px; font-size:12px; font-weight:700; }
    .card  { background:#0f172a; border:1px solid #334155; border-radius:12px; padding:20px 24px; margin:20px 0; }
    .card p { margin:6px 0; font-size:14px; }
    .card .label { color:#94a3b8; font-size:12px; text-transform:uppercase; letter-spacing:.5px; }
    .card .value { color:#f1f5f9; font-weight:600; font-size:15px; }
    .btn { display:inline-block; margin-top:24px; padding:12px 32px; background:linear-gradient(135deg,#f97316,#fb923c); color:#000; font-weight:700; border-radius:10px; text-decoration:none; font-size:14px; }
    .footer { padding:20px 40px; border-top:1px solid #334155; text-align:center; }
    .footer p { margin:0; color:#64748b; font-size:12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ InternPulse</h1>
      <p>Intern Management Platform</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer"><p>© ${new Date().getFullYear()} InternPulse. This is an automated message.</p></div>
  </div>
</body>
</html>`;

//-------- 1. Welcome / credentials mail (sent when intern is created)---------
const sendWelcomeMail = async ({ name, email, password }) => {
  const html = htmlWrapper(`
    <p>Hi <strong style="color:#f97316">${name}</strong> 👋</p>
    <p>Your InternPulse account has been created. Here are your login credentials:</p>
    <div class="card">
      <p><span class="label">Email</span><br/><span class="value">${email}</span></p>
      <p><span class="label">Password</span><br/><span class="value">${password}</span></p>
    </div>
    <p>Please log in and change your password as soon as possible.</p>
    <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login">Log In Now →</a>
  `);

  return transporter.sendMail({
    from:    `"InternPulse" <${process.env.MAIL_USER}>`,
    to:      email,
    subject: '🎉 Welcome to InternPulse – Your Login Credentials',
    html,
  });
};

//---------2. Task assigned mail-----------------
const sendTaskAssignedMail = async ({ internName, internEmail, taskTitle, taskDescription, dueDate, priority }) => {
  const priorityColor = { high: '#ef4444', medium: '#f97316', low: '#22c55e' }[priority] || '#94a3b8';

  const html = htmlWrapper(`
    <p>Hi <strong style="color:#f97316">${internName}</strong>,</p>
    <p>A new task has been assigned to you:</p>
    <div class="card">
      <p><span class="label">Task</span><br/><span class="value">${taskTitle}</span></p>
      ${taskDescription ? `<p><span class="label">Description</span><br/><span class="value">${taskDescription}</span></p>` : ''}
      <p><span class="label">Priority</span><br/>
        <span class="badge" style="background:${priorityColor}22;color:${priorityColor};border:1px solid ${priorityColor}44">${priority?.toUpperCase()}</span>
      </p>
      ${dueDate ? `<p><span class="label">Due Date</span><br/><span class="value">📅 ${new Date(dueDate).toDateString()}</span></p>` : ''}
    </div>
    <p>Log in to your dashboard to view full details and get started.</p>
    <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/intern/dashboard">View Task →</a>
  `);

  return transporter.sendMail({
    from:    `"InternPulse" <${process.env.MAIL_USER}>`,
    to:      internEmail,
    subject: `📋 New Task Assigned: ${taskTitle}`,
    html,
  });
};

// ------------- 3. Deadline reminder mail (7 days before)----------------
const sendDeadlineReminderMail = async ({ internName, internEmail, taskTitle, dueDate }) => {
  const html = htmlWrapper(`
    <p>Hi <strong style="color:#f97316">${internName}</strong>,</p>
    <p>This is a friendly reminder that the following task deadline is coming up in <strong style="color:#ef4444">7 days</strong>:</p>
    <div class="card">
      <p><span class="label">Task</span><br/><span class="value">${taskTitle}</span></p>
      <p><span class="label">Due Date</span><br/><span class="value">⏰ ${new Date(dueDate).toDateString()}</span></p>
    </div>
    <p>Please ensure your work is submitted on time.</p>
    <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/intern/dashboard">View My Tasks →</a>
  `);

  return transporter.sendMail({
    from:    `"InternPulse" <${process.env.MAIL_USER}>`,
    to:      internEmail,
    subject: `⏰ Reminder: "${taskTitle}" is due in 7 days`,
    html,
  });
};

module.exports = { sendWelcomeMail, sendTaskAssignedMail, sendDeadlineReminderMail };
