import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const consultationId = params.id

  try {
    const { doctorId, patientId, medications } = await request.json()

    if (!doctorId || !patientId || !medications || !Array.isArray(medications)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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
      include: {
        sender: true,
      },
    })

    return NextResponse.json({
      prescription,
      message: {
        ...message,
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
