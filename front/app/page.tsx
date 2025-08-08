"use client";

import { useRef, useState } from "react";
import { QuestionForm } from "../components/question-form";
import { StreamingAnswer } from "../components/streaming-answer";
import { SourcesList } from "../components/sources-list";
import { EmptyState } from "../components/empty-state";

type Source = {
  text: string;
  document: string;
  page: number | null;
  metadata?: Record<string, unknown>;
};

export default function Page() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  async function onAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setAnswer("");
    setSources([]);
    setLoading(true);

    controllerRef.current?.abort();
    const ctrl = new AbortController();
    controllerRef.current = ctrl;

    try {
      const resp = await fetch("/api/ask-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, max_results: 5 }),
        signal: ctrl.signal,
      });

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });

        let sepIdx: number;
        while ((sepIdx = buf.indexOf("\n\n")) !== -1) {
          const chunk = buf.slice(0, sepIdx);
          buf = buf.slice(sepIdx + 2);

          if (chunk.startsWith("data: ")) {
            const jsonStr = chunk.slice(6);
            try {
              const evt = JSON.parse(jsonStr) as
                | { answerChunk: string }
                | { done: true; sources: Source[] }
                | { error: string };

              if ("error" in evt) {
                throw new Error(evt.error);
              } else if ("answerChunk" in evt) {
                setAnswer((prev) => prev + evt.answerChunk);
              } else if ("done" in evt) {
                setSources(evt.sources || []);
              }
            } catch {
              // ignore bad chunks
            }
          }
        }
      }
    } catch (err: any) {
      setAnswer(
        (prev) =>
          (prev ? prev + "\n\n" : "") +
          `Error: ${err?.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  }

  function onCancel() {
    controllerRef.current?.abort();
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Finansal Rapora Soru Sor
          </h1>
          <p className="text-slate-600 text-lg">
            Finansal belgelerinizden anında içgörüler edinin
          </p>
        </div>


        <QuestionForm
          question={question}
          setQuestion={setQuestion}
          onAsk={onAsk}
          onCancel={onCancel}
          loading={loading}
        />


        {(answer || loading) && (
          <StreamingAnswer answer={answer} loading={loading} />
        )}

        {/* Sources */}
        {sources.length > 0 && <SourcesList sources={sources} />}

        {/* Empty State */}
        {!answer && !loading && <EmptyState />}
      </div>
    </div>
  );
}
