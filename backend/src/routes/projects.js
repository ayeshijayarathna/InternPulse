const express = require('express');
const router = express.Router();
const {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats,
} = require('../controllers/projectController');
const { protect, supervisorOnly } = require('../middleware/auth');

router.use(protect, supervisorOnly);

router.route('/')
  .get(getAllProjects)
  .post(createProject);

router.get('/stats', getProjectStats);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;
