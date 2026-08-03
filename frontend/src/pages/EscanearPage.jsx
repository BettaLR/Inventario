import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EscanearPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [soportado] = useState(() => typeof window.BarcodeDetector !== 'undefined');
  const [error, setError] = useState('');
  const [codigoManual, setCodigoManual] = useState('');

  useEffect(() => {
    if (!soportado) return;

    let activo = true;
    const detector = new window.BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
    });

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (!activo) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        const escanear = async () => {
          if (!activo || !videoRef.current) return;
          try {
            const codigos = await detector.detect(videoRef.current);
            if (codigos.length > 0) {
              activo = false;
              navigate(`/escanear/producto/${encodeURIComponent(codigos[0].rawValue)}`);
              return;
            }
          } catch {
            // frame no listo aún, se reintenta
          }
          requestAnimationFrame(escanear);
        };
        requestAnimationFrame(escanear);
      })
      .catch(() => setError('No se pudo acceder a la cámara. Revisa los permisos del navegador.'));

    return () => {
      activo = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [soportado, navigate]);

  const buscarManual = (e) => {
    e.preventDefault();
    if (codigoManual.trim()) {
      navigate(`/escanear/producto/${encodeURIComponent(codigoManual.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-950/95 border-b border-white/10 shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          aria-label="Volver"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-sm tracking-tight">Escanear producto</h1>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {soportado && !error ? (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            {/* Frame guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-orange-500/80 rounded-2xl shadow-[0_0_0_9999px_rgba(2,6,23,0.55)]" />
            </div>
            <p className="absolute bottom-6 left-0 right-0 text-center text-white/70 text-xs font-medium px-6">
              Apunta la cámara al código de barras o QR del producto
            </p>
          </>
        ) : (
          <div className="px-6 text-center">
            <p className="text-white/70 text-sm mb-1">
              {error || 'Tu navegador no soporta el lector por cámara (usa Chrome/Edge en Android o escritorio).'}
            </p>
            <p className="text-white/40 text-xs">Puedes ingresar el código manualmente abajo.</p>
          </div>
        )}
      </div>

      {/* Manual input fallback */}
      <form onSubmit={buscarManual} className="p-4 bg-slate-950/95 border-t border-white/10 flex gap-2 shrink-0">
        <input
          value={codigoManual}
          onChange={(e) => setCodigoManual(e.target.value)}
          placeholder="O ingresa el código manualmente..."
          className="flex-1 px-3.5 py-3 bg-white/10 text-white placeholder-white/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/50 border border-white/10"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl text-sm active:scale-[0.98] transition-all cursor-pointer"
        >
          Buscar
        </button>
      </form>
    </div>
  );
}
