import { NextRequest } from "next/server";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
    const form = await req.formData();
    const resp = await fetch(`${BACKEND_URL}/api/v1/uploads`, {
        method: "POST",
        body: form,
    });
    const body = await resp.text();
    return new Response(body, {
        status: resp.status,
        headers: { "Content-Type": resp.headers.get("Content-Type") || "application/json" },
    });
}