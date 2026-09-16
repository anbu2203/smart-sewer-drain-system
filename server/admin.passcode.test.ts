import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Admin passcode secret", () => {
  const ctx = { req: {} as TrpcContext["req"], res: {} as TrpcContext["res"], user: undefined } as TrpcContext;

  it("is configured server-side and is not read from a VITE client variable", () => {
    expect(process.env.SSOP_ADMIN_PASSCODE).toBeTruthy();
    expect(process.env.VITE_SSOP_ADMIN_PASSCODE).toBeUndefined();
  });

  it("verifies the managed passcode through the server procedure", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.auth.verifyAdminPasscode({ passcode: process.env.SSOP_ADMIN_PASSCODE! })).resolves.toEqual({ success: true });
    await expect(caller.auth.verifyAdminPasscode({ passcode: "incorrect-passcode" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
