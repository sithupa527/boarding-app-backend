import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";


export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params; // 👈 await here

    // fetch from DB
    const member = await prisma.member.findUnique({
        where: { id },
    });

    if (!member) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(member);
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const member = await prisma.member.update({
        where: { id: params.id },
        data: body,
    });
    return NextResponse.json(member);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.member.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
}
