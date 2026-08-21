export default function StatusBadge({ className, children }) {
  return <span className={`status ${className}`}>{children}</span>;
}
