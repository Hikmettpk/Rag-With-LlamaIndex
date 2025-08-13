"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StreamingAnswerProps {
    answer: string;
    loading: boolean;
}

export function StreamingAnswer({ answer, loading }: StreamingAnswerProps) {
    return (
        <Card className="mb-8 shadow-sm border-slate-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Yanıt
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {answer || (loading ? "Finansal veri analiz ediliyor..." : "")}
                    {loading && (
                        <span className="inline-block w-2 h-4 bg-slate-400 ml-1 animate-pulse rounded-sm" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
