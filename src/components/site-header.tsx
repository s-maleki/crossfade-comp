import Link from "next/link";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/math", label: "Interpolation" },
  { href: "/lab", label: "Compressor" },
  { href: "/schematics", label: "Schematics" },
  { href: "/control", label: "Digital control" },
  { href: "/build", label: "Build" },
];

export function SiteHeader({ active }: { active: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <Link href="/" className="min-w-0">
            <p className="font-mono text-[11px] tracking-[0.22em] text-amber-200/80 uppercase">
              Adjacent-tap analog compressor
            </p>
            <h1 className="font-heading text-xl text-amber-50 sm:text-2xl">
              BlendStep
            </h1>
          </Link>
          <p className="hidden max-w-xs text-right text-xs leading-relaxed text-muted-foreground sm:block">
            Feed-forward guitar compressor. PT2257 does the dB steps; an analog
            crossfader fills in the 1 dB gaps.
          </p>
        </div>
        <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1">
          {LINKS.map((link) => {
            const isActive = active === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 rounded-full px-3 py-1 text-sm transition-colors ${
                  isActive
                    ? "bg-amber-200 text-stone-900"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
