import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json({ error: "Missing threadId" }, { status: 400 });
  }

  try {
    // Fetch messages for this thread
    const messages = await prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("Messaging GET API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { threadId, content, sender } = body;

    if (!threadId || !content || !sender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure the thread exists or create it
    let thread = await prisma.thread.findUnique({
      where: { id: threadId }
    });

    if (!thread) {
      thread = await prisma.thread.create({
        data: {
          id: threadId,
          patientId: "demo-patient-123" // In a real app, this comes from auth
        }
      });
    }

    // Save message to database
    const newMessage = await prisma.message.create({
      data: {
        threadId,
        content,
        sender
      }
    });

    console.log(`[API] New message in thread ${threadId} from ${sender}: ${content}`);

    return NextResponse.json({ ok: true, message: newMessage });
  } catch (err) {
    console.error("Messaging POST API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
