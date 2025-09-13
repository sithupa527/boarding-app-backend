import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        // Authenticate user
        const tokenData = await getBoardingFromReq(req);
        if (!tokenData) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch boarding info
        const boarding = await prisma.boarding.findUnique({
            where: { id: tokenData.boardingId },
            include: { members: true },
        });

        if (!boarding) {
            return NextResponse.json({ error: "Boarding not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: boarding.id,
            name: boarding.name,
            address: boarding.address,
            memberCount: boarding.memberCount,
            members: boarding.members,
        });
    } catch (err) {
        console.error("Error fetching boarding status:", err);
        return NextResponse.json({ error: "Failed to fetch boarding status" }, { status: 500 });
    }
}
