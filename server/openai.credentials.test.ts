import { describe, expect, it } from "vitest";

describe("OpenAI credentials", () => {
  it("can read the models endpoint without sending a chat request", async () => {
    const key = process.env.OPENAI_API_KEY;
    expect(key).toBeTruthy();
    const response = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${key}` } });
    expect(response.ok).toBe(true);
    const body = await response.json() as { data?: unknown[] };
    expect(Array.isArray(body.data)).toBe(true);
  }, 15000);
});
