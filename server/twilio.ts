import type { Express, Request } from "express";
import twilio from "twilio";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const dispatches = new Map<string, { sid: string; status: string; to: string; crewName?: string; ticketId?: string; updatedAt: string; errorCode?: string | null; errorMessage?: string | null }>();

export const dispatchInput = z.object({
  to: z.string().min(8),
  body: z.string().trim().min(1).max(1_600),
  crewName: z.string().trim().max(100).optional(),
  ticketId: z.string().trim().max(80).optional(),
});
export const statusInput = z.object({ sid: z.string().min(10).max(40) });

function normalizeWhatsAppNumber(value: string) {
  const number = value.trim().replace(/^whatsapp:/, "");
  if (!/^\+\d{8,15}$/.test(number)) throw new TRPCError({ code: "BAD_REQUEST", message: "Crew phone number must use E.164 format, for example +917358512873" });
  return `whatsapp:${number}`;
}

function getTwilio() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!accountSid || !apiKeySid || !apiKeySecret || !from) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Twilio dispatch is not configured on the server" });
  return { client: twilio(apiKeySid, apiKeySecret, { accountSid }), from };
}

function publicBaseUrl(req: Request) {
  const configured = process.env.PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.protocol || "http";
  return `${protocol}://${req.get("host")}`;
}

export async function sendWhatsAppDispatch(input: z.infer<typeof dispatchInput>, req: Request) {
  const { client, from } = getTwilio();
  const to = normalizeWhatsAppNumber(input.to);
  const message = await client.messages.create({
    from,
    to,
    body: input.body,
    statusCallback: `${publicBaseUrl(req)}/api/twilio/status`,
  });
  const record = { sid: message.sid, status: message.status, to, crewName: input.crewName, ticketId: input.ticketId, updatedAt: new Date().toISOString() };
  dispatches.set(message.sid, record);
  return record;
}

export async function getWhatsAppStatus(sid: string) {
  const { client } = getTwilio();
  try {
    const message = await client.messages(sid).fetch();
    const current = { ...(dispatches.get(sid) ?? { sid, to: message.to }), status: message.status, updatedAt: new Date().toISOString(), errorCode: message.errorCode ? String(message.errorCode) : null, errorMessage: message.errorMessage ?? null };
    dispatches.set(sid, current);
    return current;
  } catch {
    return dispatches.get(sid) ?? null;
  }
}

function webhookUrl(req: Request) {
  const configured = process.env.PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (configured) return `${configured}${req.originalUrl}`;
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return `${forwardedProto || req.protocol}://${req.get("host")}${req.originalUrl}`;
}

function isValidTwilioWebhook(req: Request) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return process.env.NODE_ENV !== "production";
  const signature = req.get("x-twilio-signature");
  return Boolean(signature && twilio.validateRequest(authToken, signature, webhookUrl(req), req.body));
}

export function registerTwilioStatusWebhook(app: Express) {
  app.post("/api/twilio/status", (req, res) => {
    if (!isValidTwilioWebhook(req)) return res.status(403).send("Invalid Twilio signature");
    const sid = req.body.MessageSid ?? req.body.SmsSid;
    if (sid) {
      const current = dispatches.get(sid) ?? { sid, to: req.body.To ?? "", status: "unknown", updatedAt: new Date().toISOString() };
      dispatches.set(sid, { ...current, status: req.body.MessageStatus ?? current.status, errorCode: req.body.ErrorCode ?? null, errorMessage: req.body.ErrorMessage ?? null, updatedAt: new Date().toISOString() });
    }
    return res.sendStatus(204);
  });
}
