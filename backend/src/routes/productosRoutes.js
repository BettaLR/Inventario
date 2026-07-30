const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/productosController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();
router.use(verifyToken);

const validarProducto = [
  body('codigo').notEmpty().withMessage('El código es requerido'),
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('precio_unitario').optional().isFloat({ min: 0 }).withMessage('Precio inválido'),
  body('stock_minimo').optional().isInt({ min: 0 }).withMessage('Stock mínimo inválido'),
  handleValidationErrors,
];

router.get('/', asyncHandler(ctrl.listar));
router.get('/codigo/:codigo', asyncHandler(ctrl.buscarPorCodigoBarras));
router.get('/:id', asyncHandler(ctrl.obtener));
router.post('/', requireRole('Admin', 'Gerente'), validarProducto, asyncHandler(ctrl.crear));
router.put('/:id', requireRole('Admin', 'Gerente'), validarProducto, asyncHandler(ctrl.actualizar));
router.delete('/:id', requireRole('Admin'), asyncHandler(ctrl.eliminar));

module.exports = router;
