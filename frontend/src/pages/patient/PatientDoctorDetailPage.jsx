
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import PatientLayout from "@/layouts/PatientLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    User,
    Phone,
    Mail,
    MapPin,
    Building2,
    ArrowLeft,
    Loader2,
    Calendar,
    Stethoscope,
    Clock
} from "lucide-react"
import api from "@/services/api"

export default function PatientDoctorDetailPage() {
    const { id } = useParams()
    const [doctor, setDoctor] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const response = await api.get(`/patient/doctors/${id}`)
                setDoctor(response.data.data)
            } catch (error) {
                console.error("Failed to fetch doctor details:", error)
            } finally {
                setIsLoading(false)
            }
        }
        if (id) {
            fetchDoctor()
        }
    }, [id])

    if (isLoading) {
        return (
            <PatientLayout title="Doctor Profile" subtitle="Loading specialist information...">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </PatientLayout>
        )
    }

    if (!doctor) {
        return (
            <PatientLayout title="Doctor Not Found" subtitle="Member of care team unavailable">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <User className="h-16 w-16 text-muted-foreground/30" />
                    <h3 className="text-xl font-bold text-muted-foreground">Doctor Not Found</h3>
                    <Button asChild className="mt-4">
                        <Link to="/patient/doctors">Return to Team</Link>
                    </Button>
                </div>
            </PatientLayout>
        )
    }

    return (
        <PatientLayout
            title={`Dr. ${doctor.name}`}
            subtitle={doctor.specialization || "Medical Specialist"}
        >
            <div className="max-w-[1000px] mx-auto w-full space-y-8">
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" asChild>
                    <Link to="/patient/doctors" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Care Team
                    </Link>
                </Button>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Profile Card */}
                    <Card className="md:col-span-2 shadow-xl border-border/50 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                            <div className="absolute -bottom-16 left-8">
                                <div className="h-32 w-32 rounded-3xl bg-white p-2 shadow-2xl ring-4 ring-white">
                                    <div className="h-full w-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-4xl">
                                        {doctor.name ? doctor.name[0] : 'D'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CardContent className="pt-20 px-8 pb-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-black text-foreground">Dr. {doctor.name}</h2>
                                    <div className="flex items-center gap-2 mt-2 text-primary font-bold">
                                        <Stethoscope className="h-5 w-5" />
                                        <span>{doctor.specialization}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                                        <Building2 className="h-4 w-4" />
                                        <span>{doctor.facility?.name || "Main Hospital Facility"}</span>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-4 py-1.5 text-xs uppercase font-black tracking-widest">
                                    Active
                                </Badge>
                            </div>

                            <div className="mt-8 grid gap-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2">Contact Information</h3>

                                {doctor.email && (
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                                        <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-primary">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</p>
                                            <p className="text-sm font-medium">{doctor.email}</p>
                                        </div>
                                    </div>
                                )}

                                {doctor.phone && (
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                                        <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-primary">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Phone Number</p>
                                            <p className="text-sm font-medium">{doctor.phone}</p>
                                        </div>
                                    </div>
                                )}

                                {doctor.facility?.address && (
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                                        <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-primary">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Facility Address</p>
                                            <p className="text-sm font-medium">{doctor.facility.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions Sidebar */}
                    <div className="space-y-6">
                        <Card className="shadow-lg border-border/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full justify-start h-12" variant="outline" asChild>
                                    <Link to="/patient/appointments">
                                        <Calendar className="mr-3 h-5 w-5 text-primary" />
                                        Book Appointment
                                    </Link>
                                </Button>
                                {/* We could add message button here later */}
                            </CardContent>
                        </Card>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Clock className="h-6 w-6" />
                            </div>
                            <h4 className="font-bold text-blue-900 mb-2">Need Assistance?</h4>
                            <p className="text-xs text-blue-700/80 mb-4">
                                If you require immediate attention, please visit the emergency portal or contact the facility directly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PatientLayout>
    )
}
