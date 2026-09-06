import Image from "next/image";
import { resolveImage } from "@/lib/media";
import type { Attachment } from "@/lib/airtable";

export function SmartImage({
  cloudinaryUrls,
  rawAttachments,
  alt,
  className,
  sizes = "(min-width: 768px) 50vw, 100vw",
  priority = false,
  fog = false,
}: {
  cloudinaryUrls: string[] | undefined;
  rawAttachments: Attachment[] | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** dissolve as bordas da imagem no fundo (efeito névoa) */
  fog?: boolean;
}) {
  const { src } = resolveImage(cloudinaryUrls, rawAttachments);
  const isPlaceholder = src === "/placeholder.svg";

  return (
    <div className={`relative overflow-hidden ${fog ? "" : "bg-smoke/20"} ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={isPlaceholder}
        className={`object-cover ${fog ? "fog" : ""}`}
      />
    </div>
  );
}
