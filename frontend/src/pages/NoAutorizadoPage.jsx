import { useNavigate } from 'react-router-dom';

export default function NoAutorizadoPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <p className="text-5xl mb-4">🚫</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Acceso no autorizado</h1>
        <p className="text-slate-500 mb-6">No tienes permisos para ver esta página.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
