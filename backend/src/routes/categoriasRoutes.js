const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/categoriasController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();
router.use(verifyToken);

router.get('/', asyncHandler(ctrl.listar));

router.post(
  '/',
  requireRole('Admin', 'Gerente'),
  [body('nombre').notEmpty().withMessage('El nombre es requerido'), handleValidationErrors],
  asyncHandler(ctrl.crear)
);

router.put(
  '/:id',
  requireRole('Admin', 'Gerente'),
  [body('nombre').notEmpty().withMessage('El nombre es requerido'), handleValidationErrors],
  asyncHandler(ctrl.actualizar)
);

router.delete('/:id', requireRole('Admin'), asyncHandler(ctrl.eliminar));

module.exports = router;
