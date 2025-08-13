import { NextRequest } from "next/server";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
    const { question, max_results = 5, upload_group_id } = await req.json();

    const resp = await fetch(`${BACKEND_URL}/api/v1/uploads/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, max_results, upload_group_id }),
    });

    if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        return new Response(`data: ${JSON.stringify({ error: errText || "Backend error" })}\n\n`, {
            status: 500,
            headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
            },
        });
    }

    const data = await resp.json();
    const encoder = new TextEncoder();
    const answer: string = data.answer || "";
    const sources = data.sources || [];

    let idx = 0;
    const chunkSize = 10;

    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            function pushNext() {
                if (idx < answer.length) {
                    const nextChunk = answer.slice(idx, idx + chunkSize);
                    idx += chunkSize;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ answerChunk: nextChunk })}\n\n`));
                    setTimeout(pushNext, 25);
                } else {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, sources })}\n\n`));
                    controller.close();
                }
            }
            pushNext();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}