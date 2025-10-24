import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { memberId, fcmToken } = await req.json();

        if (!memberId || !fcmToken) {
            return NextResponse.json({ error: "memberId and fcmToken required" }, { status: 400 });
        }

        await prisma.member.update({
            where: { id: memberId },
            data: { fcmToken },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("❌ Failed to register token:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
