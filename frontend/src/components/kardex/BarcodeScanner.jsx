import { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal';

export default function BarcodeScanner({ open, onClose, onDetected }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [soportado] = useState(() => typeof window.BarcodeDetector !== 'undefined');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !soportado) return;

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
              onDetected(codigos[0].rawValue);
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
  }, [open, soportado, onDetected]);

  return (
    <Modal open={open} onClose={onClose} title="Escanear código de barras">
      {!soportado ? (
        <p className="text-sm text-ink-400">
          Tu navegador no soporta el lector de códigos por cámara (requiere Chrome/Edge en escritorio o Android).
          Usa el campo de entrada manual del formulario.
        </p>
      ) : error ? (
        <p className="text-sm text-state-danger">{error}</p>
      ) : (
        <div className="rounded-[3px] overflow-hidden bg-black">
          <video ref={videoRef} className="w-full aspect-video" muted playsInline />
        </div>
      )}
      <p className="text-xs text-ink-400 mt-3">Apunta la cámara al código de barras del producto.</p>
    </Modal>
  );
}
