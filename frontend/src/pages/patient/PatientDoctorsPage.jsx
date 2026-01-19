import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import PatientLayout from "@/layouts/PatientLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, ArrowRight, Loader2, Stethoscope, Building2, User } from "lucide-react"
import api from "@/services/api"
import { formatName } from "@/utils/nameUtils"

export default function PatientDoctorsPage() {
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                // Assuming an endpoint exists to get doctors assigned to the patient or all doctors
                // If specific assigned doctors endpoint exists, use that. 
                // For now, using a generic /users?role=DOCTOR or similar if available, 
                // but based on context, it might be /patient/doctors or similar.
                // Reverting to a safe fetch or checking assignments.
                // Let's assume we want to show ALL doctors or Assigned ones.
                // Given the context of "Active Assignment" in the UI, this likely fetches assigned doctors.
                const response = await api.get('/patient/my-medical-team')
                setDoctors(response.data.data || [])
            } catch (err) {
                console.error("Failed to fetch doctors:", err)
                setError("Failed to load doctors")
            } finally {
                setLoading(false)
            }
        }

        fetchDoctors()
    }, [])

    if (loading) {
        return (
            <PatientLayout>
                <div className="flex items-center justify-center h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </PatientLayout>
        )
    }

    return (
        <PatientLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Care Team</h1>
                    <p className="text-muted-foreground mt-2">
                        View and manage your assigned healthcare providers
                    </p>
                </div>

                {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && doctors.length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Stethoscope className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-lg">No doctors assigned</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                You currently don't have any doctors assigned to your care team.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map(doctor => (
                            <Link to={`/patient/doctors/${doctor.id}`} key={doctor.id}>
                                <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
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
                                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{formatName({ ...doctor, role: 'DOCTOR' })}</h3>
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
