import { subscribe, recent } from "../store";

/**
 * GET /api/log/stream — Server-Sent Events stream of log entries.
 *
 * On connect the last 100 entries are replayed so the client has
 * context before live events begin. New entries are pushed as they
 * arrive via the ring buffer subscriber mechanism.
 */
export async function GET() {
  const encoder = new TextEncoder();

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
          unsub();
        }
      });

      // Keep-alive ping every 15 s to prevent proxy/browser timeout
      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(ping);
          unsub();
        }
      }, 15_000);

      // Cleanup when the client disconnects (ReadableStream cancel)
      return () => {
        clearInterval(ping);
        unsub();
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering in Docker
    },
  });
}
