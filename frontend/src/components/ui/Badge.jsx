const COLORS = {
  slate: 'bg-slate-100 text-slate-700 border-slate-200 dot:bg-slate-500',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dot:bg-emerald-500',
  red: 'bg-rose-50 text-rose-700 border-rose-200 dot:bg-rose-500',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200 dot:bg-amber-500',
  blue: 'bg-blue-50 text-blue-700 border-blue-200 dot:bg-blue-500',
};

const DOTS = {
  slate: 'bg-slate-400',
  green: 'bg-emerald-500',
  red: 'bg-rose-500',
  yellow: 'bg-amber-500',
  blue: 'bg-blue-500',
};

export default function Badge({ color = 'slate', children }) {
  const badgeStyle = COLORS[color] || COLORS.slate;
  const dotStyle = DOTS[color] || DOTS.slate;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
      <span>{children}</span>
    </span>
  );
}
