import { describe, expect, it } from "vitest";
import twilio from "twilio";

describe("Twilio server credentials", () => {
  it("authenticate without sending a WhatsApp message", async () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKeySid = process.env.TWILIO_API_KEY_SID;
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

    expect(accountSid).toMatch(/^AC[a-zA-Z0-9]{32}$/);
    expect(apiKeySid).toMatch(/^SK[a-zA-Z0-9]{32}$/);
    expect(apiKeySecret).toBeTruthy();

    const client = twilio(apiKeySid!, apiKeySecret!, { accountSid: accountSid! });
    const account = await client.api.v2010.accounts(accountSid!).fetch();
    expect(account.sid).toBe(accountSid);
  }, 20_000);
});
