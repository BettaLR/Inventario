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
    initialValues: { email: 'admin@inventario.com', password: 'Admin123!', modelo: 'MODELO_SPECIFIC_ID' },
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
      {/* Sleek Vertical Suspended Glassmorphism Panel */}
      <div className="relative z-10 w-full max-w-[410px] min-h-[600px] bg-slate-900/35 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/70 py-10 px-7 sm:px-9 text-white flex flex-col justify-between">
        
        {/* Header Section */}
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-2xl font-bold tracking-[0.2em] uppercase text-white font-heading drop-shadow-md">
            ACCEDER
          </h1>
          <p className="text-slate-200 text-xs font-medium tracking-wide">
            Control de Inventarios WMS
          </p>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-0.5">
            AQUÍ ENTRAN LOS MODELOS
          </p>
        </div>

        {/* Tab Bar / Role Switcher */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-1.5 p-1 bg-black/25 rounded-xl border border-white/10">
            {DEMO_ROLES.map((r) => (
              <button
                key={r.email}
                type="button"
                onClick={() => selectRole(r)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer text-center ${
                  formik.values.email === r.email
                    ? 'bg-[#C2185B] text-white shadow-lg border border-rose-400/50'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-4 text-left flex-1 flex flex-col justify-center">
          {/* Usuario / Email */}
          <div>
            <label htmlFor="email" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>USUARIO</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`w-full px-3.5 py-2.5 bg-white/95 text-slate-900 rounded-lg text-sm font-semibold outline-none transition-all placeholder-slate-400 focus:ring-2 focus:ring-[#C2185B] shadow-sm ${
                formik.touched.email && formik.errors.email ? 'border-2 border-rose-500' : 'border border-white/30'
              }`}
              placeholder="admin@inventario.com"
              {...formik.getFieldProps('email')}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-rose-300 text-xs mt-1 font-medium">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>CONTRASEÑA</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={`w-full px-3.5 py-2.5 bg-white/95 text-slate-900 rounded-lg text-sm font-semibold outline-none transition-all placeholder-slate-400 focus:ring-2 focus:ring-[#C2185B] shadow-sm ${
                formik.touched.password && formik.errors.password ? 'border-2 border-rose-500' : 'border border-white/30'
              }`}
              placeholder="••••••••"
              {...formik.getFieldProps('password')}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-rose-300 text-xs mt-1 font-medium">{formik.errors.password}</p>
            )}
          </div>

          {/* Modelo Específico */}
          <div>
            <label htmlFor="modelo" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>AQUÍ ENTRAN LOS MODELOS</span>
            </label>
            <input
              id="modelo"
              type="text"
              className="w-full px-3.5 py-2.5 bg-white/95 text-slate-900 rounded-lg text-sm font-semibold outline-none transition-all placeholder-slate-400 focus:ring-2 focus:ring-[#C2185B] shadow-sm border border-white/30"
              placeholder="MODELO_SPECIFIC_ID"
              {...formik.getFieldProps('modelo')}
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center text-xs text-slate-200 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-500 bg-slate-800 text-[#C2185B] focus:ring-[#C2185B] cursor-pointer"
              />
              <span className="font-medium text-slate-200">Remember me.</span>
            </label>
          </div>

          {/* Server Error Alert */}
          {errorServidor && (
            <div className="p-2.5 bg-rose-500/30 border border-rose-500/60 rounded-lg text-rose-100 text-xs font-semibold text-center">
              {errorServidor}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-[#C2185B] hover:bg-[#AD1457] text-white font-extrabold py-3.5 px-4 rounded-lg uppercase tracking-[0.15em] text-sm shadow-xl shadow-rose-950/60 transition-all duration-200 cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-3"
          >
            {formik.isSubmitting ? 'INGRESANDO...' : 'LOGIN'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-5 mt-4 border-t border-white/15">
          <span className="text-xs text-slate-200 hover:text-white transition-colors cursor-pointer font-medium">
            Recordar contraseña ?
          </span>
        </div>
      </div>
    </div>
  );
}
