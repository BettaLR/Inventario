import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const schema = Yup.object({
  email: Yup.string().email('Email inválido').required('El email es requerido'),
  password: Yup.string().required('La contraseña es requerida'),
});

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorServidor, setErrorServidor] = useState('');

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      setErrorServidor('');
      try {
        await login(values.email, values.password);
        navigate('/dashboard');
      } catch (err) {
        const msg = err.response?.data?.message || 'Error al iniciar sesión';
        setErrorServidor(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal-800">
      <div className="bg-surface border border-line rounded-[4px] shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-10 h-1 bg-accent-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-ink-900 tracking-tight uppercase">Control de Inventarios</h1>
          <p className="text-ink-400 text-sm mt-1">Ingresa con tu cuenta</p>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-ink-600 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`field-input ${formik.touched.email && formik.errors.email ? 'field-input-error' : ''}`}
              placeholder="usuario@inventario.com"
              {...formik.getFieldProps('email')}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-state-danger text-xs mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-ink-600 mb-1.5">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={`field-input ${formik.touched.password && formik.errors.password ? 'field-input-error' : ''}`}
              placeholder="••••••••"
              {...formik.getFieldProps('password')}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-state-danger text-xs mt-1">{formik.errors.password}</p>
            )}
          </div>

          {errorServidor && (
            <div className="mb-4 p-3 bg-[#FBE9E7] border border-state-danger/30 rounded-[3px]">
              <p className="text-state-danger text-sm">{errorServidor}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-100 text-white font-semibold py-2.5 rounded-[3px] transition-colors text-sm tracking-wide"
          >
            {formik.isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
