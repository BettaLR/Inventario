export default function Field({ label, error, children, required }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-wide text-ink-600 mb-1.5">
        {label} {required && <span className="text-[color:var(--color-state-danger)]">*</span>}
      </label>
      {children}
      {error && <p className="text-[color:var(--color-state-danger)] text-xs mt-1">{error}</p>}
    </div>
  );
}

export function inputClass(hasError) {
  return `field-input ${hasError ? 'field-input-error' : ''}`;
}
