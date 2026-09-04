import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("jarvis.ask", () => {
  it("rejects an empty question before calling the model", async () => {
    const ctx = { req: {} as TrpcContext["req"], res: {} as TrpcContext["res"], user: undefined } as TrpcContext;
    const caller = appRouter.createCaller(ctx);
    await expect(caller.jarvis.ask({ question: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("exposes the autonomous assignment history query", async () => {
    const ctx = { req: {} as TrpcContext["req"], res: {} as TrpcContext["res"], user: undefined } as TrpcContext;
    const caller = appRouter.createCaller(ctx);
    const logs = await caller.workforce.jarvisAssignments();
    expect(Array.isArray(logs)).toBe(true);
  });
});
