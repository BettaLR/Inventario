export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/60" onClick={onClose} />
      <div className={`relative bg-surface border border-line rounded-[4px] shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-surface">
          <h3 className="font-semibold text-ink-900 text-sm tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-900 text-xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
