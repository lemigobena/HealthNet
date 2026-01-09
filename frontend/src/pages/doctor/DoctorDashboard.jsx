import { useState, useEffect } from "react"
import DoctorLayout from "@/layouts/DoctorLayout"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    Calendar,
    FileText,
    Activity,
    Clock,
    AlertCircle,
    ArrowRight,
    Plus,
    Search,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    User
} from "lucide-react"
import { Link } from "react-router-dom"
import api from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

export default function DoctorDashboard() {
    const { user } = useAuth()
    const [patients, setPatients] = useState([])
    const [appointments, setAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [patientsRes, appointmentsRes] = await Promise.all([
                    api.get('/doctor/patients'),
                    api.get('/doctor/appointments')
                ])
                setPatients(patientsRes.data.data)
                setAppointments(appointmentsRes.data.data)
            } catch (err) {
                console.error("Doctor dashboard sync error:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    if (isLoading) {
        return (
            <DoctorLayout title="Clinical Sync..." subtitle="Retrieving your practice overview">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Securing connection to health registry...</p>
                </div>
            </DoctorLayout>
        )
    }

    const today = new Date().toLocaleDateString()
    const todayAppointments = appointments.filter(a => {
        const appointmentDate = new Date(a.when).toLocaleDateString()
        return appointmentDate === today
    })
    const doctorName = user?.name ? user.name.split(' ')[0] : "Practitioner"

    // Logic for Nearest Appointment
    const now = new Date()
    const nearestAppointment = appointments
        .filter(a => new Date(a.when) > now)
        .sort((a, b) => new Date(a.when) - new Date(b.when))[0]

    // Logic for New Assignments (Last 5)
    // Assuming patients have 'assigned_at' or 'created_at' (using reverse index as fallback if date missing)
    const newAssignments = [...patients]
        .sort((a, b) => {
            const dateA = a.assigned_at ? new Date(a.assigned_at) : new Date(0)
            const dateB = b.assigned_at ? new Date(b.assigned_at) : new Date(0)
            return dateB - dateA
        })
        .slice(0, 5)

    // Logic for Graph (Appointments per day of week)
    const dayCounts = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 }
    appointments.forEach(a => {
        const date = new Date(a.when)
        const day = date.toLocaleDateString('en-US', { weekday: 'short' })
        if (dayCounts[day] !== undefined) dayCounts[day]++
    })
    const maxCount = Math.max(...Object.values(dayCounts), 1) // Avoid div by zero

    return (
        <DoctorLayout
            title={`Welcome, Dr. ${doctorName}`}
            subtitle="National HealthNet Practice Management Portal"
        >
            <div className="space-y-8 max-w-[1600px] mx-auto w-full pb-20">
                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <StatsCard
                        title="Care Registry"
                        value={patients.length.toString()}
                        iconName="users"
                        description="Assigned patients"
                    />
                    <StatsCard
                        title="Today's Visits"
                        value={todayAppointments.length.toString()}
                        iconName="calendar"
                        description="Scheduled consultations"
                    />
                    <StatsCard
                        title="Total Clinical Assets"
                        value={appointments.length.toString()}
                        iconName="file-text"
                        description="Consultation records"
                    />
                    <StatsCard
                        title="Integrity Status"
                        value="OK"
                        iconName="activity"
                        description="Chain of custody verified"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Weekly Activity Graph */}
                        <Card className="shadow-lg border-border/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold">Weekly Clinical Activity</CardTitle>
                                <CardDescription>Appointment distribution by day</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] w-full flex items-end justify-between gap-2 pt-4">
                                    {Object.entries(dayCounts).map(([day, count]) => (
                                        <div key={day} className="flex flex-col items-center gap-2 w-full group">
                                            <div className="w-full relative h-[150px] bg-muted/20 rounded-t-lg overflow-hidden flex items-end">
                                                <div
                                                    className="w-full bg-primary/80 group-hover:bg-primary transition-all duration-500 rounded-t-lg"
                                                    style={{ height: `${(count / maxCount) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase">{day}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Today's Schedule */}
                        <Card className="shadow-lg border-border/50 overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between bg-primary/5 pb-6">
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-black tracking-tight">Today's Appointments</CardTitle>
                                    <CardDescription className="font-bold opacity-70">Scheduled consultations for {new Date().toLocaleDateString()}</CardDescription>
                                </div>
                                <Button variant="outline" className="font-bold border-2" asChild>
                                    <Link to="/doctor/appointments">All Appointments</Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {todayAppointments.length > 0 ? (
                                        todayAppointments.map((appointment) => (
                                            <div
                                                key={appointment.appointment_id}
                                                className="group flex items-center justify-between rounded-2xl border-2 border-transparent bg-muted/30 p-5 transition-all hover:border-primary/20 hover:bg-muted/50"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                        <Clock className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-lg tracking-tight">{appointment.patient?.user?.name}</h4>
                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                            <User className="h-3 w-3" /> {appointment.reason || "General Consultation"} • {new Date(appointment.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" className="font-black border-2 rounded-xl" asChild>
                                                    <Link to={`/doctor/patients/${appointment.patient_id}`}>Load Record</Link>
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-16 text-center text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed">
                                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                            <p className="font-black uppercase tracking-widest text-[10px]">No sessions registered for today</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        {/* Nearest Appointment */}
                        <Card className="border-primary/20 shadow-xl bg-primary/5 h-fit overflow-hidden">
                            <CardHeader className="bg-primary/10 border-b border-primary/10">
                                <CardTitle className="flex items-center gap-2 text-primary font-black tracking-tight text-lg">
                                    <Clock className="h-5 w-5 animate-pulse" />
                                    Nearest Appointment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {nearestAppointment ? (
                                    <div className="text-center space-y-4">
                                        <div className="h-20 w-20 mx-auto rounded-full bg-background border-4 border-primary/20 flex items-center justify-center">
                                            <span className="text-2xl font-black text-primary">
                                                {new Date(nearestAppointment.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{nearestAppointment.patient?.user?.name || "Unknown Patient"}</h3>
                                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">{new Date(nearestAppointment.when).toLocaleDateString()}</p>
                                            <Badge className="mt-2 bg-primary text-primary-foreground">{nearestAppointment.reason}</Badge>
                                        </div>
                                        <Button className="w-full rounded-xl font-bold" asChild>
                                            <Link to={`/doctor/patients/${nearestAppointment.patient_id}`}>View Patient</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <p className="font-medium">No upcoming appointments found.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* New Assignments */}
                        <Card className="shadow-lg border-border/50">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-green-600" />
                                    New Assignments
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="divide-y">
                                    {newAssignments.length > 0 ? (
                                        newAssignments.map(patient => (
                                            <div key={patient.patient_id} className="py-4 flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                                                        {patient.user?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{patient.user?.name}</h4>
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                            {patient.assigned_at ? new Date(patient.assigned_at).toLocaleDateString() : 'Recently Assigned'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                                                    <Link to={`/doctor/patients/${patient.patient_id}`}><ArrowRight className="h-4 w-4" /></Link>
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground text-sm">
                                            No recent assignments.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Protocol Alerts */}
                        <Card className="border-red-200 shadow-xl bg-red-50/20 h-fit overflow-hidden">
                            <CardHeader className="bg-red-500/10 py-4">
                                <CardTitle className="flex items-center gap-2 text-red-600 font-black tracking-tight text-base">
                                    <AlertCircle className="h-4 w-4" />
                                    System Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-center text-muted-foreground">
                                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500/50" />
                                    <p className="font-bold text-xs uppercase tracking-widest">All Systems Operational</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DoctorLayout>
    )
}
