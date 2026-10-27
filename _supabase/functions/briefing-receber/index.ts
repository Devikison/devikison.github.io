// Descomplica Site: recebe o briefing enviado em descomplicasite.com.br/formulario.
// Grava as respostas em public.descomplica_briefings e devolve links assinados (1 ano)
// dos arquivos que o cliente subiu no bucket privado briefings-descomplica/<id>/.
// verify_jwt desligado: a página usa a chave pública; a validação é feita aqui
// (id novo em formato uuid, só arquivos da própria pasta e que existem de verdade).
import { createClient } from "npm:@supabase/supabase-js@2";

const BUCKET = "briefings-descomplica";
const UM_ANO = 60 * 60 * 24 * 365;
const ORIGENS = [
  "https://www.descomplicasite.com.br",
  "https://descomplicasite.com.br",
  "https://devikison.github.io",
];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function cors(origin: string | null) {
  const ok = origin && (ORIGENS.includes(origin) || origin.startsWith("http://localhost"));
  return {
    "Access-Control-Allow-Origin": ok ? origin! : ORIGENS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Vary": "Origin",
  };
}

const txt = (v: unknown, max = 5000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

Deno.serve(async (req) => {
  const headers = cors(req.headers.get("Origin"));
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return json({ erro: "método" }, 405);

  let body: any;
  try { body = await req.json(); } catch { return json({ erro: "json" }, 400); }

  const id = txt(body?.id, 36);
  const dados = body?.dados ?? {};
  if (!UUID.test(id)) return json({ erro: "id" }, 400);
  if (!txt(dados.nome) || !txt(dados.whatsapp)) return json({ erro: "campos" }, 400);

  const respostas: Record<string, string> = {};
  for (const [k, v] of Object.entries(dados)) if (/^[a-z_]{1,30}$/.test(k)) respostas[k] = txt(v);

  const links = (Array.isArray(body.links) ? body.links : [])
    .map((l: unknown) => txt(l, 2000))
    .filter((l: string) => /^https?:\/\//i.test(l))
    .slice(0, 50);

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // só aceita arquivos que estão mesmo na pasta deste envio
  const { data: naPasta } = await sb.storage.from(BUCKET).list(id, { limit: 1000 });
  const existentes = new Set((naPasta ?? []).map((o) => `${id}/${o.name}`));
  const pedidos = Array.isArray(body.arquivos) ? body.arquivos.slice(0, 100) : [];

  const arquivos: { nome: string; path: string; tamanho: number; tipo: string; url: string | null }[] = [];
  for (const a of pedidos) {
    const path = txt(a?.path, 300);
    if (!existentes.has(path)) continue;
    const { data: assinado } = await sb.storage.from(BUCKET).createSignedUrl(path, UM_ANO);
    arquivos.push({
      nome: txt(a?.nome, 300) || path.split("/").pop()!,
      path,
      tamanho: Number(a?.tamanho) || 0,
      tipo: txt(a?.tipo, 120),
      url: assinado?.signedUrl ?? null,
    });
  }

  const { error } = await sb.from("descomplica_briefings").upsert({
    id,
    nome: respostas.nome,
    empresa: respostas.empresa || null,
    whatsapp: respostas.whatsapp || null,
    email: respostas.email || null,
    servico: respostas.servico || null,
    respostas,
    links,
    arquivos,
  });
  if (error) return json({ erro: "gravar" }, 500);

  return json({ ok: true, protocolo: id.slice(0, 8).toUpperCase(), arquivos: arquivos.map(({ nome, url }) => ({ nome, url })) });
});
