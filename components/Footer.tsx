import { MapPin, Clock, Instagram, Phone } from "lucide-react";
import type { ConfigFields } from "@/lib/airtable";

export function Footer({ config }: { config: ConfigFields | null }) {
  if (!config) return null;
  return (
    <footer className="border-t border-ivory/10 bg-noir pb-14 pt-16 text-ivory md:pb-16">
      <div className="mx-auto max-w-5xl px-5">
        <p className="font-display text-3xl font-light">{config["Nome da Clínica"]}</p>

        <div className="mt-8 grid gap-7 text-sm text-ivory/65 sm:grid-cols-2">
          {config.Endereço && (
            <p className="flex gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brass" strokeWidth={1.6} />
              <span>{config.Endereço}</span>
            </p>
          )}
          {config["Horário de funcionamento"] && (
            <p className="flex gap-3">
              <Clock size={16} className="mt-0.5 shrink-0 text-brass" strokeWidth={1.6} />
              <span className="whitespace-pre-line">{config["Horário de funcionamento"]}</span>
            </p>
          )}
          {config.WhatsApp && (
            <p className="flex gap-3">
              <Phone size={16} className="mt-0.5 shrink-0 text-brass" strokeWidth={1.6} />
              <span>{config.WhatsApp}</span>
            </p>
          )}
          {config.Instagram && (
            <a
              href={config.Instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring flex gap-3 transition-colors hover:text-ivory"
            >
              <Instagram size={16} className="mt-0.5 shrink-0 text-brass" strokeWidth={1.6} />
              <span>Instagram</span>
            </a>
          )}
        </div>

        <p className="mt-10 border-t border-ivory/10 pt-6 text-xs text-ivory/35">
          © {new Date().getFullYear()} {config["Nome da Clínica"]}
        </p>
      </div>
    </footer>
  );
}
