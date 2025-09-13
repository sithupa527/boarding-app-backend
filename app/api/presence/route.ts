import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";

export async function GET(req: Request) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const inside = await prisma.member.findMany({
        where: { boardingId: tokenData.boardingId, isInside: true },
        orderBy: { name: "asc" },
    });

    // if none inside, include last known key location? (we will store key location per boarding later)
    return NextResponse.json(inside);
}
