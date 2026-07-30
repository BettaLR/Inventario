const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/almacenesController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();
router.use(verifyToken);

const validarAlmacen = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  handleValidationErrors,
];

router.get('/', asyncHandler(ctrl.listar));
router.post('/', requireRole('Admin', 'Gerente'), validarAlmacen, asyncHandler(ctrl.crear));
router.put('/:id', requireRole('Admin', 'Gerente'), validarAlmacen, asyncHandler(ctrl.actualizar));
router.delete('/:id', requireRole('Admin'), asyncHandler(ctrl.eliminar));

module.exports = router;
