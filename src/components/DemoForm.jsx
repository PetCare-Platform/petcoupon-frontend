import { useToast } from '../hooks/useToast';

export default function DemoForm({ message, className, children }) {
  const { showToast } = useToast();

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      showToast('입력 내용을 확인해 주세요.');
      return;
    }
    showToast(message);
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
