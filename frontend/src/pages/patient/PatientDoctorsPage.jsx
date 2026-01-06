
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import PatientLayout from "@/layouts/PatientLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Mail, Calendar, ArrowRight, Loader2, Stethoscope, MapPin, Building2 } from "lucide-react"
import api from "@/services/api"

export default function PatientDoctorsPage() {
    const [doctors, setDoctors] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/patient/doctors')
                setDoctors(response.data.data)
            } catch (error) {
                console.error("Failed to fetch doctors:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDoctors()
    }, [])

    if (isLoading) {
        return (
            <PatientLayout title="My Care Team" subtitle="Loading your medical team information...">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </PatientLayout>
        )
    }

    return (
        <PatientLayout
            title="My Care Team"
            subtitle="Doctors and specialists currently assigned to your health profile."
        >
            <div className="max-w-[1600px] mx-auto w-full space-y-8">
                {doctors.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                        <User className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-muted-foreground">No Doctors Assigned</h3>
                        <p className="text-sm text-muted-foreground/60 mt-2">You currently have no doctors assigned to your care team.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {doctors.map((doctor) => (
                            <Link
                                to={`/patient/doctors/${doctor.doctor_id}`}
                                key={doctor.doctor_id}
                                className="block group transition-all duration-300 hover:-translate-y-1"
                            >
                                <Card className="h-full overflow-hidden border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 bg-card hover:border-primary/20">
                                    <div className="h-24 bg-gradient-to-br from-primary/5 to-primary/10 relative p-6">
                                        <div className="absolute -bottom-10 left-6">
                                            <div className="h-20 w-20 rounded-2xl bg-white p-1 shadow-lg ring-1 ring-black/5">
                                                <div className="h-full w-full rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <span className="text-2xl font-black">{doctor.name ? doctor.name[0] : 'D'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="pt-12 px-6 pb-6 space-y-4">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">Dr. {doctor.name}</h3>
                                            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                                <Stethoscope className="h-3.5 w-3.5" />
                                                <span className="text-xs uppercase font-black tracking-widest">{doctor.specialization || "General Practice"}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-dashed border-border/50">
                                            {doctor.email && (
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                        <Mail className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs truncate">{doctor.email}</span>
                                                </div>
                                            )}
                                            {doctor.phone && (
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                        <Phone className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-mono">{doctor.phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                                    <Building2 className="h-4 w-4" />
                                                </div>
                                                <span className="text-xs">Medical Facility</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between">
                                            <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-0 font-bold text-[10px] uppercase tracking-wider">
                                                Active Assignment
                                            </Badge>
                                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </PatientLayout>
    )
}
