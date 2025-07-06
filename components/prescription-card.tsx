"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pill, Calendar, Clock } from "lucide-react"

interface Medication {
  drug_name: string
  amount: string
  frequency: string
}

interface PrescriptionCardProps {
  medications: Medication[]
  doctorName: string
  patientName: string
  timestamp: string
}

export default function PrescriptionCard({ medications, doctorName, patientName, timestamp }: PrescriptionCardProps) {
  return (
    <Card className="max-w-md bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-green-800">
            <Pill className="w-5 h-5 mr-2" />
            Prescription
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Rx
          </Badge>
        </div>
        <div className="text-sm text-green-700">
          <div>
            <strong>Doctor:</strong> Dr. {doctorName}
          </div>
          <div>
            <strong>Patient:</strong> {patientName}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {medications.map((medication, index) => (
          <div key={index} className="bg-white rounded-lg p-3 border border-green-100">
            <div className="font-medium text-gray-900 mb-2">{medication.drug_name}</div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-green-600" />
                <span>{medication.amount}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-green-600" />
                <span>{medication.frequency}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="text-xs text-gray-500 pt-2 border-t border-green-100">
          <div className="flex items-center justify-between">
            <span>Prescribed on {new Date(timestamp).toLocaleDateString()}</span>
            <span>{new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
