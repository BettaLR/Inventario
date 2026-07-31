import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const schema = Yup.object({
  email: Yup.string().email('Email inválido').required('El email es requerido'),
  password: Yup.string().required('La contraseña es requerida'),
  modelo: Yup.string(),
});

const DEMO_ROLES = [
  { label: 'Admin',     email: 'admin@inventario.com',   modelo: 'MODELO_ADMIN_v2' },
  { label: 'Almacén',   email: 'almacen@inventario.com', modelo: 'MODELO_WMS_OPER' },
  { label: 'Cliente',   email: 'cliente@inventario.com', modelo: 'MODELO_CLIENT_VIP' },
];

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorServidor, setErrorServidor] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const formik = useFormik({
    initialValues: { email: 'almacen@inventario.com', password: 'Admin123!', modelo: 'MODELO_SPECIFIC_ID' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      setErrorServidor('');
      try {
        await login(values.email, values.password);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        const msg = err.response?.data?.message || 'Credenciales incorrectas.';
        setErrorServidor(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const selectRole = (role) => {
    formik.setFieldValue('email', role.email);
    formik.setFieldValue('password', 'Admin123!');
    formik.setFieldValue('modelo', role.modelo);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative bg-cover bg-center bg-no-repeat select-none font-sans"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.6)), url('/warehouse_bg.png')`,
      }}
    >
      {/* Minimal Glassmorphic Card (Inspired by reference design) */}
      <div className="relative z-10 w-full max-w-[390px] bg-gradient-to-b from-purple-950/40 via-slate-900/40 to-pink-950/35 backdrop-blur-xl border border-white/20 rounded-[32px] shadow-2xl shadow-purple-950/60 p-7 sm:p-9 text-white font-sans">
        
        {/* Top Role Selector Capsule */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-1 p-1 bg-black/30 backdrop-blur-md rounded-full border border-white/15">
            {DEMO_ROLES.map((r) => (
              <button
                key={r.email}
                type="button"
                onClick={() => selectRole(r)}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer text-center ${
                  formik.values.email === r.email
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md font-extrabold scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Circular Avatar Silhouette Header */}
        <div className="text-center mb-7">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-md shadow-inner text-white/80">
            <svg className="w-10 h-10 sm:w-11 sm:h-11" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold tracking-[0.18em] uppercase text-white font-heading drop-shadow-sm">
            ACCEDER
          </h1>
          <p className="text-slate-300 text-xs font-medium mt-0.5">
            Control de Inventarios WMS
          </p>
        </div>

        {/* Form Inputs (Minimal Underline Style) */}
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-6 text-left">
          {/* Email / Username */}
          <div className="relative">
            <div className="flex items-center gap-3 border-b border-white/40 focus-within:border-pink-400 py-2 transition-colors">
              <svg className="w-4 h-4 text-white/80 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full bg-transparent text-white placeholder-slate-300 text-sm font-medium outline-none border-none focus:ring-0 p-0"
                placeholder="USUARIO / EMAIL"
                {...formik.getFieldProps('email')}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-rose-300 text-xs mt-1 font-medium">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <div className="flex items-center gap-3 border-b border-white/40 focus-within:border-pink-400 py-2 transition-colors">
              <svg className="w-4 h-4 text-white/80 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full bg-transparent text-white placeholder-slate-300 text-sm font-medium outline-none border-none focus:ring-0 p-0"
                placeholder="CONTRASEÑA"
                {...formik.getFieldProps('password')}
              />
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-rose-300 text-xs mt-1 font-medium">{formik.errors.password}</p>
            )}
          </div>

          {/* Modelo Específico */}
          <div className="relative">
            <div className="flex items-center gap-3 border-b border-white/40 focus-within:border-pink-400 py-2 transition-colors">
              <svg className="w-4 h-4 text-white/80 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <input
                id="modelo"
                type="text"
                className="w-full bg-transparent text-white placeholder-slate-300 text-sm font-medium outline-none border-none focus:ring-0 p-0"
                placeholder="MODELO ESPECÍFICO"
                {...formik.getFieldProps('modelo')}
              />
            </div>
          </div>

          {/* Same-row Checkbox & Forgot Password Link */}
          <div className="flex items-center justify-between text-xs text-slate-200 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-white/40 bg-black/30 text-pink-500 focus:ring-pink-500 cursor-pointer"
              />
              <span className="font-medium text-slate-200">Remember me</span>
            </label>

            <span className="text-slate-300 hover:text-white transition-colors cursor-pointer italic text-xs">
              Recordar contraseña ?
            </span>
          </div>

          {/* Server Error Alert */}
          {errorServidor && (
            <div className="p-2.5 bg-rose-500/30 border border-rose-500/60 rounded-xl text-rose-100 text-xs font-semibold text-center">
              {errorServidor}
            </div>
          )}

          {/* Pill Gradient LOGIN Button */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-extrabold py-3.5 px-6 rounded-full uppercase tracking-[0.2em] text-sm shadow-xl shadow-pink-950/60 transition-all duration-300 cursor-pointer active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {formik.isSubmitting ? 'INGRESANDO...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
