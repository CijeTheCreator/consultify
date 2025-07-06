import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase-server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const consultationId = params.id

  try {
    const { medications } = await request.json()

    if (!medications || !Array.isArray(medications)) {
      return NextResponse.json({ error: "Missing required medications field" }, { status: 400 })
    }

    // Get consultation to fetch doctorId and patientId
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      select: {
        doctorId: true,
        patientId: true,
      },
    })

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 })
    }

    if (!consultation.doctorId) {
      return NextResponse.json({ error: "No doctor assigned to this consultation" }, { status: 400 })
    }

    const { doctorId, patientId } = consultation

    // Validate medications
    const validMedications = medications.filter(
      (med) => med.drug_name?.trim() && med.amount?.trim() && med.frequency?.trim(),
    )

    if (validMedications.length === 0) {
      return NextResponse.json({ error: "No valid medications provided" }, { status: 400 })
    }

    // Create prescription record
    const prescription = await prisma.prescription.create({
      data: {
        consultationId,
        doctorId,
        patientId,
        medications: validMedications,
      },
    })

    // Create prescription message
    const message = await prisma.message.create({
      data: {
        consultationId,
        senderId: doctorId,
        content: `Prescription sent with ${validMedications.length} medication${validMedications.length > 1 ? "s" : ""}`,
        messageType: "PRESCRIPTION",
        prescriptionId: prescription.id,
      },
    })

    // Get doctor data from Supabase Auth
    let doctorName = "Doctor"
    try {
      const { data: doctorData } = await supabase.auth.admin.getUserById(doctorId)
      if (doctorData.user) {
        doctorName = doctorData.user.user_metadata?.name || "Doctor"
      }
    } catch (error) {
      console.error("Failed to fetch doctor data:", error)
    }

    return NextResponse.json({
      prescription,
      message: {
        ...message,
        senderName: doctorName,
        prescription_data: {
          medications: validMedications,
        },
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
