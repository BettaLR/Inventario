export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-4 pb-4 border-b border-slate-200/80 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">{title}</h2>
        {subtitle && <p className="text-slate-500 text-xs mt-1 font-medium">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
