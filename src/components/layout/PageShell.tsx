import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="mx-auto max-w-[1180px] px-6 pb-12 pt-16 md:px-10 md:pb-16 md:pt-24">
      {eyebrow && (
        <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </div>
      )}
      <h1 className="font-display max-w-3xl">{title}</h1>
      {intro && (
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {intro}
        </p>
      )}
    </section>
  );
}

export function ComingSoon({ note }: { note?: string }) {
  return (
    <div className="mx-auto max-w-[1180px] px-6 pb-24 md:px-10">
      <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
        <p className="font-display text-xl text-foreground/80">
          Estamos preparando este espacio con cuidado.
        </p>
        {note && <p className="mt-2 text-sm text-muted-foreground">{note}</p>}
      </div>
    </div>
  );
}
