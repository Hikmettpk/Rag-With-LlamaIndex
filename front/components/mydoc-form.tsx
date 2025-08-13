"use client";

// AI-generated: MyDocForm - Kendi Belgeme Sor formu
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, StopCircle, Loader2 } from "lucide-react";

interface MyDocFormProps {
    question: string;
    setQuestion: (q: string) => void;
    onAsk: (e: React.FormEvent) => void;
    onCancel: () => void;
    loading: boolean;
}

export function MyDocForm({ question, setQuestion, onAsk, onCancel, loading }: MyDocFormProps) {
    return (
        <Card className="mb-8 shadow-sm border-slate-200">
            <CardContent className="p-6">
                <form onSubmit={onAsk} className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                            type="text"
                            placeholder="Kendi belgeme soru sor"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="pl-10 h-12 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        {loading && (
                            <Button type="button" variant="outline" onClick={onCancel} className="border-slate-300 text-slate-700 hover:bg-slate-50">
                                <StopCircle className="w-4 h-4 mr-2" />
                                İptal Et
                            </Button>
                        )}
                        <Button type="submit" disabled={loading || !question.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 h-10">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analiz Ediliyor...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4 mr-2" />
                                    Kendi Belgeme Sor
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}