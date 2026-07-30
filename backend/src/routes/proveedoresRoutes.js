const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/proveedoresController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();
router.use(verifyToken);

const validarProveedor = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Email inválido'),
  handleValidationErrors,
];

router.get('/', asyncHandler(ctrl.listar));
router.get('/:id', asyncHandler(ctrl.obtener));
router.post('/', requireRole('Admin', 'Gerente'), validarProveedor, asyncHandler(ctrl.crear));
router.put('/:id', requireRole('Admin', 'Gerente'), validarProveedor, asyncHandler(ctrl.actualizar));
router.delete('/:id', requireRole('Admin'), asyncHandler(ctrl.eliminar));

module.exports = router;
