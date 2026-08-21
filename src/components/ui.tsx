import { Link } from "react-router-dom";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "text" | "danger";

const variantClass: Record<Variant, string> = {
  primary:
    "border-ink bg-ink text-paper hover:bg-[#262626] hover:border-[#262626] dark:bg-ops-ink dark:text-ops-bg dark:border-ops-ink dark:hover:bg-white",
  secondary:
    "border-hairline bg-paper text-ink hover:border-ink hover:bg-surface-soft dark:bg-ops-bg dark:border-ops-border dark:text-ops-ink dark:hover:border-ops-ink dark:hover:bg-ops-surface",
  text: "border-transparent bg-transparent text-ink underline underline-offset-4 hover:underline-offset-[6px] dark:text-ops-ink",
  danger:
    "border-ink bg-paper text-ink hover:bg-surface-soft dark:bg-ops-bg dark:border-ops-border dark:text-ops-ink",
};

const base =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border px-5 py-2 text-[18px] font-medium leading-tight transition-all duration-150 ease-fluid active:scale-[0.97]";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={`${base} ${variantClass[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  className = "",
  children,
  to,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; to: string }) {
  return (
    <Link to={to} className={`${base} ${variantClass[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-11 items-center gap-2 text-[18px] font-medium underline underline-offset-4 transition-all duration-150 ease-fluid hover:underline-offset-[6px] dark:text-ops-ink"
    >
      {children}
    </Link>
  );
}

type StatusTone = "open" | "scheduled" | "closed" | "used" | "warning" | "danger" | "neutral";

const toneClass: Record<StatusTone, string> = {
  open: "bg-lime text-[#0f172a] border-lime",
  scheduled: "bg-lilac text-[#0f172a] border-lilac",
  closed: "bg-hairline-soft text-ink border-hairline-soft dark:bg-ops-border-soft dark:text-ops-ink dark:border-ops-border-soft",
  used: "bg-mint text-[#0f172a] border-mint",
  warning: "bg-coral text-[#0f172a] border-coral",
  danger: "bg-pink text-[#0f172a] border-pink",
  neutral: "bg-paper text-ink border-ink dark:bg-ops-bg dark:text-ops-ink dark:border-ops-ink",
};

export function StatusPill({ tone = "neutral", children }: { tone?: StatusTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full border px-2.5 font-mono text-xs uppercase tracking-wide ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({ href, children, className = "" }: { href?: string; children: ReactNode; className?: string }) {
  const cls = `min-w-0 rounded-block border border-hairline bg-paper p-4 text-ink transition-all duration-200 ease-fluid dark:border-white/[0.14] dark:bg-ops-surface dark:text-ops-ink dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${className}`;
  if (href) {
    return (
      <Link to={href} className={`${cls} block no-underline hover:-translate-y-0.5 hover:border-ink active:translate-y-0 active:scale-[0.99] dark:hover:border-white/30`}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-wide text-ink/70 dark:text-ops-muted">{children}</p>;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="py-10 md:py-14">
      <div className="container-page flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-2">{title}</h1>
          {description ? <p className="mt-3 max-w-[60ch] text-ink/70 dark:text-ops-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

const blockTone: Record<string, string> = {
  lime: "bg-lime",
  lilac: "bg-lilac",
  cream: "bg-cream",
  mint: "bg-mint",
  pink: "bg-pink",
  coral: "bg-coral",
};

export function ColorBlock({ tone, children }: { tone: keyof typeof blockTone; children: ReactNode }) {
  return (
    <div className={`rounded-block p-6 text-[#0f172a] md:p-10 ${blockTone[tone]}`}>{children}</div>
  );
}

export function MetricGrid({ children, cols = 4, compact = false }: { children: ReactNode; cols?: 2 | 3 | 4; compact?: boolean }) {
  const colClass = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 md:grid-cols-4";
  return (
    <dl
      className={`grid gap-px ${colClass} ${
        compact
          ? "overflow-hidden rounded-control border border-hairline bg-hairline dark:border-ops-border dark:bg-ops-border"
          : "gap-4"
      }`}
    >
      {children}
    </dl>
  );
}

export function MetricTile({
  label,
  value,
  hint,
  compact = false,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`min-w-0 bg-paper dark:bg-ops-surface dark:text-ops-ink ${
        compact ? "px-4 py-3.5" : "rounded-control border border-hairline p-4 dark:border-white/[0.14]"
      }`}
    >
      <dt className="mb-1.5 font-mono text-xs uppercase tracking-wide text-ink/70 dark:text-ops-muted">{label}</dt>
      <dd className={`font-semibold leading-none tracking-tight ${compact ? "text-[26px]" : "text-[40px]"}`}>
        {value}
        {hint ? <small className="ml-1.5 block text-sm font-normal text-ink/60 dark:text-ops-muted md:inline">{hint}</small> : null}
      </dd>
    </div>
  );
}

export function FieldGroup({
  label,
  htmlFor,
  error,
  help,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="text-[18px] font-medium">
        {label}
      </label>
      {children}
      {help && !error ? <small className="text-[15px] text-ink/60 dark:text-ops-muted">{help}</small> : null}
      {error ? (
        <p className="flex items-start gap-1.5 text-[15px] text-danger">
          <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-danger font-mono text-[11px] font-bold text-paper">
            !
          </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full min-h-12 rounded-control border border-hairline bg-paper px-3.5 py-2.5 text-[18px] text-ink placeholder:text-ink outline-none transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ink dark:border-ops-border dark:bg-ops-bg dark:text-ops-ink";

export function FilterBar<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label="상태 필터" className="flex flex-wrap items-center gap-1.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-[16px] font-medium transition-colors duration-150 ${
              active
                ? "border-ink bg-ink text-paper hover:bg-[#262626] dark:border-ops-ink dark:bg-ops-ink dark:text-ops-bg"
                : "border-hairline bg-paper text-ink hover:border-ink dark:border-ops-border dark:bg-ops-bg dark:text-ops-ink dark:hover:border-ops-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-block border border-dashed border-hairline p-10 text-center dark:border-ops-border">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-ink/70 dark:text-ops-muted">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
