const COLORS = {
  slate: { dot: 'bg-ink-400', text: 'text-ink-600' },
  green: { dot: 'bg-state-ok', text: 'text-state-ok' },
  red: { dot: 'bg-state-danger', text: 'text-state-danger' },
  yellow: { dot: 'bg-state-warn', text: 'text-state-warn' },
  blue: { dot: 'bg-state-info', text: 'text-state-info' },
};

export default function Badge({ color = 'slate', children }) {
  const c = COLORS[color] || COLORS.slate;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide">
      <span className={`status-dot ${c.dot}`} />
      <span className={c.text}>{children}</span>
    </span>
  );
}
