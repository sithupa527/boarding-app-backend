import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";

export async function GET(req: Request) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const polls = await prisma.poll.findMany({
        where: { boardingId: tokenData.boardingId },
        include: {
            options: { include: { votes: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(polls);
}

export async function POST(req: Request) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { mealType, shopName, options } = await req.json();

    if (!mealType)
        return NextResponse.json({ error: "mealType required" }, { status: 400 });
    if (!Array.isArray(options) || options.length === 0)
        return NextResponse.json({ error: "options required" }, { status: 400 });

    const poll = await prisma.poll.create({
        data: {
            mealType,
            shopName,
            boardingId: tokenData.boardingId,
            options: { create: options.map((t: string) => ({ text: t })) },
        },
        include: { options: true },
    });

    // (Optional) notify members — replace this with actual push logic
    const members = await prisma.member.findMany({
        where: { boardingId: tokenData.boardingId },
        select: { name: true, email: true },
    });

    console.log("📢 Notifying members:", members.map(m => m.email));

    return NextResponse.json(poll);
}

export async function DELETE(req: Request) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pollId } = await req.json();
    if (!pollId)
        return NextResponse.json({ error: "pollId required" }, { status: 400 });

    await prisma.poll.delete({
        where: { id: pollId, boardingId: tokenData.boardingId },
    });

    return NextResponse.json({ success: true });
}
