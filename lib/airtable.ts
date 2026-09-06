// Camada de dados do Airtable — roda SOMENTE no servidor (Route Handlers e
// Server Components). AIRTABLE_PAT nunca é enviado ao navegador.
// Todo conteúdo do site vem daqui: nenhum texto/preço/telefone deve ser
// hardcoded fora deste arquivo e dos componentes que o consomem.

const BASE_ID = process.env.AIRTABLE_BASE_ID as string;
const TOKEN = process.env.AIRTABLE_PAT as string;

if (!BASE_ID || !TOKEN) {
  // Não lança em build time (o Next só executa isto quando a rota/página
  // que chama é de fato renderizada), mas ajuda a diagnosticar cedo.
  console.warn(
    "[airtable] AIRTABLE_BASE_ID ou AIRTABLE_PAT não configurados. " +
      "Defina-os nas variáveis de ambiente do projeto na Vercel."
  );
}

type AirtableRecord<T> = { id: string; createdTime: string; fields: T };
type AirtableListResponse<T> = { records: AirtableRecord<T>[]; offset?: string };

async function airtableFetch<T>(
  table: string,
  params: Record<string, string> = {}
): Promise<AirtableRecord<T>[]> {
  // Sem credenciais, devolve vazio em vez de quebrar. Isso permite que o
  // primeiro deploy (antes de configurar as env vars) compile e suba: o site
  // aparece com as seções vazias e se popula sozinho assim que o token for
  // adicionado nas Environment Variables da Vercel.
  if (!BASE_ID || !TOKEN) return [];

  const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const all: AirtableRecord<T>[] = [];
  let offset: string | undefined;

  // Falha "suave": se o Airtable estiver fora do ar ou responder erro, o site
  // renderiza vazio em vez de quebrar a página. O erro fica no log da Vercel.
  try {
    do {
      if (offset) url.searchParams.set("offset", offset);
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${TOKEN}` },
        // ISR: o conteúdo do Airtable é revalidado a cada 60s sem precisar
        // de novo deploy — é assim que "editar no Airtable" chega ao site.
        next: { revalidate: 60 },
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`[airtable] ${table} ${res.status}: ${body}`);
        return all;
      }
      const json = (await res.json()) as AirtableListResponse<T>;
      all.push(...json.records);
      offset = json.offset;
    } while (offset);
  } catch (err) {
    console.error(`[airtable] falha ao ler ${table}:`, err);
  }

  return all;
}

// ---- Tipos dos campos relevantes (somente o que o site usa) ----

export type Attachment = { url: string; filename?: string };

export type ProcedimentoFields = {
  Nome: string;
  Slug: string;
  "Descrição curta"?: string;
  "Descrição completa"?: string;
  Valor?: number;
  "Mostrar valor"?: boolean;
  "Valor a partir de"?: boolean;
  "Duração (min)"?: number;
  Status?: string;
  Destaque?: boolean;
  Ordem?: number;
  "Cal.com Event ID"?: string;
  "SEO Title"?: string;
  "SEO Description"?: string;
  "Foto principal"?: Attachment[];
  "Foto principal (URL)"?: string[];
  Categoria?: string[];
};

export type CategoriaFields = {
  Nome: string;
  Slug: string;
  Descrição?: string;
  Status?: string;
  Ordem?: number;
};

export type FaqFields = {
  Pergunta: string;
  Resposta: string;
  Categoria?: string;
  Status?: string;
  Ordem?: number;
};

export type BannerFields = {
  Título?: string;
  Subtítulo?: string;
  "Texto do botão"?: string;
  Link?: string;
  "Data inicial"?: string;
  "Data final"?: string;
  Status?: string;
  Ordem?: number;
  Imagem?: Attachment[];
  "Imagem (URL)"?: string[];
};

export type ConfigFields = {
  Chave: string;
  "Nome da Clínica"?: string;
  WhatsApp?: string;
  Instagram?: string;
  "E-mail"?: string;
  Endereço?: string;
  "Google Maps"?: string;
  "Horário de funcionamento"?: string;
  "Nome do Site"?: string;
  "SEO Title padrão"?: string;
  "SEO Description padrão"?: string;
  Logo?: Attachment[];
  Favicon?: Attachment[];
  "Logo (URL)"?: string[];
  "Favicon (URL)"?: string[];
};

export type EquipeFields = {
  Nome: string;
  Cargo?: string;
  Biografia?: string;
  Formação?: string;
  Especializações?: string;
  Instagram?: string;
  Status?: string;
  Foto?: Attachment[];
  "Foto (URL)"?: string[];
};

export type DepoimentoFields = {
  Nome: string;
  Texto: string;
  Nota?: number;
  Autorizado?: boolean;
  Destaque?: boolean;
  Status?: string;
};

const ATIVO = (r: { fields: { Status?: string } }) =>
  (r.fields.Status ?? "Ativo").toLowerCase() === "ativo";
const byOrdem = (a: { fields: { Ordem?: number } }, b: { fields: { Ordem?: number } }) =>
  (a.fields.Ordem ?? 999) - (b.fields.Ordem ?? 999);

export async function getConfig(): Promise<ConfigFields | null> {
  const records = await airtableFetch<ConfigFields>("Configurações", { maxRecords: "1" });
  return records[0]?.fields ?? null;
}

export async function getCategorias() {
  const records = await airtableFetch<CategoriaFields>("Categorias");
  return records.filter(ATIVO).sort(byOrdem);
}

export async function getProcedimentos() {
  const records = await airtableFetch<ProcedimentoFields>("Procedimentos");
  return records.filter(ATIVO).sort(byOrdem);
}

export async function getProcedimentoBySlug(slug: string) {
  const records = await getProcedimentos();
  return records.find((r) => r.fields.Slug === slug) ?? null;
}

export async function getFaqs() {
  const records = await airtableFetch<FaqFields>("Perguntas Frequentes");
  return records.filter(ATIVO).sort(byOrdem);
}

export async function getBanners() {
  const records = await airtableFetch<BannerFields>("Banners");
  const hoje = new Date().toISOString().slice(0, 10);
  return records
    .filter(ATIVO)
    .filter((r) => {
      const ini = r.fields["Data inicial"];
      const fim = r.fields["Data final"];
      if (ini && hoje < ini) return false;
      if (fim && hoje > fim) return false;
      return true;
    })
    .sort(byOrdem);
}

export async function getEquipe() {
  const records = await airtableFetch<EquipeFields>("Equipe");
  return records.filter(ATIVO);
}

export async function getDepoimentos() {
  const records = await airtableFetch<DepoimentoFields>("Depoimentos");
  return records.filter(ATIVO).filter((r) => r.fields.Autorizado);
}
