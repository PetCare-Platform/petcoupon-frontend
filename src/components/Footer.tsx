import { Link } from "react-router-dom";
import { AREA_ROUTES } from "../routes";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-hairline/70 bg-white/70 px-6 py-10 dark:border-ops-border/70 dark:bg-ops-surface/70 md:px-10">
      <div className="mx-auto flex max-w-[1380px] flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/" className="text-xl font-bold text-ink dark:text-ops-ink">PetCoupon</Link>
          <p className="mt-1 text-sm text-ink-muted dark:text-ops-muted">우리 아이와 보내는 하루에 꼭 맞는 혜택</p>
        </div>
        <nav aria-label="푸터 영역" className="flex flex-wrap gap-4">
          {Object.entries(AREA_ROUTES).map(([key, cfg]) => (
            <Link
              key={key}
              to={cfg.home}
              className="text-ink/70 underline decoration-accent/40 underline-offset-4 transition-colors duration-300 ease-fluid hover:text-ink hover:decoration-accent dark:text-ops-muted dark:decoration-ops-accent/40 dark:hover:decoration-ops-accent"
            >
              {cfg.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-ink/60 dark:text-ops-muted">© {new Date().getFullYear()} PetCoupon</p>
      </div>
    </footer>
  );
}
