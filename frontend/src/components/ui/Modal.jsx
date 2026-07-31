export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop oscuro con desenfoque suave */}
      <div
        className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Tarjeta Modal Blanca Sólida */}
      <div
        className={`relative z-10 bg-white rounded-2xl border border-slate-200 shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150`}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-20">
          <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xl font-medium transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto bg-white flex-1">{children}</div>
      </div>
    </div>
  );
}
