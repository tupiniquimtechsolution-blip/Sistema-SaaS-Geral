import { createClient } from "@supabase/supabase-js";

/** QA-only, anonymous/readonly readiness evidence for the Vanessa → Salon tenant. */
const url=process.env.QA_SUPABASE_URL;
const key=process.env.QA_SUPABASE_PUBLISHABLE_KEY;
const ref=process.env.QA_APPROVED_PROJECT_REF;
if(ref!=="ynqbnimlpxlokrxlucdm"||url!=="https://ynqbnimlpxlokrxlucdm.supabase.co"||!key)
  throw new Error("QA canonical Supabase project guard failed");

const c=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const {data:payload,error:bootstrapError}=await c.rpc("get_storefront_bootstrap",{p_tenant_slug:"vanessa-braz"});
if(bootstrapError) throw new Error("Public storefront bootstrap RPC failed");
const row=Array.isArray(payload)?payload[0]:payload;
const exists=row&&row.tenant_slug==="vanessa-braz"&&row.vertical_id==="salon"&&
  typeof row.tenant_id==="string";
let mediaPermission=false,published=0,approvedPhotos=0;
let brandConfirmed=false, demoMode=false, bookingDisabled=false;
if(exists){
  const publicSettings=row.settings?.public_settings??{};
  brandConfirmed=row.brand?.display_name==="Vanessa Braz";
  demoMode=row.tenant_status==="demo";
  bookingDisabled=publicSettings.bookingEnabled===false;
  if(!bookingDisabled)throw new Error("QA Vanessa booking must remain disabled before owner approval");
  mediaPermission=publicSettings.mediaPublicationAuthorized===true;
  const pages=await c.from("pages").select("id").eq("tenant_id",row.tenant_id)
    .eq("slug","inicio").eq("status","published").limit(1);
  if(pages.error)throw new Error("Public Builder page read failed");
  published=pages.data?.length??0;
  if(mediaPermission){
    const photos=await c.from("media_assets").select("id").eq("tenant_id",row.tenant_id)
      .eq("visibility","public").eq("storage_bucket","tenant-public").limit(24);
    if(photos.error)throw new Error("Public approved media inventory read failed");
    approvedPhotos=photos.data?.length??0;
  }
}
const checks=[
  ["Tenant Vanessa no Supabase QA",Boolean(exists)],
  ["Marca Vanessa Braz configurada",brandConfirmed],
  ["Modo QA demonstracao",demoMode],
  ["Agendamento nao ativado sem aceite",bookingDisabled],
  ["Autorização pública de mídia",mediaPermission],
  ["Mídia pública vinculada ao tenant",approvedPhotos>0],
  ["Página inicio publicada pelo Builder",published>0]
];
const ready=checks.every(([,v])=>v);
const report=[
  "## Vanessa → Salon: readiness somente leitura",
  "Branch QA / Supabase QA, sem mutações. **Esta é uma checagem de prontidão, não liberação comercial.**",
  "| Pré-requisito | Estado |",
  "|---|---|",
  ...checks.map(([label,ok])=>"| "+label+" | "+(ok?"CONFIRMADO":"PENDENTE")+" |"),
  "",
  ready?"Contrato público básico: PRESENTE (aceite funcional e consentimento ainda necessários)":
        "**NO-GO integração live da Vanessa**: faltam pré-requisitos de conteúdo/tenant."
].join("\n");
console.log(report);
if(process.env.GITHUB_STEP_SUMMARY){
  const fs=await import("node:fs");
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,report+"\n");
}
