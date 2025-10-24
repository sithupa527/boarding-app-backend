import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const boarding = await getBoardingFromReq(req);
    if (!boarding)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await prisma.boarding.findUnique({
        where: { id: boarding.boardingId },
        select: { keyLocation: true },
    });

    if (!data)
        return NextResponse.json({ error: "Boarding not found" }, { status: 404 });

    return NextResponse.json({ keyLocation: data.keyLocation });
}

export async function POST(req: Request) {
    const boarding = await getBoardingFromReq(req);
    if (!boarding)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { keyLocation } = await req.json();
    if (!keyLocation)
        return NextResponse.json({ error: "Missing keyLocation" }, { status: 400 });

    const updated = await prisma.boarding.update({
        where: { id: boarding.boardingId },
        data: { keyLocation },
    });

    return NextResponse.json({ success: true, keyLocation: updated.keyLocation });
}
