import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";

export async function GET(req: Request) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const msgs = await prisma.chat.findMany({
        where: { boardingId: tokenData.boardingId },
        orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(msgs);
}

export async function POST(req: Request) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content, senderName, mediaUrl } = await req.json();
    if (!content && !mediaUrl) return NextResponse.json({ error: "Message empty" }, { status: 400 });

    const msg = await prisma.chat.create({
        data: {
            content: content ?? "",
            mediaUrl,
            senderName,
            boardingId: tokenData.boardingId,
        },
    });
    return NextResponse.json(msg);
}
