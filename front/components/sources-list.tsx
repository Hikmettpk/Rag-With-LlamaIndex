"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText } from 'lucide-react';

type Source = {
    text: string;
    document: string;
    page: number | null;
    metadata?: Record<string, unknown>;
};

interface SourcesListProps {
    sources: Source[];
}

export function SourcesList({ sources }: SourcesListProps) {
    return (
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Kaynaklar ({sources.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {sources.map((source, idx) => (
                        <div key={idx} className="group">
                            <div className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-slate-900 truncate">
                                            {source.document}
                                        </h4>
                                        {source.page !== null && (
                                            <Badge variant="secondary" className="text-xs">
                                                Page {source.page}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {source.text}
                                    </p>
                                </div>
                            </div>
                            {idx < sources.length - 1 && (
                                <Separator className="my-4 bg-slate-200" />
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
