import { copyText } from '../lib/clipboard';
import { useToast } from '../hooks/useToast';

export default function CopyButton({ text, children, className = 'button button--primary', ariaLabel }) {
  const { showToast } = useToast();

  async function handleClick() {
    if (!text) {
      showToast('복사할 내용이 없습니다.');
      return;
    }
    const copied = await copyText(text);
    showToast(copied ? '클립보드에 복사했습니다.' : '복사하지 못했습니다.');
  }

  return (
    <button type="button" className={className} aria-label={ariaLabel} onClick={handleClick}>
      {children}
    </button>
  );
}
