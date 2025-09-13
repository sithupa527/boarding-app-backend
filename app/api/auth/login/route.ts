import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signBoardingToken } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { name, password } = await req.json();
        if (!name || !password) return NextResponse.json({ error: "Missing", status: 400 });

        const boarding = await prisma.boarding.findUnique({ where: { name }, include: { members: true } });
        if (!boarding) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

        const ok = await bcrypt.compare(password, boarding.password);
        if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

        const token = signBoardingToken({ boardingId: boarding.id, boardingName: boarding.name });

        return NextResponse.json({ boarding, token });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
