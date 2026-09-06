import type { MetadataRoute } from "next";
import { getProcedimentos } from "@/lib/airtable";

const SITE_URL = process.env.SITE_URL ?? "https://isabiomed.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const procedimentos = await getProcedimentos();
  return [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/procedimentos`, priority: 0.9 },
    { url: `${SITE_URL}/agendar`, priority: 0.9 },
    { url: `${SITE_URL}/duvidas`, priority: 0.6 },
    ...procedimentos.map((p) => ({
      url: `${SITE_URL}/procedimentos/${p.fields.Slug}`,
      priority: 0.7,
    })),
  ];
}
