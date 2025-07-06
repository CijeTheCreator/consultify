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

    // Get doctor and patient data from Supabase Auth
    let doctorName = "Doctor"
    let patientName = "Patient"
    let patientEmail = ""

    try {
      const { data: doctorData } = await supabase.auth.admin.getUserById(doctorId)
      if (doctorData.user) {
        doctorName = doctorData.user.user_metadata?.name || "Doctor"
      }
    } catch (error) {
      console.error("Failed to fetch doctor data:", error)
    }

    try {
      const { data: patientData } = await supabase.auth.admin.getUserById(patientId)
      if (patientData.user) {
        patientName = patientData.user.user_metadata?.name || "Patient"
        patientEmail = patientData.user.email || ""
      }
    } catch (error) {
      console.error("Failed to fetch patient data:", error)
    }

    // Send prescription email to patient (fire and forget - don't block response)
    if (patientEmail) {
      // Use setImmediate or setTimeout to ensure this runs after the response is sent
      setImmediate(async () => {
        try {
          const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-prescription`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: patientEmail,
              medications: validMedications,
              doctorName,
              patientName,
              timestamp: new Date().toISOString(),
            }),
          })

          if (!emailResponse.ok) {
            console.error("Failed to send prescription email:", await emailResponse.text())
          } else {
            console.log("Prescription email sent successfully to:", patientEmail)
          }
        } catch (error) {
          console.error("Error sending prescription email:", error)
        }
      })
    } else {
      console.warn("No patient email found - prescription email not sent")
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
