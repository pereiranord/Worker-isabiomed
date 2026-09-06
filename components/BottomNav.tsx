"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, CalendarDays, MessageCircleQuestion } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Início", Icon: Home },
  { href: "/procedimentos", label: "Procedimentos", Icon: Sparkles },
  { href: "/agendar", label: "Agendar", Icon: CalendarDays },
  { href: "/duvidas", label: "Dúvidas", Icon: MessageCircleQuestion },
];

// Barra inferior fixa — é o que dá a sensação de aplicativo no celular.
// Some no desktop, onde a navegação do topo já basta.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ivory/10 bg-noir/95 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring flex flex-col items-center gap-1 rounded-xl py-1.5 transition-colors ${
                  active ? "text-brassLight" : "text-ivory/55"
                }`}
              >
                <Icon size={21} strokeWidth={active ? 2 : 1.5} />
                <span className="text-[0.63rem] tracking-wide">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
