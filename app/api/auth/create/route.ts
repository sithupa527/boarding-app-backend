import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signBoardingToken } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, password, address, memberCount, members } = body;

        if (!name || !password) {
            return NextResponse.json({ error: "name and password required" }, { status: 400 });
        }

        const existing = await prisma.boarding.findUnique({ where: { name } });
        if (existing) {
            return NextResponse.json({ error: "boarding name already exists" }, { status: 409 });
        }

        const hashed = await bcrypt.hash(password, 10);

        const created = await prisma.boarding.create({
            data: {
                name,
                password: hashed,
                address,
                memberCount,
                members: members?.length
                    ? { create: members.map((m: any) => ({
                            name: m.name,
                            indexNo: m.indexNo,
                            contact: m.contact,
                            email: m.email
                        })) }
                    : undefined,
            },
            include: { members: true },
        });

        const token = signBoardingToken({ boardingId: created.id, boardingName: created.name });

        return NextResponse.json({ boarding: created, token });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "failed to create boarding" }, { status: 500 });
    }
}
