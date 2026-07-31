export default function Field({ label, error, children, required }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-rose-500 text-xs font-semibold mt-1">{error}</p>}
    </div>
  );
}

export function inputClass(hasError) {
  return `w-full px-3.5 py-2.5 bg-white text-slate-800 rounded-xl text-xs sm:text-sm font-medium border ${
    hasError
      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
      : 'border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
  } outline-none transition-all placeholder-slate-400`;
}
