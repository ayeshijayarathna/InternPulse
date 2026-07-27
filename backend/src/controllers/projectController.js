const Project = require('../models/Project');
const Task = require('../models/Task');
const TaskUpdate = require('../models/TaskUpdate');
const User = require('../models/User');

const createProject = async (req, res) => {
  try {
    const { name, description, assignedInterns, status, startDate, endDate, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    if (assignedInterns && assignedInterns.length > 0) {
      const validCount = await User.countDocuments({
        _id: { $in: assignedInterns },
        role: 'intern',
        createdBy: req.user._id,
      });
      if (validCount !== assignedInterns.length) {
        return res.status(400).json({ message: 'One or more selected interns are invalid' });
      }
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      assignedInterns: assignedInterns || [],
      status: status || 'planning',
      startDate: startDate || null,
      endDate: endDate || null,
      color: color || '#7c3aed',
    });

    await project.populate('assignedInterns', 'name email avatar');
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user._id })
      .populate('assignedInterns', 'name email avatar')
      .sort('-createdAt');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, createdBy: req.user._id })
      .populate('assignedInterns', 'name email avatar');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description, assignedInterns, status, startDate, endDate, color } = req.body;

    if (assignedInterns && assignedInterns.length > 0) {
      const validCount = await User.countDocuments({
        _id: { $in: assignedInterns },
        role: 'intern',
        createdBy: req.user._id,
      });
      if (validCount !== assignedInterns.length) {
        return res.status(400).json({ message: 'One or more selected interns are invalid' });
      }
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { name, description, assignedInterns, status, startDate, endDate, color },
      { new: true, runValidators: true }
    ).populate('assignedInterns', 'name email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Task.updateMany({ projectId: req.params.id }, { $unset: { projectId: '' } });

    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getProjectStats = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user._id });
    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({ createdBy: req.user._id, projectId: { $in: projectIds } });
    const updates = await TaskUpdate.find({ createdBy: { $in: projects.flatMap((p) => p.assignedInterns) } });

    const stats = projects.map((project) => {
      const projectTasks = tasks.filter((t) => String(t.projectId) === String(project._id));
      const completedTasks = projectTasks.filter((t) => t.status === 'completed').length;
      const projectInternIds = project.assignedInterns.map((id) => String(id));
      const projectUpdates = updates.filter((u) => projectInternIds.includes(String(u.createdBy)));

      return {
        project: {
          _id: project._id,
          name: project.name,
          status: project.status,
          color: project.color,
        },
        totalTasks: projectTasks.length,
        completedTasks,
        pendingTasks: projectTasks.filter((t) => t.status === 'pending').length,
        inProgressTasks: projectTasks.filter((t) => t.status === 'in-progress').length,
        totalSubmissions: projectUpdates.length,
        progress: projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0,
      };
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats,
};
