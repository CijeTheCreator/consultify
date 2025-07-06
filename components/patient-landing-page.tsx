"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Calendar, Clock, Shield, Heart, Zap, Languages, Bot, UserIcon } from "lucide-react"
import { AuroraText } from "@/components/magicui/aurora-text"
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Pointer } from "@/components/magicui/pointer"
import { NumberTicker } from "@/components/magicui/number-ticker"

interface User {
  id: string
  name: string
  language: string
}

interface PatientLandingPageProps {
  user: User
  onStartConsultation: () => void
  onViewConsultations: () => void
}

interface UserStats {
  consultations: number
  messages: number
  recentConsultations: Array<{
    id: string
    title: string
    status: string
    createdAt: string
    consultationType: string
  }>
}

export default function PatientLandingPage({
  user = { id: "1", name: "Sarah", language: "en" },
  onStartConsultation = () => console.log("Start consultation"),
  onViewConsultations = () => console.log("View consultations"),
}: PatientLandingPageProps) {
  const [stats, setStats] = useState<UserStats>({
    consultations: 12,
    messages: 47,
    recentConsultations: [
      {
        id: "1",
        title: "General Check-up",
        status: "Completed",
        createdAt: "2025-01-15T10:30:00Z",
        consultationType: "DOCTOR"
      },
      {
        id: "2",
        title: "Symptom Assessment",
        status: "Active",
        createdAt: "2025-01-10T14:20:00Z",
        consultationType: "AI_TRIAGE"
      }
    ]
  })
  const [loading, setLoading] = useState(false)

  const getConsultationIcon = (consultationType: string) => {
    return consultationType === "AI_TRIAGE" ? (
      <Bot className="w-4 h-4 text-blue-600" />
    ) : (
      <UserIcon className="w-4 h-4 text-green-600" />
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const colors = ["#0A400C", "#819067", "#B1AB86", "#FEFAE0"]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFAE0" }}>
      <Pointer />

      {/* Hero Section */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: "#0A400C" }}>
        <InteractiveGridPattern
          className="absolute inset-0 opacity-20"
          width={40}
          height={40}
          squares={[24, 24]}
          squaresClassName="fill-white/10"
        />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="mb-6">
              <AuroraText
                className="text-3xl sm:text-5xl font-bold mb-4 leading-tight"
                colors={colors}
              >
                Welcome Back, {user.name}
              </AuroraText>
            </div>
            <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-90 font-medium">
              Ready to connect with a doctor? Tell us what's bothering you today, and we'll find the perfect specialist
              who speaks your language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RainbowButton
                size="lg"
                className="text-lg px-8 py-4 h-auto font-semibold"
                onClick={onStartConsultation}
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Start a Consultation
              </RainbowButton>
              <RainbowButton
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 h-auto font-semibold"
                onClick={onViewConsultations}
              >
                <Calendar className="mr-2 w-5 h-5" />
                Previous Consultations
              </RainbowButton>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-16" style={{ backgroundColor: "#FEFAE0" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#0A400C" }}>Continue Your Healthcare Journey</h2>
            <p className="text-lg font-medium" style={{ color: "#819067" }}>Pick up where you left off, {user.name}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Consultations */}
            <Card className="lg:col-span-2 relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#819067"
                colorTo="#B1AB86"
                size={50}
                duration={6}
              />
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: "#0A400C" }}>
                  <Clock className="w-5 h-5 mr-2" style={{ color: "#819067" }} />
                  Recent Consultations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: "#0A400C" }}></div>
                    <p style={{ color: "#819067" }}>Loading consultations...</p>
                  </div>
                ) : stats.recentConsultations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="font-medium" style={{ color: "#819067" }}>No consultations yet</p>
                    <p className="text-sm text-gray-500">Start your first consultation to get personalized care</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentConsultations.map((consultation) => (
                      <div
                        key={consultation.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg hover:opacity-80 transition-colors cursor-pointer border"
                        style={{ borderColor: "#819067" }}
                        onClick={onViewConsultations}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback style={{ backgroundColor: "#0A400C", color: "#FEFAE0" }}>
                              {getConsultationIcon(consultation.consultationType)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold" style={{ color: "#0A400C" }}>{consultation.title}</p>
                            <p className="text-sm font-medium" style={{ color: "#819067" }}>
                              {consultation.consultationType === "AI_TRIAGE"
                                ? "AI Health Assistant"
                                : "Doctor Consultation"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium" style={{ color: "#819067" }}>
                            {new Date(consultation.createdAt).toLocaleDateString()}
                          </p>
                          <Badge className={getStatusColor(consultation.status)}>{consultation.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Preferences */}
            <Card className="relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#B1AB86"
                colorTo="#819067"
                size={50}
                duration={8}
              />
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: "#0A400C" }}>
                  <Languages className="w-5 h-5 mr-2" style={{ color: "#819067" }} />
                  Your Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Language Preference</p>
                  <Badge style={{ backgroundColor: "#819067", color: "#FEFAE0" }}>
                    {user.language === "en" ? "English" : user.language}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Account Type</p>
                  <Badge style={{ backgroundColor: "#0A400C", color: "#FEFAE0" }}>Patient</Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Available Services</p>
                  <div className="space-y-2">
                    <div className="text-sm font-medium" style={{ color: "#819067" }}>• AI Health Triage</div>
                    <div className="text-sm font-medium" style={{ color: "#819067" }}>• Doctor Consultations</div>
                    <div className="text-sm font-medium" style={{ color: "#819067" }}>• Prescription Management</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#0A400C" }}>Fast Track to Care, {user.name}</h2>
            <p className="text-lg font-medium" style={{ color: "#819067" }}>
              Skip the wait – connect with specialists who understand your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
              style={{ borderColor: "#819067" }}
              onClick={onStartConsultation}
            >
              <BorderBeam
                colorFrom="#0A400C"
                colorTo="#819067"
                size={40}
                duration={4}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#0A400C" }}>
                  <Zap className="w-8 h-8" style={{ color: "#FEFAE0" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Instant Consultation</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>Start talking to our AI agent about new symptoms</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#819067"
                colorTo="#B1AB86"
                size={40}
                duration={5}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#819067" }}>
                  <Heart className="w-8 h-8" style={{ color: "#FEFAE0" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Health Tracking</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>Monitor your symptoms and treatment progress</p>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
              style={{ borderColor: "#819067" }}
              onClick={onViewConsultations}
            >
              <BorderBeam
                colorFrom="#B1AB86"
                colorTo="#0A400C"
                size={40}
                duration={6}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#B1AB86" }}>
                  <Calendar className="w-8 h-8" style={{ color: "#0A400C" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Consultation History</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>Review your past consultations and treatments</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#0A400C"
                colorTo="#B1AB86"
                size={40}
                duration={7}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#0A400C" }}>
                  <Shield className="w-8 h-8" style={{ color: "#FEFAE0" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Emergency Support</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>24/7 access to urgent care specialists</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="py-16" style={{ backgroundColor: "#FEFAE0" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#0A400C" }}>Your Health Hub, {user.name}</h2>
          <p className="text-lg mb-8 font-medium" style={{ color: "#819067" }}>
            Everything you need for personalized healthcare in your preferred language
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <Card className="relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#0A400C"
                colorTo="#819067"
                size={30}
                duration={3}
              />
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold mb-2" style={{ color: "#0A400C" }}>
                  <NumberTicker value={stats.consultations} />
                </div>
                <div className="text-sm font-medium" style={{ color: "#819067" }}>Total Consultations</div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#819067"
                colorTo="#B1AB86"
                size={30}
                duration={4}
              />
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold mb-2" style={{ color: "#819067" }}>
                  <NumberTicker value={stats.messages} />
                </div>
                <div className="text-sm font-medium" style={{ color: "#819067" }}>Messages Sent</div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#B1AB86"
                colorTo="#0A400C"
                size={30}
                duration={5}
              />
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold mb-2" style={{ color: "#B1AB86" }}>24/7</div>
                <div className="text-sm font-medium" style={{ color: "#819067" }}>Support Available</div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#0A400C"
                colorTo="#B1AB86"
                size={30}
                duration={6}
              />
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold mb-2" style={{ color: "#0A400C" }}>
                  <NumberTicker value={100} />+
                </div>
                <div className="text-sm font-medium" style={{ color: "#819067" }}>Doctors Available</div>
              </CardContent>
            </Card>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <RainbowButton
              size="lg"
              className="text-lg px-8 py-4 h-auto font-semibold"
              onClick={onStartConsultation}
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Start New Consultation
            </RainbowButton>
            <RainbowButton
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 h-auto font-semibold"
              onClick={onViewConsultations}
            >
              <Calendar className="mr-2 w-5 h-5" />
              View All Consultations
            </RainbowButton>
          </div>
        </div>
      </section>
    </div>
  )
}
