const express = require('express');
const router  = express.Router();

const {
  createTask,
  getAllTasks,
  getMyTasks,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const { protect, supervisorOnly } = require('../middleware/auth');

// PDF requirement #33 — GET /api/tasks/my  (Intern: own tasks)
router.get('/my', protect, getMyTasks);

// PDF requirement #28 — POST /api/tasks  (Supervisor)
router.post('/', protect, supervisorOnly, createTask);

// PDF requirement #29 — GET /api/tasks   (Supervisor: all tasks)
router.get('/', protect, supervisorOnly, getAllTasks);

// PDF requirement #30 — PATCH /api/tasks/:id  (Supervisor)
router.patch('/:id', protect, supervisorOnly, updateTask);

// PDF requirement #31 — DELETE /api/tasks/:id  (Supervisor)
router.delete('/:id', protect, supervisorOnly, deleteTask);

module.exports = router;