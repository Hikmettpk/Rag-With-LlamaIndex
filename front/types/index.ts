export type Source = {
    text: string;
    document: string;
    page: number | null;
    metadata?: Record<string, unknown>;
};
