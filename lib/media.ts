// Ponte de mídia: resolve a melhor URL disponível para uma imagem.
//
// Ordem de prioridade:
//   1. URL do Cloudinary (campo Lookup "... (URL)" vindo da tabela Mídia) —
//      permanente, otimizada, servida por CDN. É o caminho normal.
//   2. Anexo bruto do Airtable — usado só como rede de segurança enquanto
//      a automação Airtable → Cloudinary ainda não processou aquele item
//      (ou para itens muito recentes). Essa URL expira em ~2h, então nunca
//      é cacheada como definitiva.
//   3. Placeholder local — nenhuma imagem disponível ainda.
//
// Isso preserva a arquitetura de mídia já construída (Airtable → automação
// → Cloudinary → Airtable) em vez de ignorá-la: o site só consome o
// resultado, nunca fala com o Cloudinary diretamente.

import type { Attachment } from "./airtable";

const PLACEHOLDER = "/placeholder.svg";

export function resolveImage(
  cloudinaryUrls: string[] | undefined,
  rawAttachments: Attachment[] | undefined
): { src: string; isCloudinary: boolean } {
  const cloudinaryUrl = cloudinaryUrls?.[0];
  if (cloudinaryUrl) {
    return { src: withAutoOptimization(cloudinaryUrl), isCloudinary: true };
  }
  const rawUrl = rawAttachments?.[0]?.url;
  if (rawUrl) {
    return { src: rawUrl, isCloudinary: false };
  }
  return { src: PLACEHOLDER, isCloudinary: false };
}

// Insere a transformação f_auto,q_auto (formato e qualidade automáticos —
// normalmente entrega WebP/AVIF) logo após "/upload/" em uma URL do
// Cloudinary, sem duplicar se já estiver presente.
export function withAutoOptimization(cloudinaryUrl: string): string {
  if (!cloudinaryUrl.includes("res.cloudinary.com")) return cloudinaryUrl;
  if (cloudinaryUrl.includes("/upload/f_auto")) return cloudinaryUrl;
  return cloudinaryUrl.replace("/upload/", "/upload/f_auto,q_auto/");
}
