import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeSalonWhatsAppNumber,
  salonTodayKey,
  salonNowTime,
  salonDateAtMost90DaysAhead,
  buildSalonWhatsAppRequestUrl,
} from "../apps/salon/src/booking/whatsapp-request.ts";

const number = "5511988149152";
const now = new Date("2026-10-23T15:00:00.000Z"); // 12:00 in São Paulo

test("calendar uses São Paulo local date/time and rejects past and impossible days", () => {
  assert.equal(salonTodayKey(now), "2026-10-23");
  assert.equal(salonNowTime(now), "12:00");
  assert.equal(salonDateAtMost90DaysAhead("2026-10-22", now), false);
  assert.equal(salonDateAtMost90DaysAhead("2026-10-24", now), true);
  assert.equal(salonDateAtMost90DaysAhead("2026-02-30", now), false);
  assert.equal(salonDateAtMost90DaysAhead("2027-08-30", now), false);
});

test("WhatsApp request is only valid for verified destination and selected fields", () => {
  assert.equal(normalizeSalonWhatsAppNumber("(11) 98814-9152"), ""); // do not infer country code
  assert.equal(normalizeSalonWhatsAppNumber(number), number);
  assert.equal(normalizeSalonWhatsAppNumber("11999999999"), "");
  assert.equal(buildSalonWhatsAppRequestUrl("", { service:"Cabelos",date:"2026-10-24",time:"10:00" }, now), null);
  assert.equal(buildSalonWhatsAppRequestUrl(number, { service:"",date:"2026-10-24",time:"10:00" }, now), null);
  assert.equal(buildSalonWhatsAppRequestUrl(number, { service:"Cabelos",date:"2026-10-23",time:"11:30" }, now), null);
  assert.equal(buildSalonWhatsAppRequestUrl(number, { service:"Cabelos",date:"2026-10-24",time:"30:99" }, now), null);
});

test("message contains selected service, date, time, custom note and no claim of reserved slot", () => {
  const url = buildSalonWhatsAppRequestUrl(number, {
    service: " Cabelos e tratamentos ",
    date: "2026-10-24",
    time: "10:30",
    note: " Tenho sensibilidade no couro cabeludo ",
  }, now);
  assert.ok(url);
  const parsed = new URL(url);
  assert.equal(parsed.hostname, "wa.me");
  assert.equal(parsed.pathname, "/" + number);
  const msg = parsed.searchParams.get("text") || "";
  assert.match(msg, /Cabelos e tratamentos/);
  assert.match(msg, /24\/10\/2026/);
  assert.match(msg, /10:30/);
  assert.match(msg, /Tenho sensibilidade/);
  assert.match(msg, /aguardo a confirmação/);
  assert.doesNotMatch(msg, /horário reservado|agendamento confirmado/i);
  assert.equal(buildSalonWhatsAppRequestUrl(number, { service:"Serviço",date:"2026-10-24",time:"10:30",note:"x".repeat(501) }, now), null);
});
