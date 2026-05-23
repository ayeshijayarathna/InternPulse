const cron = require('node-cron');
const Task  = require('../models/Task');
const User  = require('../models/User');
const { sendDeadlineReminderMail } = require('../services/emailService');
const { createNotification }       = require('../services/notificationService');

//Runs every day at 08:00 AM 
const startDeadlineReminderCron = (io) => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running 7-day deadline reminder check…');

    try {
      const now      = new Date();
      const in7Days  = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Window: tasks due between tomorrow and 7 days from now (to avoid re-sending same day)
      const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

      // Tasks that:
      //  - have a dueDate within [tomorrow, in7Days]
      //  - are not yet completed
      //  - have at least one assigned intern
      const tasks = await Task.find({
        dueDate:    { $gte: tomorrow, $lte: in7Days },
        status:     { $ne: 'completed' },
        assignedTo: { $exists: true, $not: { $size: 0 } },
      }).populate('assignedTo', 'name email');

      for (const task of tasks) {
        for (const intern of task.assignedTo) {
          // Email
          await sendDeadlineReminderMail({
            internName:  intern.name,
            internEmail: intern.email,
            taskTitle:   task.title,
            dueDate:     task.dueDate,
          }).catch(err => console.error('Deadline mail error:', err));

          // In-app notification
          await createNotification(io, {
            recipient: intern._id,
            type:      'task_deadline',
            title:     '⏰ Task Deadline Reminder',
            message:   `"${task.title}" is due in 7 days (${new Date(task.dueDate).toDateString()}).`,
            taskId:    task._id,
          });
        }
      }

      console.log(`[CRON] Sent reminders for ${tasks.length} task(s).`);
    } catch (err) {
      console.error('[CRON] Deadline reminder error:', err);
    }
  }, {
    timezone: process.env.TZ || 'Asia/Colombo',
  });

  console.log('[CRON] Deadline reminder scheduler started ✅');
};

module.exports = { startDeadlineReminderCron };
