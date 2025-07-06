import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const consultationId = params.id
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  try {
    // Get messages with sender info and prescription data
    const messages = await prisma.message.findMany({
      where: { consultationId },
      include: {
        sender: true,
        prescription: true,
        reads: {
          select: { userId: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    // Get typing indicators
    const typingIndicators = await prisma.typingIndicator.findMany({
      where: {
        consultationId,
        updatedAt: {
          gte: new Date(Date.now() - 3000), // Last 3 seconds
        },
        userId: {
          not: userId || undefined,
        },
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    })

    // Process messages with read receipts and prescription data
    const messagesWithReads = messages.map((message) => ({
      ...message,
      read_by: message.reads.map((r) => r.userId),
      prescription_data: message.prescription
        ? {
            medications: message.prescription.medications,
          }
        : null,
    }))

    const typingUsers = typingIndicators.map((t) => t.user.name).filter(Boolean)

    return NextResponse.json({
      messages: messagesWithReads,
      typingUsers,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const consultationId = params.id
  const { content, senderId, type } = await request.json()

  try {
    if (type === "typing") {
      if (content) {
        // Add/update typing indicator
        await prisma.typingIndicator.upsert({
          where: {
            consultationId_userId: {
              consultationId,
              userId: senderId,
            },
          },
          update: {
            updatedAt: new Date(),
          },
          create: {
            consultationId,
            userId: senderId,
          },
        })
      } else {
        // Remove typing indicator
        await prisma.typingIndicator.deleteMany({
          where: {
            consultationId,
            userId: senderId,
          },
        })
      }
      return NextResponse.json({ success: true })
    }

    if (type === "message") {
      const message = await prisma.message.create({
        data: {
          consultationId,
          senderId,
          content,
        },
        include: {
          sender: true,
        },
      })

      // Mark as read by sender
      await prisma.messageRead.create({
        data: {
          messageId: message.id,
          userId: senderId,
        },
      })

      return NextResponse.json({ message })
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
