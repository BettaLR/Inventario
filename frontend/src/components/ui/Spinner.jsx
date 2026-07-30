export default function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-10 ${className}`}>
      <div className="w-5 h-5 border-2 border-line border-t-[color:var(--color-accent-500)] rounded-full animate-spin" />
    </div>
  );
}
