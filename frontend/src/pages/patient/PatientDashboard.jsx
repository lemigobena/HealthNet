import { useState, useEffect } from "react"
import PatientLayout from "@/layouts/PatientLayout"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    FileText,
    Calendar,
    FlaskConical,
    QrCode,
    Clock,
    User,
    ArrowRight,
    AlertTriangle,
    ShieldCheck,
    Droplets,
    Zap,
    Loader2
} from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/services/api"
import { cn } from "@/utils/cn"

export default function PatientDashboard() {
    const { user } = useAuth()
    const [diagnoses, setDiagnoses] = useState([])
    const [labResults, setLabResults] = useState([])
    const [appointments, setAppointments] = useState([])
    const [emergencyInfo, setEmergencyInfo] = useState(null)
    const [assignments, setAssignments] = useState([])
    const [qrData, setQrData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true)
            try {
                const [diagnosesRes, labsRes, appointmentsRes, emergencyRes, assignmentsRes, qrRes] = await Promise.all([
                    api.get('/patient/diagnoses'),
                    api.get('/patient/lab-results'),
                    api.get('/patient/appointments'),
                    api.get('/patient/emergency-info'),
                    api.get('/patient/doctors'),
                    api.get('/qr/my-codes')
                ])
                setDiagnoses(diagnosesRes.data.data)
                setLabResults(labsRes.data.data)
                setAppointments(appointmentsRes.data.data)
                setEmergencyInfo(emergencyRes.data.data)
                setAssignments(assignmentsRes.data.data)
                setQrData(qrRes.data.data[0] || null)
            } catch (err) {
                console.error("Dashboard sync error:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    const newAssignments = assignments.slice(0, 2);

    if (isLoading) {
        return (
            <PatientLayout title="Synchronizing..." subtitle="Retrieving your medical history from the national database">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium animate-pulse">Establishing secure connection...</p>
                </div>
            </PatientLayout>
        )
    }

    const patientFirstName = user?.name ? user.name.split(' ')[0] : "Citizen"
    const nextAppointment = appointments[0]
    const latestLab = labResults[0]

    const medicationsCount = diagnoses.reduce((acc, diag) => {
        if (diag.medications && diag.medications.trim() !== "" && diag.medications !== "None") {
            const meds = diag.medications.split(',').map(m => m.trim().toLowerCase())
            meds.forEach(m => {
                if (m) acc.add(m)
            })
        }
        return acc
    }, new Set()).size

    return (
        <PatientLayout
            title={`Welcome, ${patientFirstName}`}
            subtitle="Your health overview and national medical records at a glance."
        >
            <div className="space-y-8 max-w-[1600px] mx-auto w-full">
                {/* Quick Stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <StatsCard title="Diagnoses" value={diagnoses.length.toString()} iconName="file-text" description="Historical records" />
                    <StatsCard title="Lab Reports" value={labResults.length.toString()} iconName="flask-conical" description="Verified results" />
                    <StatsCard title="Scheduled" value={appointments.length.toString()} iconName="calendar" description="Upcoming visits" />
                    <StatsCard title="Medications" value={medicationsCount.toString()} iconName="activity" description={medicationsCount > 0 ? "Active prescriptions" : "No active prescriptions"} />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Next Appointment Card */}
                            <Card className="shadow-xl border-border/50 overflow-hidden">
                                <CardHeader className="bg-primary/5 pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        Your Next Consultation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {nextAppointment ? (
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                                                    <span className="text-xl font-bold">{new Date(nextAppointment.when).getDate()}</span>
                                                    <span className="text-[10px] uppercase font-black tracking-widest">{new Date(nextAppointment.when).toLocaleString('default', { month: 'short' })}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-foreground leading-tight">{nextAppointment.reason || "General Checkup"}</h4>
                                                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Dr. {nextAppointment.doctor?.user?.name}</span>
                                                        <span className="flex items-center gap-1.5 font-bold text-primary"><Clock className="h-3.5 w-3.5" /> {new Date(nextAppointment.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="outline" className="w-full mt-2 group border-2" asChild>
                                                <Link to="/patient/appointments">
                                                    Your Appointments <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="py-10 text-center text-muted-foreground italic bg-muted/20 rounded-xl border border-dashed">
                                            No upcoming facility visits.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Latest Lab Card */}
                            <Card className="shadow-xl border-border/50 overflow-hidden">
                                <CardHeader className="bg-emerald-500/5 pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FlaskConical className="h-5 w-5 text-emerald-600" />
                                        Latest Lab Result
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {latestLab ? (
                                        <div className="space-y-4">
                                            <div className="rounded-xl border border-border/50 p-4 bg-muted/10">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <h4 className="font-black text-foreground">{latestLab.type}</h4>
                                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{new Date(latestLab.test_date).toLocaleDateString()}</p>
                                                    </div>
                                                    <Badge
                                                        className={cn(
                                                            "px-2.5 py-0.5 uppercase tracking-tighter text-[10px] font-black border-none",
                                                            !latestLab.is_abnormal ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                                                        )}
                                                    >
                                                        {latestLab.is_abnormal ? "ABNORMAL" : "NORMAL"}
                                                    </Badge>
                                                </div>
                                                <p className="mt-3 text-sm font-bold text-primary flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    Verified by Facility Laboratory
                                                </p>
                                            </div>
                                            <Button variant="outline" className="w-full group border-2" asChild>
                                                <Link to="/patient/lab-results">
                                                    Your Lab Results <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="py-10 text-center text-muted-foreground italic bg-muted/20 rounded-xl border border-dashed">
                                            No diagnostic records found.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Care Team Updates */}
                            <Card className="shadow-xl border-border/50 overflow-hidden">
                                <CardHeader className="bg-blue-500/5 pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-blue-600" />
                                        Care Team Updates
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {newAssignments.length > 0 ? (
                                        <div className="space-y-4">
                                            {newAssignments.map((a, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                                                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black">
                                                        {a.name?.[0] || 'D'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-sm">Dr. {a.name}</p>
                                                        <p className="text-[10px] uppercase font-black tracking-widest text-blue-600/60">{a.specialization}</p>
                                                    </div>
                                                    <Badge className="bg-blue-600 text-white border-none text-[10px]">NEW</Badge>
                                                </div>
                                            ))}
                                            <Button variant="ghost" size="sm" className="w-full text-xs font-black uppercase tracking-widest text-blue-600" asChild>
                                                <Link to="/patient/doctors">View Full Team</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="py-10 text-center text-muted-foreground italic bg-muted/20 rounded-xl border border-dashed text-sm">
                                            Your clinical team is stable.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Diagnoses */}
                            <Card className="shadow-xl border-border/50 overflow-hidden">
                                <CardHeader className="bg-amber-500/5 pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-amber-600" />
                                        Recent Diagnoses
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {diagnoses.length > 0 ? (
                                        <div className="space-y-4">
                                            {diagnoses.slice(0, 3).map((diag, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                                                    <div>
                                                        <p className="font-bold text-sm text-foreground">{diag.disease_name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] uppercase font-bold text-amber-600/60 tracking-wider">
                                                                {new Date(diag.created_at).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">•</span>
                                                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                                Dr. {diag.doctor?.user?.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-[10px] font-black uppercase tracking-widest border-none",
                                                            diag.status === 'COMPLETED' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                        )}
                                                    >
                                                        {diag.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                            <Button variant="ghost" size="sm" className="w-full text-xs font-black uppercase tracking-widest text-amber-600" asChild>
                                                <Link to="/patient/records">View All History</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="py-10 text-center text-muted-foreground italic bg-muted/20 rounded-xl border border-dashed text-sm">
                                            No diagnosis records found.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Emergency Sidebar Case */}
                    <div className="space-y-6">
                        <Card className="border-red-200 shadow-2xl bg-red-50/30 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-2 opacity-5 scale-150"><ShieldCheck className="h-24 w-24 text-red-600" /></div>
                            <CardHeader className="relative items-center text-center pb-2">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-white shadow-red-500/50 shadow-xl mb-4 transform -rotate-3">
                                    <AlertTriangle className="h-8 w-8" />
                                </div>
                                <CardTitle className="text-2xl font-black text-red-700 tracking-tight">Emergency Profile</CardTitle>
                                <p className="text-[10px] font-black uppercase text-red-600/60 tracking-[0.2em]">Verified Secure Data</p>
                            </CardHeader>
                            <CardContent className="relative space-y-6 pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2 text-red-600"><Droplets className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Blood Type</span></div>
                                        <p className="text-3xl font-black text-foreground">{emergencyInfo?.blood_type || "N/A"}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2 text-red-600"><Zap className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Priority</span></div>
                                        <p className="text-sm font-black text-foreground line-clamp-2">{emergencyInfo?.chronic_conditions?.split(',')[0] || "No Alerts"}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h5 className="text-[10px] font-black uppercase text-red-600/60 tracking-widest pl-1">Emergency QR Link</h5>
                                    <div className="flex justify-center p-4 bg-white rounded-2xl border-2 border-red-100 shadow-sm relative group overflow-hidden">
                                        {qrData?.qr_code_url ? (
                                            <>
                                                <img src={qrData.qr_code_url} alt="Emergency QR" className="h-40 w-40" />
                                                <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Link to="/patient/qr" className="bg-white text-red-600 px-4 py-2 rounded-lg text-xs font-black tracking-widest border border-red-200 shadow-xl">
                                                        FULL SCREEN
                                                    </Link>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-40 w-40 flex flex-col items-center justify-center text-red-200">
                                                <QrCode className="h-12 w-12 mb-2" />
                                                <span className="text-[8px] font-black uppercase">Not Generated</span>
                                                <Button size="sm" variant="ghost" className="mt-2 text-[10px] text-red-600" asChild>
                                                    <Link to="/patient/qr">Generate Now</Link>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[8px] text-center text-red-600/40 font-black uppercase tracking-[0.2em]">Scanner: Direct Emergency Portal Access</p>
                                </div>

                                <div className="space-y-3">
                                    <h5 className="text-[10px] font-black uppercase text-red-600/60 tracking-widest pl-1">Primary Contacts</h5>
                                    <div className="bg-white p-4 rounded-2xl border-2 border-red-100 shadow-sm">
                                        <p className="font-black text-foreground text-lg">{emergencyInfo?.emergency_contact_name || "Unset"}</p>
                                        <p className="text-base text-red-600 font-bold mt-1 tabular-nums">{emergencyInfo?.emergency_contact_phone || "---"}</p>
                                        <Badge className="mt-2 bg-red-100 text-red-700 border-none font-black text-[10px] uppercase">{emergencyInfo?.emergency_contact_relationship || "Contact"}</Badge>
                                    </div>
                                </div>

                                <Button variant="destructive" className="w-full h-14 font-black text-lg shadow-red-500/20 shadow-xl rounded-xl uppercase tracking-tight" asChild>
                                    <Link to="/patient/qr">
                                        <QrCode className="mr-3 h-5 w-5" />
                                        Access SafePass
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="bg-muted/30 rounded-2xl border-2 border-dashed border-border/50 p-6 text-center transform hover:scale-[1.02] transition-transform">
                            <ShieldCheck className="h-10 w-10 text-primary/40 mx-auto mb-4" />
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-wider">
                                HealthNet National Security Infrastructure <br />
                                <span className="text-primary/60 font-black">256-bit PGP Encrypted • HIPAA Verified</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PatientLayout>
    )
}
