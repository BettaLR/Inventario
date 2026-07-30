const VARIANTS = {
  primary: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold shadow-xs shadow-orange-950/20 active:scale-[0.98]',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs active:scale-[0.98]',
  danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 active:scale-[0.98]',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 active:scale-[0.98]',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-md',
  md: 'px-4 py-2 text-sm font-semibold rounded-lg',
};

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 tracking-tight transition-all duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
