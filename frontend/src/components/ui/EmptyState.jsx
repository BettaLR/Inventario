export default function EmptyState({ title = 'Sin resultados', subtitle }) {
  return (
    <div className="text-center py-14">
      <div className="w-8 h-px bg-line mx-auto mb-4" />
      <p className="text-ink-600 text-sm font-semibold">{title}</p>
      {subtitle && <p className="text-ink-400 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}
