const { Router } = require('express');
const ctrl = require('../controllers/reportesController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();
router.use(verifyToken, requireRole('Admin', 'Gerente'));

router.get('/inventario-valorizado', asyncHandler(ctrl.inventarioValorizado));
router.get('/inventario-valorizado/pdf', asyncHandler(ctrl.inventarioValorizadoPdf));
router.get('/inventario-valorizado/excel', asyncHandler(ctrl.inventarioValorizadoExcel));
router.get('/rotacion', asyncHandler(ctrl.rotacion));
router.get('/mermas', asyncHandler(ctrl.mermas));
router.get('/alertas-stock', asyncHandler(ctrl.alertasStock));

module.exports = router;
