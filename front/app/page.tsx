"use client";

import { useRef, useState } from "react";
import { QuestionForm } from "../components/question-form";
import { StreamingAnswer } from "../components/streaming-answer";
import { SourcesList } from "../components/sources-list";
import { EmptyState } from "../components/empty-state";
import { Button } from "@/components/ui/button";
import { MyDocForm } from "../components/mydoc-form";

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

  // AI-generated: my-doc states
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadGroupId, setUploadGroupId] = useState<string | null>(null);
  const [myQuestion, setMyQuestion] = useState("");

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
      setAnswer((prev) => (prev ? prev + "\n\n" : "") + `Error: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  function onCancel() {
    controllerRef.current?.abort();
    setLoading(false);
  }

  // AI-generated: upload confirm
  async function onUploadConfirm() {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const resp = await fetch("/api/upload", { method: "POST", body: fd });
      if (!resp.ok) {
        throw new Error(await resp.text());
      }
      const data = await resp.json();
      setUploadGroupId(data.upload_group_id);
      setShowUploader(false);
    } catch (e: any) {
      alert(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  }

  async function onAskMyDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!myQuestion.trim() || !uploadGroupId) return;

    setAnswer("");
    setSources([]);
    setLoading(true);

    controllerRef.current?.abort();
    const ctrl = new AbortController();
    controllerRef.current = ctrl;

    try {
      const resp = await fetch("/api/ask-upload-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: myQuestion, max_results: 5, upload_group_id: uploadGroupId }),
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
              // ignore
            }
          }
        }
      }
    } catch (err: any) {
      setAnswer((prev) => (prev ? prev + "\n\n" : "") + `Error: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">OYA</h1>
          <p className="text-slate-600 text-lg">Yeni nesil şirket içi sohbet aracınız</p>
        </div>

        {/* AI-generated: Kendi belgelerim butonu */}
        <div className="mb-4 flex justify-end">
          <Button variant="outline" onClick={() => setShowUploader((v) => !v)}>
            Kendi Belgelerime Soru Sor
          </Button>
        </div>

        {/* AI-generated: Upload panel */}
        {showUploader && (
          <div className="mb-6 border-2 border-dashed rounded-md p-4 bg-white">
            <div
              className="text-center text-slate-600 cursor-pointer py-6"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f && f.type === "application/pdf") setSelectedFile(f);
              }}
            >
              {selectedFile ? (
                <span>Seçili dosya: {selectedFile.name}</span>
              ) : (
                <span>PDF yüklemek için tıklayın veya sürükleyip bırakın</span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setSelectedFile(f);
                }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => { setShowUploader(false); setSelectedFile(null); }} disabled={uploading}>
                İptal
              </Button>
              <Button onClick={onUploadConfirm} disabled={!selectedFile || uploading}>
                {uploading ? "Yükleniyor..." : "Tamam"}
              </Button>
            </div>
          </div>
        )}

        {/* Global veriler için form (mevcut) */}
        <QuestionForm question={question} setQuestion={setQuestion} onAsk={onAsk} onCancel={onCancel} loading={loading} />

        {/* AI-generated: Yüklenen belgeye özel form (upload sonrası görünür) */}
        {uploadGroupId && (
          <MyDocForm question={myQuestion} setQuestion={setMyQuestion} onAsk={onAskMyDoc} onCancel={onCancel} loading={loading} />
        )}

        {(answer || loading) && <StreamingAnswer answer={answer} loading={loading} />}

        {/* Sources */}
        {sources.length > 0 && <SourcesList sources={sources} />}

        {/* Empty State */}
        {!answer && !loading && <EmptyState />}
      </div>
    </div>
  );
}