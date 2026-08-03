const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/movimientosController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();
router.use(verifyToken);

router.get('/', asyncHandler(ctrl.listar));

router.post(
  '/',
  requireRole('Admin', 'Gerente', 'Almacenista'),
  [
    body('producto_id').isInt().withMessage('Producto requerido'),
    body('almacen_id').isInt().withMessage('Almacén requerido'),
    body('tipo').isIn(['entrada', 'salida', 'ajuste', 'transferencia', 'devolucion']).withMessage('Tipo inválido'),
    body('cantidad').isInt({ min: 1 }).withMessage('Cantidad inválida')
      .if(body('tipo').not().equals('ajuste')),
    body('cantidad_nueva').if(body('tipo').equals('ajuste')).isInt({ min: 0 }).withMessage('Cantidad ajustada inválida'),
    handleValidationErrors,
  ],
  asyncHandler(ctrl.registrarMovimiento)
);

router.put(
  '/stock/:producto_id/:almacen_id/ubicacion',
  requireRole('Admin', 'Gerente', 'Almacenista'),
  [
    body('ubicacion').optional({ nullable: true }).isString().isLength({ max: 50 }).withMessage('Ubicación inválida'),
    handleValidationErrors,
  ],
  asyncHandler(ctrl.actualizarUbicacion)
);

module.exports = router;
