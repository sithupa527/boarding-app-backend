import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";

export async function GET(req: Request) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const members = await prisma.member.findMany({
        where: { boardingId: tokenData.boardingId },
    });

    return NextResponse.json(members);
}

export async function POST(req: Request) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, indexNo, contact, email } = body;

    if (!name)
        return NextResponse.json({ error: "Name required" }, { status: 400 });

    const member = await prisma.member.create({
        data: {
            name,
            indexNo,
            contact,
            email,
            boardingId: tokenData.boardingId,
        },
    });

    return NextResponse.json(member);
}
