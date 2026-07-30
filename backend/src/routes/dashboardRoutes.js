const { Router } = require('express');
const ctrl = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();
router.use(verifyToken);

router.get('/stats', asyncHandler(ctrl.stats));

module.exports = router;
