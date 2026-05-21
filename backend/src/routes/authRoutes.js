const { Router } = require('express');
const { body } = require('express-validator');
const { login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    handleValidationErrors,
  ],
  login
);

router.get('/me', verifyToken, getMe);

module.exports = router;
