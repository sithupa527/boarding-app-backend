import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: pollId } = await context.params; // optional if you want to use pollId
    const { memberId, optionId } = await req.json();

    if (!memberId || !optionId)
        return NextResponse.json(
            { error: "memberId and optionId required" },
            { status: 400 }
        );

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member || member.boardingId !== tokenData.boardingId)
        return NextResponse.json({ error: "Invalid member" }, { status: 403 });

    const vote = await prisma.vote.create({
        data: { memberId, optionId },
    });

    return NextResponse.json(vote);
}
