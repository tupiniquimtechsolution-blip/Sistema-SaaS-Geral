-- AI Tenant Studio commercial capabilities.
-- Forward-only, additive. Runtime authorization remains RBAC + tenant scope + RLS.
INSERT INTO public.features (key, description, value_type) VALUES
 ('ai.chat.enabled','AI Tenant Studio conversational editing','boolean'),
 ('ai.contentEdit.enabled','AI-assisted tenant content/contact editing','boolean'),
 ('ai.catalogEdit.enabled','AI-assisted catalog/service editing','boolean'),
 ('ai.media.enabled','AI-assisted media operations','boolean'),
 ('ai.sectionEdit.enabled','AI-assisted registered section editing','boolean'),
 ('ai.design.enabled','AI-assisted design token and component variant editing','boolean'),
 ('ai.redesign.enabled','AI-assisted page redesign proposals','boolean'),
 ('ai.bulkEdit.enabled','AI-assisted bulk tenant edits','boolean'),
 ('ai.publish.enabled','AI-assisted approved revision publication','boolean'),
 ('ai.credits.monthly','Monthly AI operation credit allowance','integer')
ON CONFLICT (key) DO UPDATE SET description=EXCLUDED.description,value_type=EXCLUDED.value_type;

INSERT INTO public.plan_entitlements(plan_id,feature_key,value)
SELECT p.id,v.feature_key,v.value
FROM public.plans p
JOIN (VALUES
 ('demo','ai.chat.enabled','true'::jsonb),('demo','ai.contentEdit.enabled','true'::jsonb),('demo','ai.catalogEdit.enabled','false'::jsonb),('demo','ai.media.enabled','false'::jsonb),('demo','ai.sectionEdit.enabled','false'::jsonb),('demo','ai.design.enabled','false'::jsonb),('demo','ai.redesign.enabled','false'::jsonb),('demo','ai.bulkEdit.enabled','false'::jsonb),('demo','ai.publish.enabled','false'::jsonb),('demo','ai.credits.monthly','25'::jsonb),
 ('starter','ai.chat.enabled','true'::jsonb),('starter','ai.contentEdit.enabled','true'::jsonb),('starter','ai.catalogEdit.enabled','false'::jsonb),('starter','ai.media.enabled','false'::jsonb),('starter','ai.sectionEdit.enabled','false'::jsonb),('starter','ai.design.enabled','false'::jsonb),('starter','ai.redesign.enabled','false'::jsonb),('starter','ai.bulkEdit.enabled','false'::jsonb),('starter','ai.publish.enabled','false'::jsonb),('starter','ai.credits.monthly','100'::jsonb),
 ('pro','ai.chat.enabled','true'::jsonb),('pro','ai.contentEdit.enabled','true'::jsonb),('pro','ai.catalogEdit.enabled','true'::jsonb),('pro','ai.media.enabled','true'::jsonb),('pro','ai.sectionEdit.enabled','true'::jsonb),('pro','ai.design.enabled','true'::jsonb),('pro','ai.redesign.enabled','false'::jsonb),('pro','ai.bulkEdit.enabled','false'::jsonb),('pro','ai.publish.enabled','false'::jsonb),('pro','ai.credits.monthly','500'::jsonb),
 ('business','ai.chat.enabled','true'::jsonb),('business','ai.contentEdit.enabled','true'::jsonb),('business','ai.catalogEdit.enabled','true'::jsonb),('business','ai.media.enabled','true'::jsonb),('business','ai.sectionEdit.enabled','true'::jsonb),('business','ai.design.enabled','true'::jsonb),('business','ai.redesign.enabled','true'::jsonb),('business','ai.bulkEdit.enabled','true'::jsonb),('business','ai.publish.enabled','true'::jsonb),('business','ai.credits.monthly','2000'::jsonb)
) AS v(plan_id,feature_key,value) ON v.plan_id=p.id
ON CONFLICT(plan_id,feature_key) DO UPDATE SET value=EXCLUDED.value;
