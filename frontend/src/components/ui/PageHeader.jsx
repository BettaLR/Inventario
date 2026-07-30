export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-3 pb-4 border-b border-line">
      <div>
        <h2 className="text-lg font-bold text-ink-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-ink-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
