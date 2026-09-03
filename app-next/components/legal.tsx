import { PageHeader } from "@usva-ui/react/patterns/page-header";
import { Callout } from "@usva-ui/react/primitives/callout";
import { Reveal } from "@usva-ui/react/motion/reveal";

export function LegalShell({
  eyebrow,
  title,
  meta,
  intro,
  notice,
  children,
}: {
  eyebrow: string;
  title: string;
  meta: string;
  intro: React.ReactNode;
  notice?: { title: string; body: React.ReactNode };
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        meta={<span className="font-mono text-xs">{meta}</span>}
      />
      <div className="mt-10 space-y-6 text-[0.95rem] leading-7 text-muted">
        {intro}
      </div>
      {notice && (
        <Callout tone="info" title={notice.title} className="mt-8">
          {notice.body}
        </Callout>
      )}
      <div className="mt-14 space-y-12">{children}</div>
    </div>
  );
}

export function Clause({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal variant="veil" as="section">
      <h2 className="text-ink flex items-baseline gap-3 text-xl font-bold">
        <span className="text-accent font-mono text-sm">
          {String(n).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[0.95rem] leading-7 text-muted">
        {children}
      </div>
    </Reveal>
  );
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="relative pl-5">
          <span
            aria-hidden
            className="bg-accent absolute top-[0.7em] left-0 size-1.5 rounded-full"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Term({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <p>
      <strong className="text-ink font-semibold">{label}</strong> {children}
    </p>
  );
}

export const Mail = () => (
  <a
    href="mailto:team@pagemd.ai"
    className="text-accent underline underline-offset-4"
  >
    team@pagemd.ai
  </a>
);
