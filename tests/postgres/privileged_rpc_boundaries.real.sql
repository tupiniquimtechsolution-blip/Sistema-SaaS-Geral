-- Disposable CI ONLY. Isolated model of remote privileged RPC authorization edges.
-- These probes are NOT the deployed consume_ai_credit/write_audit_log functions
-- and cannot prove provider-metering or audit provenance. No real Supabase access.
\set ON_ERROR_STOP on

BEGIN;
CREATE TABLE public.qa_rpc_usage_probe (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  actor_id uuid NOT NULL,
  credits integer NOT NULL
);
CREATE TABLE public.qa_rpc_audit_probe (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  actor_id uuid NOT NULL,
  event_label text NOT NULL
);
ALTER TABLE public.qa_rpc_usage_probe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_rpc_audit_probe ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.qa_rpc_usage_probe,public.qa_rpc_audit_probe TO authenticated;
-- Only model identity/tenant/argument boundaries observed in remote RPC code.
-- A member with no server-operation receipt is not rejected by these guards:
-- this is a risk for follow-up, not an E2E billing/AI security PASS.
CREATE FUNCTION public.qa_consume_credit_probe(p_tenant_id uuid,p_credits integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private,auth,pg_temp
AS $model$
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_tenant_member(p_tenant_id) THEN
    RAISE EXCEPTION 'access denied' USING ERRCODE='42501';
  END IF;
  IF p_credits IS NULL OR p_credits<=0 OR p_credits>1000 THEN
    RAISE EXCEPTION 'invalid credits' USING ERRCODE='22023';
  END IF;
  INSERT INTO public.qa_rpc_usage_probe(tenant_id,actor_id,credits)
  VALUES (p_tenant_id,auth.uid(),p_credits);
END
$model$;
CREATE FUNCTION public.qa_write_audit_probe(p_tenant_id uuid,p_label text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private,auth,pg_temp
AS $model$
BEGIN
  IF NOT private.is_tenant_member(p_tenant_id) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE='42501';
  END IF;
  INSERT INTO public.qa_rpc_audit_probe(tenant_id,actor_id,event_label)
  VALUES (p_tenant_id,auth.uid(),p_label);
END
$model$;
REVOKE ALL ON FUNCTION public.qa_consume_credit_probe(uuid,integer) FROM public;
REVOKE ALL ON FUNCTION public.qa_write_audit_probe(uuid,text) FROM public;
GRANT EXECUTE ON FUNCTION public.qa_consume_credit_probe(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.qa_write_audit_probe(uuid,text) TO authenticated;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
DO $probe_a$
DECLARE
  a constant uuid := '00000000-0000-4000-8000-00000000000a';
  b constant uuid := '00000000-0000-4000-8000-00000000000b';
BEGIN
  IF public.is_platform_admin() THEN RAISE EXCEPTION 'QA-A has platform privilege'; END IF;
  -- A can use the selected RPCs for its own tenant. This positive case
  -- characterizes current membership-only authorization, not model provenance.
  PERFORM public.qa_consume_credit_probe(a,1);
  PERFORM public.qa_write_audit_probe(a,'qa-model-event');
  BEGIN
    PERFORM public.qa_consume_credit_probe(b,1);
    RAISE EXCEPTION 'CROSS_TENANT_CREDIT_ALLOWED';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.qa_write_audit_probe(b,'qa-model-event');
    RAISE EXCEPTION 'CROSS_TENANT_AUDIT_ALLOWED';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.qa_consume_credit_probe(a,0);
    RAISE EXCEPTION 'INVALID_CREDIT_ALLOWED';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
  BEGIN
    INSERT INTO public.qa_rpc_usage_probe(tenant_id,actor_id,credits)
    VALUES(a,auth.uid(),1);
    RAISE EXCEPTION 'DIRECT_LEDGER_INSERT_ALLOWED';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'QA_RPC_A=PASS (own tenant positive; B/invalid/direct writes deny)';
END
$probe_a$;

SET LOCAL request.jwt.claim.sub='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
DO $probe_b$
DECLARE
  a constant uuid := '00000000-0000-4000-8000-00000000000a';
  b constant uuid := '00000000-0000-4000-8000-00000000000b';
BEGIN
  IF public.is_platform_admin() THEN RAISE EXCEPTION 'QA-B has platform privilege'; END IF;
  BEGIN
    PERFORM public.qa_consume_credit_probe(a,1);
    RAISE EXCEPTION 'B_TO_A_CREDIT_ALLOWED';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.qa_write_audit_probe(a,'qa-model-event');
    RAISE EXCEPTION 'B_TO_A_AUDIT_ALLOWED';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  -- Read-only viewer B is nevertheless a tenant member; this probe models
  -- current membership guard, not a privilege-based RPC or trusted provenance.
  PERFORM public.qa_write_audit_probe(b,'qa-model-event');
  RAISE NOTICE 'QA_RPC_B=PASS (A denied; own membership path characterized)';
END
$probe_b$;

SET LOCAL request.jwt.claim.sub='';
DO $probe_unknown$
BEGIN
  BEGIN
    PERFORM public.qa_consume_credit_probe('00000000-0000-4000-8000-00000000000a',1);
    RAISE EXCEPTION 'UNIDENTIFIED_CREDIT_ALLOWED';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.qa_write_audit_probe('00000000-0000-4000-8000-00000000000a','qa-model-event');
    RAISE EXCEPTION 'UNIDENTIFIED_AUDIT_ALLOWED';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'QA_RPC_NO_IDENTITY=PASS (denied)';
END
$probe_unknown$;
RESET ROLE;

DO $acl$
BEGIN
  IF has_function_privilege('anon','public.qa_consume_credit_probe(uuid,integer)','EXECUTE')
     OR has_function_privilege('anon','public.qa_write_audit_probe(uuid,text)','EXECUTE') THEN
    RAISE EXCEPTION 'anonymous RPC access granted';
  END IF;
  IF (SELECT count(*) FROM public.qa_rpc_usage_probe)<>1
    OR (SELECT count(*) FROM public.qa_rpc_audit_probe)<>2 THEN
    RAISE EXCEPTION 'wrong number of synthetic, model-only events';
  END IF;
  RAISE NOTICE 'QA_RPC_ACL=PASS (anon denied; synthetic event counts)';
END
$acl$;
ROLLBACK;
\echo 'PRIVILEGED_RPC_BOUNDARIES=PASS (model only; provenance risk remains unresolved)'
