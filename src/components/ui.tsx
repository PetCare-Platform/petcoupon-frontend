import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "text" | "danger";

const variantClass: Record<Variant, string> = {
  primary:
    "border-accent bg-accent text-ink hover:bg-accent-ink hover:border-accent-ink hover:text-paper dark:bg-ops-ink dark:text-ops-bg dark:border-ops-ink dark:hover:bg-white",
  secondary:
    "border-ink bg-paper text-ink hover:bg-ink hover:text-paper dark:bg-ops-bg dark:border-ops-border dark:text-ops-ink dark:hover:border-ops-ink dark:hover:bg-ops-surface dark:hover:text-ops-ink",
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
  open: "bg-success/10 text-[#0a8f3c] border-success/30",
  scheduled: "bg-surface-2 text-ink-muted border-hairline",
  closed: "bg-surface-2 text-ink-muted border-hairline dark:bg-ops-border-soft dark:text-ops-ink dark:border-ops-border-soft",
  used: "bg-surface-2 text-ink-muted border-hairline",
  warning: "bg-accent/10 text-accent-ink border-accent/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  neutral: "bg-paper text-ink border-hairline dark:bg-ops-bg dark:text-ops-ink dark:border-ops-ink",
};

export function StatusPill({ tone = "neutral", children }: { tone?: StatusTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full border px-2.5 text-xs font-semibold uppercase tracking-wide ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({ href, children, className = "" }: { href?: string; children: ReactNode; className?: string }) {
  const cls = `min-w-0 rounded-[1.25rem] border border-hairline bg-paper p-3.5 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all duration-300 ease-fluid dark:border-white/[0.14] dark:bg-ops-surface dark:text-ops-ink dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${className}`;
  if (href) {
    return (
      <Link to={href} className={`${cls} block no-underline hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_20px_40px_-20px_rgba(51,80,63,0.35)] active:translate-y-0 active:scale-[0.99] dark:hover:border-white/30 dark:hover:shadow-none`}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex w-fit items-center rounded-full border border-accent/20 bg-accent/[0.07] px-3 py-1 text-xs font-semibold tracking-wide text-accent-ink dark:border-ops-border-soft dark:bg-transparent dark:text-ops-muted">
      {children}
    </p>
  );
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

export function ColorBlock({ tone = "surface", children }: { tone?: "surface" | "accent"; children: ReactNode }) {
  const cls =
    tone === "accent"
      ? "relative overflow-hidden rounded-panel border border-accent/20 bg-accent/[0.07] p-5 text-ink md:p-8"
      : "rounded-panel border border-hairline bg-surface-2 p-4 text-ink md:p-6";
  return <div className={cls}>{children}</div>;
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
      className={`min-w-0 bg-paper shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:bg-ops-surface dark:text-ops-ink dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
        compact ? "px-4 py-3.5" : "rounded-2xl border border-hairline p-3.5 dark:border-white/[0.14]"
      }`}
    >
      <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/70 dark:text-ops-muted">{label}</dt>
      <dd className={`font-semibold leading-none tracking-tight ${compact ? "text-[26px]" : "text-[30px]"}`}>
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
  "w-full min-h-12 rounded-control border border-hairline bg-paper px-3.5 py-2.5 text-[18px] text-ink placeholder:text-ink-subtle outline-none transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ink dark:border-ops-border dark:bg-ops-bg dark:text-ops-ink dark:placeholder:text-ops-muted";

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
    <div className="rounded-[1.75rem] border border-dashed border-hairline p-10 text-center dark:border-ops-border">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 text-ink/70 dark:text-ops-muted">{description}</p>
      {action ? <div className="mt-3 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function BarChart({
  points,
  unit = "건",
}: {
  points: { label: string; value: number }[];
  unit?: string;
}) {
  const max = Math.max(...points.map((p) => p.value));
  const peakIndex = points.findIndex((p) => p.value === max);
  return (
    <div role="img" aria-label={`${points.map((p) => `${p.label} ${p.value}${unit}`).join(", ")}`}>
      <div className="flex h-40 items-end gap-2">
        {points.map((p, i) => (
          <div key={p.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className={`font-mono text-[11px] tabular-nums ${i === peakIndex ? "font-semibold text-ink dark:text-ops-ink" : "text-ink/50 dark:text-ops-muted"}`}>
              {p.value}
            </span>
            <div
              className={`w-full flex-none rounded-t-sm ${i === peakIndex ? "bg-ink dark:bg-ops-ink" : "bg-ink/70 dark:bg-ops-ink/60"}`}
              style={{ height: `${(p.value / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2 border-t border-ink/30 pt-1.5 dark:border-white/25">
        {points.map((p) => (
          <span key={p.label} className="flex-1 text-center font-mono text-[10px] text-ink/50 dark:text-ops-muted">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface CrossfadeImage {
  src: string;
  alt: string;
  credit: string;
  creditUrl: string;
  license: string;
}

export const PET_SHOWCASE_IMAGES_HOME: CrossfadeImage[] = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/9/90/Labrador_Retriever_portrait.jpg",
    alt: "카메라를 바라보는 래브라도 리트리버",
    credit: "Herwig Kavallar, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Labrador_Retriever_portrait.jpg",
    license: "Public Domain",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Kittyply_edit1.jpg",
    alt: "카메라를 바라보는 회색 고양이",
    credit: "David Corby, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Kittyply_edit1.jpg",
    license: "CC BY 2.5",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Siberian_Husky_pho.jpg",
    alt: "정면을 응시하는 시베리안 허스키",
    credit: "Per Harald Olsen, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Siberian_Husky_pho.jpg",
    license: "CC BY 2.5",
  },
];

export const PET_SHOWCASE_IMAGES_EVENT: CrossfadeImage[] = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Tabby_cat_with_blue_eyes-3336579.jpg",
    alt: "파란 눈을 가진 태비 고양이",
    credit: "AdinaVoicu, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Tabby_cat_with_blue_eyes-3336579.jpg",
    license: "CC0",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/6/65/Dog_portrait_Budapest.jpg",
    alt: "거리에서 촬영된 강아지의 초상",
    credit: "CONTRERAS Roberto, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Dog_portrait_Budapest.jpg",
    license: "CC BY 4.0",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Felis_catus-cat_on_snow.jpg",
    alt: "눈밭에 앉아 있는 고양이",
    credit: "Von.grzanka, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Felis_catus-cat_on_snow.jpg",
    license: "CC BY-SA 3.0",
  },
];

export function ImageCrossfade({
  images,
  intervalMs = 3200,
  aspect = "aspect-square",
}: {
  images: CrossfadeImage[];
  intervalMs?: number;
  aspect?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotionRef.current) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  const current = images[index];

  return (
    <div>
      <div className={`relative ${aspect} w-full overflow-hidden rounded-block shadow-[0_16px_32px_-20px_rgba(32,29,24,0.35)]`}>
        {images.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-fluid ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5" role="tablist" aria-label="사진 넘기기">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${i + 1}번째 사진 보기`}
            onClick={() => setIndex(i)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i === index ? "bg-accent" : "bg-hairline hover:bg-ink/30"}`}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-ink/40">
        사진:{" "}
        <a href={current.creditUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          {current.credit}
        </a>{" "}
        ({current.license})
      </p>
    </div>
  );
}
