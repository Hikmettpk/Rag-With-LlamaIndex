"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Search } from 'lucide-react';

export function EmptyState() {
    return (
        <Card className="shadow-sm border-slate-200 border-dashed">
            <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Ready to analyze your financial reports
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                    Ask questions about revenue trends, expense analysis, profitability metrics, or any other financial insights you need.
                </p>
            </CardContent>
        </Card>
    );
}
