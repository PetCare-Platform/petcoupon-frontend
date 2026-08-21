import { useToast } from '../hooks/useToast';

export default function DemoButton({ message, className, ariaLabel, children }) {
  const { showToast } = useToast();

  return (
    <button type="button" className={className} aria-label={ariaLabel} onClick={() => showToast(message)}>
      {children}
    </button>
  );
}
