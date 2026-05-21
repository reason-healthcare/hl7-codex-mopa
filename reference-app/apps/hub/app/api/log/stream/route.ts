import { subscribe, recent } from "../store";

// Prevent Next.js from caching this route and force it to stay open
export const dynamic = "force-dynamic";

/**
 * GET /api/log/stream — Server-Sent Events stream of log entries.
 *
 * On connect the last 100 entries are replayed so the client has
 * context before live events begin. New entries are pushed as they
 * arrive via the ring buffer subscriber mechanism.
 */
export async function GET() {
  const encoder = new TextEncoder();

  // Shared cleanup — must be accessible from both start() and cancel()
  // because ReadableStream ignores start()'s return value.
  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      // Replay recent history so the UI is not empty on first load
      for (const entry of recent(100)) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(entry)}\n\n`));
      }

      // Subscribe to live entries
      const unsub = subscribe((entry) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(entry)}\n\n`));
        } catch {
          cleanup?.();
        }
      });

      // Keep-alive ping every 15 s to prevent proxy/browser timeout
      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          cleanup?.();
        }
      }, 15_000);

      cleanup = () => {
        clearInterval(ping);
        unsub();
      };
    },

    // WHATWG ReadableStream calls cancel() when the reader disconnects.
    // start()'s return value is intentionally ignored by the spec.
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
