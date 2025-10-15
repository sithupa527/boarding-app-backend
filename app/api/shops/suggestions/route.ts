import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";

export async function GET(req: Request) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase() ?? "";

    const results = await prisma.poll.findMany({
        where: {
            boardingId: tokenData.boardingId,
            shopName: { contains: q, mode: "insensitive" },
        },
        distinct: ["shopName"],
        select: { shopName: true },
        take: 10,
    });

    return NextResponse.json(results.map(r => r.shopName));
}
