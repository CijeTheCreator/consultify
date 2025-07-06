"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Calendar, Clock, Shield, Heart, Zap, Languages, Bot, UserIcon } from "lucide-react"
import type { User } from "@/lib/types"

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
  user,
  onStartConsultation,
  onViewConsultations,
}: PatientLandingPageProps) {
  const [stats, setStats] = useState<UserStats>({ consultations: 0, messages: 0, recentConsultations: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/user/stats?userId=${user.id}&userRole=patient`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch user stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user.id])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-olive-green/10 to-sage-green/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-forest-green to-sage-green text-cream">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
              Welcome Back, <span className="text-olive-green">{user.name}</span>
            </h1>
            <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-90 font-medium">
              Ready to connect with a doctor? Tell us what's bothering you today, and we'll find the perfect specialist
              who speaks your language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-cream text-forest-green hover:bg-olive-green hover:text-cream text-lg px-8 py-4 h-auto font-semibold transition-all duration-300"
                onClick={onStartConsultation}
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Start a Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-cream text-cream hover:bg-cream hover:text-forest-green text-lg px-8 py-4 h-auto bg-transparent font-semibold transition-all duration-300"
                onClick={onViewConsultations}
              >
                <Calendar className="mr-2 w-5 h-5" />
                Previous Consultations
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-forest-green mb-4">Continue Your Healthcare Journey</h2>
            <p className="text-lg text-sage-green font-medium">Pick up where you left off, {user.name}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Consultations */}
            <Card className="lg:col-span-2 border-sage-green/20">
              <CardHeader>
                <CardTitle className="flex items-center text-forest-green">
                  <Clock className="w-5 h-5 mr-2 text-sage-green" />
                  Recent Consultations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green mx-auto mb-4"></div>
                    <p className="text-sage-green">Loading consultations...</p>
                  </div>
                ) : stats.recentConsultations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sage-green font-medium">No consultations yet</p>
                    <p className="text-sm text-gray-500">Start your first consultation to get personalized care</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentConsultations.map((consultation) => (
                      <div
                        key={consultation.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-olive-green/10 transition-colors cursor-pointer border border-sage-green/10"
                        onClick={onViewConsultations}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-forest-green text-cream">
                              {getConsultationIcon(consultation.consultationType)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-forest-green">{consultation.title}</p>
                            <p className="text-sm text-sage-green font-medium">
                              {consultation.consultationType === "AI_TRIAGE"
                                ? "AI Health Assistant"
                                : "Doctor Consultation"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-sage-green font-medium">
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
            <Card className="border-sage-green/20">
              <CardHeader>
                <CardTitle className="flex items-center text-forest-green">
                  <Languages className="w-5 h-5 mr-2 text-sage-green" />
                  Your Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-forest-green mb-1">Language Preference</p>
                  <Badge className="bg-sage-green/20 text-sage-green">
                    {user.language === "en" ? "English" : user.language}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold text-forest-green mb-1">Account Type</p>
                  <Badge className="bg-forest-green/20 text-forest-green">Patient</Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold text-forest-green mb-1">Available Services</p>
                  <div className="space-y-2">
                    <div className="text-sm text-sage-green font-medium">• AI Health Triage</div>
                    <div className="text-sm text-sage-green font-medium">• Doctor Consultations</div>
                    <div className="text-sm text-sage-green font-medium">• Prescription Management</div>
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
            <h2 className="text-3xl font-bold text-forest-green mb-4">Fast Track to Care, {user.name}</h2>
            <p className="text-lg text-sage-green font-medium">
              Skip the wait – connect with specialists who understand your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-sage-green/20 hover:border-forest-green/30"
              onClick={onStartConsultation}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-forest-green/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-forest-green/20 transition-colors">
                  <Zap className="w-8 h-8 text-forest-green" />
                </div>
                <h3 className="text-lg font-semibold text-forest-green mb-2">Instant Consultation</h3>
                <p className="text-sage-green text-sm font-medium">Start talking to our AI agent about new symptoms</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-sage-green/20 hover:border-forest-green/30">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-sage-green/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-sage-green/30 transition-colors">
                  <Heart className="w-8 h-8 text-sage-green" />
                </div>
                <h3 className="text-lg font-semibold text-forest-green mb-2">Health Tracking</h3>
                <p className="text-sage-green text-sm font-medium">Monitor your symptoms and treatment progress</p>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-sage-green/20 hover:border-forest-green/30"
              onClick={onViewConsultations}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-olive-green/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-olive-green/30 transition-colors">
                  <Calendar className="w-8 h-8 text-olive-green" />
                </div>
                <h3 className="text-lg font-semibold text-forest-green mb-2">Consultation History</h3>
                <p className="text-sage-green text-sm font-medium">Review your past consultations and treatments</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-sage-green/20 hover:border-forest-green/30">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-forest-green/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-forest-green/20 transition-colors">
                  <Shield className="w-8 h-8 text-forest-green" />
                </div>
                <h3 className="text-lg font-semibold text-forest-green mb-2">Emergency Support</h3>
                <p className="text-sage-green text-sm font-medium">24/7 access to urgent care specialists</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-forest-green mb-4">Your Health Hub, {user.name}</h2>
          <p className="text-lg text-sage-green mb-8 font-medium">
            Everything you need for personalized healthcare in your preferred language
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <Card className="border-sage-green/20">
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold text-forest-green mb-2">{stats.consultations}</div>
                <div className="text-sm text-sage-green font-medium">Total Consultations</div>
              </CardContent>
            </Card>
            <Card className="border-sage-green/20">
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold text-sage-green mb-2">{stats.messages}</div>
                <div className="text-sm text-sage-green font-medium">Messages Sent</div>
              </CardContent>
            </Card>
            <Card className="border-sage-green/20">
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold text-olive-green mb-2">24/7</div>
                <div className="text-sm text-sage-green font-medium">Support Available</div>
              </CardContent>
            </Card>
            <Card className="border-sage-green/20">
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold text-forest-green mb-2">100+</div>
                <div className="text-sm text-sage-green font-medium">Doctors Available</div>
              </CardContent>
            </Card>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-forest-green hover:bg-sage-green text-cream text-lg px-8 py-4 h-auto font-semibold transition-all duration-300"
              onClick={onStartConsultation}
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Start New Consultation
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 h-auto bg-transparent border-forest-green text-forest-green hover:bg-forest-green hover:text-cream font-semibold transition-all duration-300"
              onClick={onViewConsultations}
            >
              <Calendar className="mr-2 w-5 h-5" />
              View All Consultations
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
