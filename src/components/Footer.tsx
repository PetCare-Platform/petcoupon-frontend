import { Link } from "react-router-dom";
import { AREA_ROUTES } from "../routes";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas px-6 py-12 dark:border-ops-border dark:bg-ops-bg md:px-10">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="text-xl font-bold">
          PetCoupon
        </Link>
        <nav aria-label="푸터 영역" className="flex flex-wrap gap-4">
          {Object.entries(AREA_ROUTES).map(([key, cfg]) => (
            <Link key={key} to={cfg.home} className="text-ink/70 underline underline-offset-4 dark:text-ops-muted">
              {cfg.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-ink/60 dark:text-ops-muted">© {new Date().getFullYear()} PetCoupon</p>
      </div>
    </footer>
  );
}
