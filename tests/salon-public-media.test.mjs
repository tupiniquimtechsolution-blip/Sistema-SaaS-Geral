import test from "node:test";
import assert from "node:assert/strict";
import { projectApprovedSalonPhotos, loadPublicSalonMedia } from "../apps/salon/src/business/public-media.ts";

const a="11111111-1111-4111-8111-111111111111",b="22222222-2222-4222-8222-222222222222";
const base={tenant_id:a,storage_bucket:"tenant-public",visibility:"public",storage_path:a+"/salon/hero.webp",mime_type:"image/webp",alt_text:"Hero autorizado"};

test("tenant-public media requires matching tenant, scope, mime and visibility",()=>{
  assert.deepEqual(projectApprovedSalonPhotos([base],a),[{path:base.storage_path,alt:"Hero autorizado"}]);
  for(const bad of [{...base,tenant_id:b},{...base,storage_bucket:"tenant-private"},{...base,visibility:"private"},
    {...base,mime_type:"application/pdf"},{...base,storage_path:b+"/salon/foreign.webp"},
    {...base,storage_path:a+"/salon/../secrets.webp"},{...base,storage_path:a+"/metalart/other.webp"},
    {...base,storage_path:"https://untrusted.example/image.webp"}]) assert.throws(()=>projectApprovedSalonPhotos([bad],a));
  assert.throws(()=>projectApprovedSalonPhotos([base,{...base,tenant_id:b}],a));
});
test("unapproved tenant performs no data or storage access",async()=>{
  const c={from(){throw Error("unexpected DB read");},storage:{from(){throw Error("unexpected Storage read");}}};
  assert.deepEqual(await loadPublicSalonMedia(c,a,false),[]);
});
test("approved tenant fetches public media with exact tenant filters",async()=>{
  const filters=[];
  const chain={select(v){filters.push(["select",v]);return this;},eq(k,v){filters.push(["eq",k,v]);return this;},
    order(k,v){filters.push(["order",k,v]);return this;},limit(v){filters.push(["limit",v]);return Promise.resolve({data:[base],error:null});}};
  const c={from(table){assert.equal(table,"media_assets");return chain;},storage:{from(bucket){assert.equal(bucket,"tenant-public");
    return {getPublicUrl(path){assert.equal(path,base.storage_path);
      return {data:{publicUrl:"https://qa.supabase.co/storage/v1/object/public/tenant-public/"+path}};}};}}};
  const result=await loadPublicSalonMedia(c,a,true);
  assert.equal(result.length,1);
  assert.equal(result[0].alt,"Hero autorizado");
  assert(filters.some(x=>x[0]==="eq"&&x[1]==="tenant_id"&&x[2]===a));
  assert(filters.some(x=>x[0]==="eq"&&x[1]==="visibility"&&x[2]==="public"));
  assert(filters.some(x=>x[0]==="eq"&&x[1]==="storage_bucket"&&x[2]==="tenant-public"));
});
