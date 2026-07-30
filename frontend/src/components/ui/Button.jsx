const VARIANTS = {
  primary: 'bg-accent-500 hover:bg-accent-600 text-white disabled:bg-accent-100 disabled:text-white/70',
  secondary: 'bg-transparent hover:bg-canvas text-ink-600 border border-line disabled:opacity-50',
  danger: 'bg-transparent hover:bg-[#FBE9E7] text-state-danger border border-state-danger/40 disabled:opacity-50',
  ghost: 'bg-transparent hover:bg-canvas text-ink-600 disabled:opacity-50',
};

const SIZES = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-[3px] font-semibold tracking-wide transition-colors
        disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
