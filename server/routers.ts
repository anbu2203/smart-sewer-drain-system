import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import { listEmployeeProfiles, listJarvisAssignmentLogs, listTicketAssignments, listTicketHistory, listTicketStatuses, recordJarvisAssignment, saveTicketHistory, seedEmployeeProfiles, upsertTicketAssignment, upsertTicketStatus } from "./db";

async function askChatGPT(question: string, context?: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.2, messages: [
        { role: "system", content: "You are JARVIS, the SSOP Smart Sewer Operations Platform assistant. Explain the system clearly to administrators and employees. Never invent live data; say when information is illustrative. Keep answers concise, practical, and safety-conscious." },
        { role: "user", content: `${context ? `Current SSOP context:\n${context}\n\n` : ""}${question}` },
      ] }),
    });
    if (!response.ok) return null;
    const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return body.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

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

  jarvis: router({
    ask: publicProcedure.input(z.object({ question: z.string().min(1).max(1200), context: z.string().max(5000).optional() })).mutation(async ({ input }) => {
      const externalAnswer = await askChatGPT(input.question, input.context);
      if (externalAnswer) return { answer: externalAnswer, provider: "ChatGPT" as const };
      const response = await invokeLLM({ messages: [
        { role: "system", content: "You are JARVIS, the SSOP Smart Sewer Operations Platform assistant. Explain the system clearly to administrators and employees. Never invent live data; say when information is illustrative. Keep answers concise, practical, and safety-conscious." },
        { role: "user", content: `${input.context ? `Current SSOP context:
${input.context}

` : ""}${input.question}` },
      ] });
      const content = response.choices?.[0]?.message?.content;
      return { answer: typeof content === "string" ? content : "JARVIS could not produce an answer right now.", provider: "SSOP secure assistant" as const };
    }),
  }),

  workforce: router({
    profiles: publicProcedure.query(() => listEmployeeProfiles()),
    assignments: publicProcedure.query(() => listTicketAssignments()),
    seedProfiles: publicProcedure.input(z.object({ profiles: z.array(z.object({ crewName: z.string().min(1).max(80), displayName: z.string().min(1).max(120) })) })).mutation(({ input }) => seedEmployeeProfiles(input.profiles)),
    assign: publicProcedure.input(z.object({ ticketId: z.string().min(1).max(32), crewName: z.string().min(1).max(80), assignedBy: z.string().max(120).optional() })).mutation(({ input }) => upsertTicketAssignment(input.ticketId, input.crewName, input.assignedBy)),
    statuses: publicProcedure.query(() => listTicketStatuses()),
    updateStatus: publicProcedure.input(z.object({ ticketId: z.string().min(1).max(32), status: z.string().min(1).max(32), updatedBy: z.string().max(120).optional() })).mutation(({ input }) => upsertTicketStatus(input.ticketId, input.status, input.updatedBy)),
    jarvisAssignments: publicProcedure.query(() => listJarvisAssignmentLogs()),
    recordJarvisAssignment: publicProcedure.input(z.object({ ticketId: z.string().min(1).max(32), crewName: z.string().min(1).max(80), assignedBy: z.string().max(120).optional() })).mutation(({ input }) => recordJarvisAssignment(input.ticketId, input.crewName, input.assignedBy)),
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
