import { describe, expect, it } from "vitest";

describe("Google Maps configuration", () => {
  it("loads the configured Maps JavaScript endpoint", async () => {
    const key = process.env.VITE_GOOGLE_MAPS_API_KEY;
    expect(key, "VITE_GOOGLE_MAPS_API_KEY must be configured").toBeTruthy();
    const response = await fetch(`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key!)}&v=weekly`, {
      signal: AbortSignal.timeout(8000),
    });
    expect(response.ok).toBe(true);
  }, 12000);
});
