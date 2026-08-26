const express = require('express');
const { body } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', workflowController.getDashboardStats);

router.get('/', workflowController.listWorkflows);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required'),
  ],
  validate,
  workflowController.createWorkflow
);

router.post(
  '/generate',
  [
    body('prompt').trim().notEmpty().withMessage('Natural language prompt is required'),
  ],
  validate,
  workflowController.generateWorkflow
);

router.get('/:id', workflowController.getWorkflowById);

router.put('/:id', workflowController.updateWorkflow);

router.post('/:id/duplicate', workflowController.duplicateWorkflow);

router.post('/:id/execute', workflowController.executeWorkflow);

router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;
