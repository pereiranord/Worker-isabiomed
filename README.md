# Isaesteticca — site

Next.js (App Router) + Tailwind, hospedado na Vercel. Sem CMS próprio: o
Airtable é a fonte de conteúdo, o Cloudinary (via a ponte de mídia já
configurada) serve as imagens, e o Cal.com cuida da agenda por trás de uma
interface própria (sem embed).

## Arquitetura

```
Airtable (conteúdo)  →  lib/airtable.ts (server-only)  →  páginas (Server Components)
Airtable "Mídia"     →  automação externa → Cloudinary  →  lib/media.ts (fallback + otimização)
Cal.com (agenda)     →  lib/calcom.ts (server-only)     →  /api/cal/*  →  components/BookingWidget.tsx
Configurações        →  WhatsApp (lib/format.ts)        →  components/WhatsappCta.tsx
```

Nenhuma chave (Airtable, Cal.com) é enviada ao navegador — tudo passa por
Server Components ou Route Handlers.

## Variáveis de ambiente

Configure em Vercel → Settings → Environment Variables (ver `.env.example`
para os nomes exatos):

- `AIRTABLE_PAT` — Personal Access Token do Airtable, escopo de leitura.
- `AIRTABLE_BASE_ID` — já preenchido (`appJn6FJhobras7Hg`).
- `CAL_API_KEY` — chave de API da conta `isabiomed` no Cal.com.
- `SITE_URL` — URL pública, usada no sitemap.

## Como o conteúdo do Airtable chega ao site

As páginas usam `revalidate: 60` — uma edição no Airtable aparece no site em
até 60 segundos, sem precisar de novo deploy.

## O que ainda falta (não incluído nesta primeira versão)

- **Página de Equipe/Sobre** e o carrossel completo de Banners (hoje só o
  primeiro banner ativo aparece na home).
- **Autenticação da área da cliente** (Firebase Auth) — decidida no projeto,
  ainda não implementada aqui.
- **Webhook Cal.com → Airtable** (tabela Agendamentos) — testado
  anteriormente e confirmado que ainda não existe; sem ele, a tabela
  Agendamentos não reflete reservas feitas pelo site.
- Polimento visual adicional, testes de acessibilidade com leitor de tela, e
  ajuste fino de SEO por página (Open Graph, dados estruturados JSON-LD).
- E-mail é opcional no formulário de agendamento; quando ausente, o backend
  gera um e-mail técnico (baseado no telefone) só para satisfazer a API do
  Cal.com — a cliente nunca vê isso, mas vale confirmar se esse
  comportamento é o desejado a longo prazo, ou se o e-mail deve virar
  obrigatório.
