import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";

/**
 * Extracts the `id` param safely across all Next.js versions.
 * In Next.js 15+, `context.params` is a Promise resolving to { id: string }.
 */
async function getId(context: { params: Promise<{ id: string }> } | { params: { id: string } }) {
    if (!context || !("params" in context)) return null;

    const maybePromise = context.params as any;
    const params = typeof maybePromise.then === "function" ? await maybePromise : maybePromise;
    return params?.id ?? null;
}

// ------------------------
// GET: Fetch single member
// ------------------------
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const id = await getId(context);
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        const member = await prisma.member.findUnique({ where: { id } });
        if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json(member);
    } catch (err) {
        console.error("GET /api/members/[id] error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// ------------------------
// PUT: Update a member
// ------------------------
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const tokenData = await getBoardingFromReq(req);
        if (!tokenData)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const id = await getId(context);
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        const body = await req.json();

        const existing = await prisma.member.findUnique({ where: { id } });
        if (!existing || existing.boardingId !== tokenData.boardingId)
            return NextResponse.json({ error: "Not permitted" }, { status: 403 });

        const updated = await prisma.member.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(updated);
    } catch (err) {
        console.error("PUT /api/members/[id] error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// ------------------------
// DELETE: Remove a member
// ------------------------
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const tokenData = await getBoardingFromReq(req);
        if (!tokenData)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const id = await getId(context);
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        const existing = await prisma.member.findUnique({ where: { id } });
        if (!existing || existing.boardingId !== tokenData.boardingId)
            return NextResponse.json({ error: "Not permitted" }, { status: 403 });

        await prisma.member.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("DELETE /api/members/[id] error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
