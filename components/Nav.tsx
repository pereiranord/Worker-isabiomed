import Link from "next/link";

const LINKS = [
  { href: "/procedimentos", label: "Procedimentos" },
  { href: "/duvidas", label: "Dúvidas" },
];

export function Nav({ siteName }: { siteName: string }) {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Link
          href="/"
          className="focus-ring font-display text-[1.35rem] font-medium tracking-wide text-ivory"
        >
          {siteName}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="focus-ring text-sm text-ivory/70 transition-colors hover:text-ivory"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/agendar" className="btn-primary !px-5 !py-2.5 !text-sm">
            Agendar
          </Link>
        </div>
      </nav>
    </header>
  );
}
