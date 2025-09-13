import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth"; // JWT helper
import { NextResponse } from "next/server";

// GET and POST handler
export async function GET(req: Request) {
    const boarding = await getBoardingFromReq(req);
    if (!boarding) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await prisma.boarding.findUnique({
        where: { id: boarding.boardingId },
        select: { keyLocation: true },
    });

    return NextResponse.json({ keyLocation: data?.keyLocation });
}

export async function POST(req: Request) {
    const boarding = await getBoardingFromReq(req);
    if (!boarding) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { keyLocation } = body;

    if (!keyLocation) return NextResponse.json({ error: "Missing keyLocation" }, { status: 400 });

    const updated = await prisma.boarding.update({
        where: { id: boarding.boardingId },
        data: { keyLocation },
    });

    return NextResponse.json({ success: true, keyLocation: updated.keyLocation });
}
