import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signBoardingToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

interface MemberInput {
    name: string;
    indexNo: string;
    contact: string;
    email: string;
}

interface BoardingInput {
    name: string;
    password: string;
    address?: string;
    memberCount?: number;
    members?: MemberInput[];
}

export async function POST(req: NextRequest) {
    try {
        const body: BoardingInput = await req.json();
        const { name, password, address, memberCount, members } = body;

        if (!name || !password) {
            return NextResponse.json(
                { error: "name and password required" },
                { status: 400 }
            );
        }

        const existing = await prisma.boarding.findUnique({ where: { name } });
        if (existing) {
            return NextResponse.json(
                { error: "boarding name already exists" },
                { status: 409 }
            );
        }

        const hashed = await bcrypt.hash(password, 10);

        const created = await prisma.boarding.create({
            data: {
                name,
                password: hashed,
                address,
                memberCount,
                members: members && members.length > 0
                    ? {
                        create: members.map((m) => ({
                            name: m.name,
                            indexNo: m.indexNo,
                            contact: m.contact,
                            email: m.email,
                        })),
                    }
                    : undefined,
            },
            include: { members: true },
        });

        const token = signBoardingToken({
            boardingId: created.id,
            boardingName: created.name,
        });

        return NextResponse.json({ boarding: created, token });
    } catch (err: unknown) {
        console.error("Error creating boarding:", err);
        return NextResponse.json(
            { error: "failed to create boarding" },
            { status: 500 }
        );
    }
}
