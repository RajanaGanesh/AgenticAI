const express = require('express');
const integrationController = require('../controllers/integrationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// OAuth callback from external provider (unauthenticated HTTP redirect)
router.get('/oauth/:provider/callback', integrationController.oauthCallback);
router.get('/oauth/error', integrationController.oauthError);

// Protected endpoints
router.use(authMiddleware);

router.get('/', integrationController.listIntegrations);
router.get('/status', integrationController.getIntegrationStatus);
router.get('/oauth/:provider/start', integrationController.startOAuth);
router.post('/', integrationController.saveManualCredentials);
router.delete('/:provider', integrationController.disconnect);

module.exports = router;
