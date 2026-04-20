import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scanId, status, userId = "anonymous_patient" } = body;

    if (status === "completed") {
      // Implement the notification creation logic here
      const notification = await prisma.notification.create({
        data: {
          userId: userId,
          title: "New Scan Uploaded",
          message: `The patient has successfully uploaded all 5 views for scan ${scanId}. Please review them.`,
          read: false,
        }
      });
      
      console.log(`[API] Notification created: ${notification.id} for scan ${scanId}`);
      
      return NextResponse.json({ ok: true, message: "Notification triggered", notification });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Notification API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
