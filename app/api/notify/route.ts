import { NextResponse } from "next/server";
import { adminMessaging } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
    try {
        const { token, title, body } = await req.json();
        await adminMessaging.send({ token, notification: { title, body } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("❌ Notification send error:", error);
        return NextResponse.json({ success: false, error });
    }
}
