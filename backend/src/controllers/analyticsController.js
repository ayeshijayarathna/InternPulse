const Task = require('../models/Task');
const TaskUpdate = require('../models/TaskUpdate');
const User = require('../models/User');
const Project = require('../models/Project');
const Announcement = require('../models/Announcement');
const Inquiry = require('../models/Inquiry');

const getSupervisorAnalytics = async (req, res) => {
  try {
    const supervisorId = req.user._id;

    const interns = await User.find({ role: 'intern', createdBy: supervisorId });
    const internIds = interns.map((i) => i._id);

    const tasks = await Task.find({ createdBy: supervisorId });
    const updates = await TaskUpdate.find({ createdBy: { $in: internIds } });
    const projects = await Project.find({ createdBy: supervisorId });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
    const totalSubmissions = updates.length;
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const totalInterns = interns.length;

    const highPriorityTasks = tasks.filter((t) => t.priority === 'high').length;
    const mediumPriorityTasks = tasks.filter((t) => t.priority === 'medium').length;
    const lowPriorityTasks = tasks.filter((t) => t.priority === 'low').length;

    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
    ).length;

    const tasksByMonth = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthTasks = tasks.filter((t) => {
        const created = new Date(t.createdAt);
        return created >= d && created < nextMonth;
      });
      const monthUpdates = updates.filter((u) => {
        const created = new Date(u.createdAt);
        return created >= d && created < nextMonth;
      });
      tasksByMonth.push({
        month: monthNames[d.getMonth()],
        tasks: monthTasks.length,
        submissions: monthUpdates.length,
        completed: monthTasks.filter((t) => t.status === 'completed').length,
      });
    }

    const submissionsByIntern = interns.map((intern) => {
      const internUpdates = updates.filter((u) => String(u.createdBy) === String(intern._id));
      return {
        name: intern.name.split(' ')[0],
        submissions: internUpdates.length,
        tasks: tasks.filter((t) => t.assignedTo.some((id) => String(id) === String(intern._id))).length,
      };
    });

    const projectProgress = projects.map((project) => {
      const projectTasks = tasks.filter((t) => String(t.projectId) === String(project._id));
      const completed = projectTasks.filter((t) => t.status === 'completed').length;
      return {
        name: project.name,
        total: projectTasks.length,
        completed,
        progress: projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0,
        color: project.color,
      };
    });

    const dailyActivity = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayTasks = tasks.filter((t) => {
        const created = new Date(t.createdAt);
        return created >= d && created < nextDay;
      });
      const dayUpdates = updates.filter((u) => {
        const created = new Date(u.createdAt);
        return created >= d && created < nextDay;
      });

      dailyActivity.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        tasks: dayTasks.length,
        submissions: dayUpdates.length,
      });
    }

    const taskStatusDistribution = [
      { name: 'Pending', value: pendingTasks, color: '#f59e0b' },
      { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
      { name: 'Completed', value: completedTasks, color: '#10b981' },
    ];

    const priorityDistribution = [
      { name: 'High', value: highPriorityTasks, color: '#ef4444' },
      { name: 'Medium', value: mediumPriorityTasks, color: '#f59e0b' },
      { name: 'Low', value: lowPriorityTasks, color: '#10b981' },
    ];

    const projectStatusDistribution = [
      { name: 'Planning', value: projects.filter((p) => p.status === 'planning').length, color: '#8b5cf6' },
      { name: 'Active', value: activeProjects, color: '#10b981' },
      { name: 'On Hold', value: projects.filter((p) => p.status === 'on-hold').length, color: '#f59e0b' },
      { name: 'Completed', value: projects.filter((p) => p.status === 'completed').length, color: '#3b82f6' },
    ];

    res.json({
      overview: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        totalSubmissions,
        totalProjects,
        activeProjects,
        totalInterns,
        highPriorityTasks,
        overdueTasks,
      },
      tasksByMonth,
      submissionsByIntern,
      projectProgress,
      dailyActivity,
      taskStatusDistribution,
      priorityDistribution,
      projectStatusDistribution,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getSupervisorAnalytics };
