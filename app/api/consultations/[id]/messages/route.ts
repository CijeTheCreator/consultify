import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const consultationId = params.id
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  try {
    // Get messages with prescription data only (no sender relation)
    const messages = await prisma.message.findMany({
      where: { consultationId },
      include: {
        prescription: true,
        reads: {
          select: { userId: true },
        },
        // Remove sender relation since it doesn't exist
        // sender: true,
      },
      orderBy: { createdAt: "asc" },
    })

    // Get typing indicators without user relation
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
      // Remove user relation
      // include: {
      //   user: {
      //     select: { name: true },
      //   },
      // },
    })

    // Enrich messages with user data from Supabase Auth
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        let senderName = "Unknown User"
        try {
          const { data: senderData } = await supabase.auth.admin.getUserById(message.senderId)
          if (senderData.user) {
            senderName = senderData.user.user_metadata?.name || "Unknown User"
          }
        } catch (error) {
          console.error("Failed to fetch sender data:", error)
        }

        return {
          ...message,
          senderName,
          read_by: message.reads.map((r) => r.userId),
          prescription_data: message.prescription
            ? {
                medications: message.prescription.medications,
              }
            : null,
        }
      }),
    )

    // Get typing user names from Supabase Auth
    const typingUserNames = await Promise.all(
      typingIndicators.map(async (indicator) => {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(indicator.userId)
          return userData.user?.user_metadata?.name || "Unknown User"
        } catch (error) {
          console.error("Failed to fetch typing user data:", error)
          return "Unknown User"
        }
      }),
    )

    return NextResponse.json({
      messages: enrichedMessages,
      typingUsers: typingUserNames.filter(Boolean),
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
        // Remove sender relation
        // include: {
        //   sender: true,
        // },
      })

      // Mark as read by sender
      await prisma.messageRead.create({
        data: {
          messageId: message.id,
          userId: senderId,
        },
      })

      // Get sender data from Supabase Auth
      let senderName = "Unknown User"
      try {
        const { data: senderData } = await supabase.auth.admin.getUserById(senderId)
        if (senderData.user) {
          senderName = senderData.user.user_metadata?.name || "Unknown User"
        }
      } catch (error) {
        console.error("Failed to fetch sender data:", error)
      }

      return NextResponse.json({
        message: {
          ...message,
          senderName,
        },
      })
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
