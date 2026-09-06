import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/format";

export function WhatsappCta({
  phone,
  message,
  children,
  className,
  variant = "quiet",
}: {
  phone: string;
  message?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "quiet" | "outline" | "primary";
}) {
  const base =
    variant === "primary" ? "btn-primary" : variant === "outline" ? "btn-outline" : "btn-quiet";

  return (
    <a
      href={whatsappLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${className ?? ""}`}
    >
      <MessageCircle size={17} strokeWidth={1.8} />
      {children}
    </a>
  );
}
