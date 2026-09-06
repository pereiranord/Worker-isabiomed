import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { getConfig } from "@/lib/airtable";
import { Nav } from "@/components/Nav";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";

// Cormorant Garamond (títulos) + Jost (interface): serifa alta e elegante
// contra uma sans geométrica limpa — par clássico de marca de luxo.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});
const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig().catch(() => null);
  return {
    title: config?.["SEO Title padrão"] ?? config?.["Nome do Site"] ?? "Isaesteticca",
    description: config?.["SEO Description padrão"],
    icons: config?.["Favicon (URL)"]?.[0] ? [{ url: config["Favicon (URL)"][0] }] : undefined,
    themeColor: "#151010",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getConfig().catch(() => null);

  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="font-body antialiased">
        <Nav siteName={config?.["Nome do Site"] ?? "Isaesteticca"} />
        {children}
        <Footer config={config} />
        <BottomNav />
      </body>
    </html>
  );
}
