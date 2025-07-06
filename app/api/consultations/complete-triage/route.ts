import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { selectDoctor, extractSymptoms } from "@/lib/doctor-selection"
import { ConsultationType, AITriageStatus } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const { consultationId, aiSummary } = await request.json()

    if (!consultationId || !aiSummary) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get consultation details
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { patient: true },
    })

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 })
    }

    // Extract symptoms and select doctor
    const criteria = extractSymptoms(aiSummary)
    const selectedDoctor = await selectDoctor(criteria)

    // Update consultation with doctor and change type
    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        doctorId: selectedDoctor.id,
        title: `Consultation - ${criteria.symptoms.substring(0, 50)}...`,
        consultationType: ConsultationType.HUMAN,
        aiTriageStatus: AITriageStatus.COMPLETED,
        triageSummary: aiSummary,
        urgency: criteria.urgency.toUpperCase() as any,
      },
      include: {
        patient: true,
        doctor: true,
      },
    })

    // Add triage summary as system message
    await prisma.message.create({
      data: {
        consultationId,
        senderId: consultation.patientId,
        content: `AI Triage Summary: ${aiSummary}`,
        messageType: "SYSTEM",
      },
    })

    // Add doctor introduction message
    await prisma.message.create({
      data: {
        consultationId,
        senderId: selectedDoctor.id,
        content: `Hello! I'm Dr. ${selectedDoctor.name}. I've reviewed your symptoms and I'm here to help. How are you feeling right now?`,
        messageType: "DOCTOR_INTRO",
      },
    })

    return NextResponse.json({
      consultation: updatedConsultation,
      doctor: selectedDoctor,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
