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
  const [rememberMe, setRememberMe] = useState(true);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
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

  return (
    <div
      className="fixed inset-0 w-screen h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat select-none font-sans overflow-hidden z-50"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(13, 7, 20, 0.75), rgba(13, 7, 20, 0.85)), url('/warehouse_bg.png')`,
      }}
    >
      {/* Background Ambient Glowing Metallic Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-amber-700/20 rounded-full blur-[140px] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] bg-orange-500/25 rounded-full blur-[130px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-yellow-600/20 rounded-full blur-[140px] -bottom-32 -right-32 pointer-events-none" />

      {/* Sleek Vertical Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[390px] bg-white/[0.05] backdrop-blur-2xl border border-white/20 rounded-[36px] shadow-2xl shadow-black/80 p-7 sm:p-9 text-white font-sans flex flex-col gap-y-5">
        
        {/* Header & Avatar */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-2.5 shadow-inner text-white/90 backdrop-blur-md">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-[0.25em] uppercase text-white drop-shadow-sm">
            ACCEDER
          </h1>
          <p className="text-white/50 text-[11px] font-medium tracking-wide mt-0.5">
            Control de Inventarios WMS
          </p>
        </div>

        {/* Minimalist Line Form */}
        <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-y-4 text-left">
          {/* Email */}
          <div>
            <div className="flex items-center gap-3 border-b border-white/20 focus-within:border-amber-500 py-2 transition-colors">
              <svg className="w-4 h-4 text-white/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full bg-transparent text-white placeholder-white/30 text-sm font-normal outline-none border-none focus:ring-0 p-0"
                placeholder="USUARIO / EMAIL"
                {...formik.getFieldProps('email')}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-amber-400 text-[11px] mt-1 font-medium">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center gap-3 border-b border-white/20 focus-within:border-amber-500 py-2 transition-colors">
              <svg className="w-4 h-4 text-white/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                id="password"
                type={mostrarPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="w-full bg-transparent text-white placeholder-white/30 text-sm font-normal outline-none border-none focus:ring-0 p-0"
                placeholder="CONTRASEÑA"
                {...formik.getFieldProps('password')}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword((v) => !v)}
                className="text-white/50 hover:text-white transition-colors shrink-0 cursor-pointer"
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={-1}
              >
                {mostrarPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21m-6.122-6.122L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-amber-400 text-[11px] mt-1 font-medium">{formik.errors.password}</p>
            )}
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between text-xs text-white/70 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-white/30 bg-white/10 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-white/70 text-[11px]">Remember me</span>
            </label>

            <span className="text-white/50 hover:text-white transition-colors cursor-pointer text-[11px]">
              Recordar contraseña ?
            </span>
          </div>

          {/* Server Error Alert */}
          {errorServidor && (
            <div className="p-2 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-200 text-xs text-center font-medium">
              {errorServidor}
            </div>
          )}

          {/* Pill Gradient LOGIN Button */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 hover:opacity-95 text-white font-extrabold py-3 px-6 rounded-full uppercase tracking-[0.2em] text-xs sm:text-sm shadow-lg shadow-amber-900/40 transition-all duration-300 cursor-pointer active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {formik.isSubmitting ? 'INGRESANDO...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
