const { Router } = require('express');
const ctrl = require('../controllers/usuariosController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();
router.use(verifyToken, requireRole('Admin', 'Administrador'));

router.get('/', asyncHandler(ctrl.listar));
router.get('/roles', asyncHandler(ctrl.listarRoles));
router.post('/', asyncHandler(ctrl.crear));
router.patch('/:id/estado', asyncHandler(ctrl.actualizarEstado));

module.exports = router;
