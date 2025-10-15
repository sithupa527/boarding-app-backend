import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(member);
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await req.json();

    const updated = await prisma.member.update({
        where: { id },
        data: body,
    });

    return NextResponse.json(updated);
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    await prisma.member.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
