import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";

export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: memberId } = await context.params;
    const { isPaid } = await req.json();

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member || member.boardingId !== tokenData.boardingId)
        return NextResponse.json({ error: "Not allowed" }, { status: 403 });

    const updated = await prisma.member.update({
        where: { id: memberId },
        data: { isPaid: Boolean(isPaid) },
    });

    return NextResponse.json(updated);
}
