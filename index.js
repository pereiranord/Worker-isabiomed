export default {
  // Permite acessar pela URL no navegador (Teste manual)
  async fetch(request, env, ctx) {
    try {
      await this.syncAirtable(env);
      return new Response("Worker rodando com sucesso! Sincronizacao finalizada.", { status: 200 });
    } catch (error) {
      return new Response("Erro na execucao: " + error.message, { status: 500 });
    }
  },

  // Permite rodar sozinho de tempos em tempos (CRON)
  async scheduled(event, env, ctx) {
    await this.syncAirtable(env);
  },

  // O motor principal do código
  async syncAirtable(env) {
    const AIRTABLE_TOKEN = env.AIRTABLE_TOKEN;
    const AIRTABLE_BASE = env.AIRTABLE_BASE;
    const TABLE_NAME = "Mídia"; 
    
    const CLOUD_NAME = env.CLOUD_NAME; 
    const UPLOAD_PRESET = "airtable_upload"; 

    if (!AIRTABLE_TOKEN || !AIRTABLE_BASE || !CLOUD_NAME) {
        console.error("Erro: Variáveis de ambiente ausentes no Cloudflare.");
        return;
    }

    const formula = "AND(NOT({Arquivo original} = ''), {URL Cloudinary} = '')";
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}?filterByFormula=${encodeURIComponent(formula)}`;

    const getRes = await fetch(airtableUrl, {
      headers: { "Authorization": `Bearer ${AIRTABLE_TOKEN}` }
    });
    
    const getData = await getRes.json();

    if (!getData.records || getData.records.length === 0) {
        console.log("Nenhuma imagem nova para processar.");
        return;
    }

    for (const record of getData.records) {
        const anexos = record.fields["Arquivo original"];
        if (!anexos || anexos.length === 0) continue;

        const fileUrl = anexos[0].url;

        const params = new URLSearchParams();
        params.append("file", fileUrl);
        params.append("upload_preset", UPLOAD_PRESET);

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: params
        });
        
        const cloudData = await cloudRes.json();

        if (cloudData.secure_url) {
            await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}/${record.id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fields: {
                        "URL Cloudinary": cloudData.secure_url
                    }
                })
            });
            console.log(`Sucesso! Registro ${record.id} atualizado.`);
        }
    }
  }
};
