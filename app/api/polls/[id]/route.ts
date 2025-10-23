import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBoardingFromReq } from "@/lib/auth";

export async function POST(req: Request) {
    const tokenData = await getBoardingFromReq(req);
    if (!tokenData)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, optionId }: { action: "yes" | "no" | "undoYes" | "undoNo"; optionId: string } = await req.json();

    if (!optionId)
        return NextResponse.json({ error: "Invalid option" }, { status: 400 });

    const map = {
        yes: { yesCount: { increment: 1 } },
        no: { noCount: { increment: 1 } },
        undoYes: { yesCount: { decrement: 1 } },
        undoNo: { noCount: { decrement: 1 } },
    } as const;

    // ✅ Fix TypeScript error by casting map[action] explicitly
    const data = map[action] as unknown as Parameters<typeof prisma.pollOption.update>[0]["data"];

    const updated = await prisma.pollOption.update({
        where: { id: optionId },
        data,
    });

    return NextResponse.json(updated);
}
