import { useNavigate } from 'react-router-dom';

export default function NoAutorizadoPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal-800">
      <div className="text-center">
        <div className="w-10 h-1 bg-accent-500 mx-auto mb-5" />
        <h1 className="text-xl font-bold text-white mb-2 tracking-tight uppercase">Acceso no autorizado</h1>
        <p className="text-charcoal-400 mb-6 text-sm">No tienes permisos para ver esta página.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-accent-500 hover:bg-accent-600 text-white px-5 py-2.5 rounded-[3px] text-sm font-semibold tracking-wide transition-colors"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
