import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { listTicketHistory, saveTicketHistory } from "./db";

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

  ticketHistory: router({
    list: publicProcedure.query(() => listTicketHistory()),
    recordApproval: publicProcedure.input(z.object({
      ticketId: z.string().min(1).max(32), manhole: z.string().min(1).max(32), title: z.string().min(1),
      status: z.string().min(1).max(32), crew: z.string().min(1).max(80), deadline: z.string().min(1).max(16),
      ward: z.string().max(80).optional(), fill: z.number().int().min(0).max(100).optional(),
      proofPhotos: z.array(z.string()).default([]), details: z.string().max(4000).optional(), approvedBy: z.string().max(160).optional(),
    })).mutation(({ input }) => saveTicketHistory({ ...input, proofPhotos: JSON.stringify(input.proofPhotos) })),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
