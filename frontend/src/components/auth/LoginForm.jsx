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
      className="min-h-screen w-full flex items-center justify-center p-3 sm:p-5 relative bg-cover bg-center bg-no-repeat select-none font-sans"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.45)), url('/warehouse_bg.png')`,
      }}
    >
      {/* Translucent Frosted Glass Container */}
      <div className="relative z-10 w-full max-w-[480px] bg-slate-900/45 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl p-5 sm:p-6 text-white">
        
        {/* Compact Header */}
        <div className="text-center mb-3">
          <h1 className="text-lg sm:text-xl font-black tracking-widest uppercase text-white font-heading drop-shadow-sm">
            ACCEDER
          </h1>
          <p className="text-slate-200 text-[11px] mt-0.5 font-medium drop-shadow-xs">
            Control de Inventarios WMS
          </p>
        </div>

        {/* Role Switcher */}
        <div className="mb-3">
          <div className="flex items-center justify-center gap-1.5">
            {DEMO_ROLES.map((r) => (
              <button
                key={r.email}
                type="button"
                onClick={() => selectRole(r)}
                className={`py-1 px-3 rounded-full text-[10px] sm:text-xs font-semibold transition-all cursor-pointer text-center ${
                  formik.values.email === r.email
                    ? 'bg-rose-600 text-white shadow-md border border-rose-400 font-extrabold'
                    : 'bg-white/15 text-slate-200 hover:bg-white/25 backdrop-blur-xs'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Text-Only Form */}
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-2.5 text-left">
          {/* Usuario / Email */}
          <div>
            <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-100 mb-0.5 drop-shadow-xs">
              USUARIO
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`w-full px-3 py-1.5 bg-white/95 text-slate-900 rounded-md text-xs font-semibold outline-none transition-all placeholder-slate-400 focus:ring-2 focus:ring-rose-500 shadow-xs ${
                formik.touched.email && formik.errors.email ? 'border-2 border-rose-500' : 'border border-slate-300'
              }`}
              placeholder="admin@inventario.com"
              {...formik.getFieldProps('email')}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-rose-300 text-[10px] mt-0.5 font-medium">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-100 mb-0.5 drop-shadow-xs">
              CONTRASEÑA
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={`w-full px-3 py-1.5 bg-white/95 text-slate-900 rounded-md text-xs font-semibold outline-none transition-all placeholder-slate-400 focus:ring-2 focus:ring-rose-500 shadow-xs ${
                formik.touched.password && formik.errors.password ? 'border-2 border-rose-500' : 'border border-slate-300'
              }`}
              placeholder="••••••••••"
              {...formik.getFieldProps('password')}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-rose-300 text-[10px] mt-0.5 font-medium">{formik.errors.password}</p>
            )}
          </div>

          {/* Modelo Específico */}
          <div>
            <label htmlFor="modelo" className="block text-[10px] font-bold uppercase tracking-wider text-slate-100 mb-0.5 drop-shadow-xs">
              MODELO ESPECÍFICO
            </label>
            <input
              id="modelo"
              type="text"
              className="w-full px-3 py-1.5 bg-white/95 text-slate-900 rounded-md text-xs font-semibold outline-none transition-all placeholder-slate-400 focus:ring-2 focus:ring-rose-500 shadow-xs border border-slate-300"
              placeholder="MODELO_SPECIFIC_ID"
              {...formik.getFieldProps('modelo')}
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center text-[11px] text-slate-200 pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="font-medium text-slate-200 drop-shadow-xs">Remember me.</span>
            </label>
          </div>

          {/* Server Error Alert */}
          {errorServidor && (
            <div className="p-2 bg-rose-500/30 border border-rose-500/60 rounded text-rose-100 text-[11px] font-semibold text-center">
              {errorServidor}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-[#C2185B] hover:bg-[#AD1457] text-white font-extrabold py-2.5 px-4 rounded-md uppercase tracking-wider text-xs shadow-md transition-all duration-150 cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-1"
          >
            {formik.isSubmitting ? 'INGRESANDO...' : 'LOGIN'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-3 pt-2 border-t border-white/20">
          <span className="text-[11px] text-slate-200 hover:text-white transition-colors cursor-pointer font-medium drop-shadow-xs">
            Recordar contraseña ?
          </span>
        </div>
      </div>
    </div>
  );
}
