import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";

async function getId(context: { params: Promise<{ id: string }> } | { params: { id: string } }) {
    const maybePromise = (context as any)?.params;
    return typeof maybePromise?.then === "function"
        ? (await maybePromise)?.id
        : maybePromise?.id ?? null;
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const tokenData = await getBoardingFromReq(req);
        if (!tokenData)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const id = await getId(context);
        if (!id)
            return NextResponse.json({ error: "Missing id" }, { status: 400 });

        const body = await req.json();

        const member = await prisma.member.findUnique({ where: { id } });
        if (!member || member.boardingId !== tokenData.boardingId)
            return NextResponse.json({ error: "Not permitted" }, { status: 403 });

        // ------------------------------
        // ENTER: Mark as inside
        // ------------------------------
        if (body.isInside === true) {
            const updated = await prisma.member.update({
                where: { id },
                data: { isInside: true },
            });

            await prisma.boarding.update({
                where: { id: tokenData.boardingId },
                data: { keyLocation: null }, // clear last key location
            });

            return NextResponse.json(updated);
        }

        // ------------------------------
        // LEAVE: Mark as outside
        // ------------------------------
        if (body.isInside === false) {
            // find how many currently inside (excluding self)
            const othersInside = await prisma.member.count({
                where: {
                    boardingId: tokenData.boardingId,
                    isInside: true,
                    NOT: { id },
                },
            });

            const updated = await prisma.member.update({
                where: { id },
                data: { isInside: false },
            });

            // If last person leaving → record key location
            if (othersInside === 0 && body.keyLocation) {
                await prisma.boarding.update({
                    where: { id: tokenData.boardingId },
                    data: { keyLocation: body.keyLocation },
                });
            }

            return NextResponse.json(updated);
        }

        // ------------------------------
        // Any other updates (name, etc.)
        // ------------------------------
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
