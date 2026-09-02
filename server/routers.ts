import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { dispatchInput, getWhatsAppStatus, sendWhatsAppDispatch, statusInput } from "./twilio";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  whatsapp: router({
    sendDispatch: protectedProcedure.input(dispatchInput).mutation(async ({ input, ctx }) => {
      try {
        return await sendWhatsAppDispatch(input, ctx.req);
      } catch (error) {
        if (error instanceof Error && "code" in error) throw error;
        console.error("[Twilio] Failed to send WhatsApp dispatch", error);
        throw new Error("Unable to send WhatsApp dispatch");
      }
    }),
    status: protectedProcedure.input(statusInput).query(async ({ input }) => {
      const result = await getWhatsAppStatus(input.sid);
      if (!result) throw new Error("WhatsApp message status not found");
      return result;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
