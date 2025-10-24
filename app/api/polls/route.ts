import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";
import { adminMessaging } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const polls = await prisma.poll.findMany({
        where: { boardingId: tokenData.boardingId },
        include: { options: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(polls);
}

export async function POST(req: Request) {
    try {
        const tokenData = await getBoardingFromReq(req);
        if (!tokenData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { mealType, shopName, options } = await req.json();

        if (!mealType || !Array.isArray(options) || options.length === 0) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const poll = await prisma.poll.create({
            data: {
                mealType,
                shopName,
                boardingId: tokenData.boardingId,
                options: { create: options.map((text: string) => ({ text })) },
            },
            include: { options: true },
        });

        const members = await prisma.member.findMany({
            where: { boardingId: tokenData.boardingId },
            select: { fcmToken: true },
        });

        const tokens = members.map(m => m.fcmToken).filter((t): t is string => !!t);

        if (tokens.length > 0) {
            await adminMessaging.sendEachForMulticast({
                tokens,
                notification: {
                    title: `🍽️ New ${mealType} Poll`,
                    body: shopName ? `Vote for ${shopName}!` : "A new meal poll is open!",
                },
                data: { pollId: poll.id },
            });
        }

        return NextResponse.json(poll);
    } catch (error) {
        console.error("❌ Poll creation failed:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pollId } = await req.json();
    if (!pollId) return NextResponse.json({ error: "pollId required" }, { status: 400 });

    await prisma.poll.delete({ where: { id: pollId } });
    return NextResponse.json({ success: true });
}
