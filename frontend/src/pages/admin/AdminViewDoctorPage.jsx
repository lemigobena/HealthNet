import { useState, useEffect } from "react"
import AdminLayout from "@/layouts/AdminLayout"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Award, Building2, Calendar, FileText, Fingerprint, GraduationCap } from "lucide-react"
import api from "@/services/api"
import dayjs from "dayjs"
import { Loader2 } from "lucide-react"

export default function AdminViewDoctorPage() {
    const { id } = useParams()
    const [doctor, setDoctor] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const response = await api.get(`/admin/doctors/${id}`)
                setDoctor(response.data.data)
            } catch (err) {
                console.error("Failed to fetch doctor:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDoctor()
    }, [id])

    if (isLoading) {
        return (
            <AdminLayout title="Practitioner Profile" subtitle="Accessing Registry...">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Synchronizing medical credentials...</p>
                </div>
            </AdminLayout>
        )
    }

    if (!doctor) {
        return (
            <AdminLayout title="Error" subtitle="Practitioner Not Found">
                <div className="text-center p-20">
                    <p className="text-xl font-bold">Doctor Not Found</p>
                    <p className="text-muted-foreground">The requested practitioner record could not be found in the HealthNet registry.</p>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title="Practitioner Professional Profile"
            subtitle={`Administrative view for ${doctor.user.name}`}
        >
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Profile Header */}
                <Card className="overflow-hidden border-border/50 shadow-xl">
                    <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />
                    <CardContent className="relative px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-6">
                            <div className="h-32 w-32 rounded-3xl bg-background border-4 border-background shadow-2xl flex items-center justify-center text-primary text-4xl font-black">
                                {doctor.user.name?.[0]}
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <h2 className="text-3xl font-black tracking-tight">{doctor.user.name}</h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px] px-3">
                                        {doctor.specialization}
                                    </Badge>
                                    <Badge className="bg-green-500/10 text-green-600 border-none font-bold uppercase tracking-widest text-[10px] px-3">
                                        Certified Practitioner
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-border/50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                    <Award className="h-3 w-3" /> License Number
                                </p>
                                <p className="font-bold text-lg">{doctor.license_number}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                    <Fingerprint className="h-3 w-3" /> Practitioner ID
                                </p>
                                <p className="font-bold text-lg">{doctor.doctor_id}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                    <Building2 className="h-3 w-3" /> Affiliated Facility
                                </p>
                                <p className="font-bold text-lg">{doctor.facility?.name || "National HealthNet"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold tracking-tight">Personal & Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Email Address</p>
                                    <p className="font-bold">{doctor.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Phone Number</p>
                                    <p className="font-bold">{doctor.user.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Work Office</p>
                                    <p className="font-bold">{doctor.user.address || "N/A"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold tracking-tight">Professional Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Specialization Area</p>
                                    <p className="font-bold">{doctor.specialization}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Member Since</p>
                                    <p className="font-bold">{dayjs(doctor.user.created_at).format('MMMM D, YYYY')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Registry Role</p>
                                    <p className="font-bold uppercase">{doctor.type?.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
