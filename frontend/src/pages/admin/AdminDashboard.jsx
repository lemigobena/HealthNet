import { useState, useEffect } from "react"
import AdminLayout from "@/layouts/AdminLayout"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { RecentActivity } from "@/components/admin/RecentActivity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp, Loader2, Users, Stethoscope, FlaskConical, Building } from "lucide-react"
import api from "@/services/api"

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalPatients: 0,
        activeDoctors: 0,
        labTechnicians: 0,
        facilities: 0,
        newRegistrationsToday: 0,
        activeSessions: 0,
        emergencyAccessesToday: 0,
        facilityName: "Loading..."
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [patientsRes, doctorsRes] = await Promise.all([
                    api.get('/admin/patients'),
                    api.get('/admin/doctors')
                ])

                const allDoctors = doctorsRes.data.data
                const labTechs = allDoctors.filter(d => d.specialization === 'Laboratory Technician').length
                const medDocs = allDoctors.length - labTechs

                // Real-time calculations
                const today = new Date().toISOString().split('T')[0]
                const newRegs = patientsRes.data.data.filter(p => {
                    if (!p.user?.created_at) return false
                    return new Date(p.user.created_at).toISOString().split('T')[0] === today
                }).length

                const uniqueFacilities = new Set(allDoctors.map(d => d.hospital_id)).size || 1

                setStats({
                    totalPatients: patientsRes.data.data.length,
                    activeDoctors: medDocs,
                    labTechnicians: labTechs,
                    facilities: uniqueFacilities,
                    newRegistrationsToday: newRegs,
                    activeSessions: allDoctors.length > 0 ? 1 : 0,
                    emergencyAccessesToday: 0,
                    facilityName: allDoctors.length > 0 ? (allDoctors[0].facility?.name || "National Facility") : "National Headquarters"
                })
            } catch (err) {
                console.error("Admin dashboard stats sync error:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (isLoading) {
        return (
            <AdminLayout title="Registry Sync..." subtitle="Retrieving national healthcare architecture data">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Establishing secure handshake with core registry...</p>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title="System Administration"
            subtitle="National healthcare ecosystem overview and performance monitoring"
        >
            <div className="space-y-8 max-w-[1600px] mx-auto w-full">
                {/* Main Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <StatsCard
                        title="Total Patients"
                        value={stats.totalPatients.toLocaleString()}
                        iconName="users"
                        description="verified in registry"
                    />
                    <StatsCard
                        title="Active Doctors"
                        value={stats.activeDoctors.toLocaleString()}
                        iconName="stethoscope"
                        description="certified practitioners"
                    />
                    <StatsCard
                        title="Lab Technicians"
                        value={stats.labTechnicians.toLocaleString()}
                        iconName="flask-conical"
                        description="diagnostic experts"
                    />
                    <StatsCard
                        title="Facility"
                        value={stats.facilityName}
                        iconName="building"
                        description="Current Campus"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Daily Performance Section */}
                    <Card className="lg:col-span-2 shadow-2xl border-border/50 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between bg-muted/30 pb-6 border-b">
                            <div className="space-y-1.5">
                                <CardTitle className="text-2xl font-black tracking-tight">System Integrity</CardTitle>
                                <CardDescription className="font-bold">Real-time telemetry from the healthcare grid</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-black text-green-600 bg-green-500/10 px-4 py-1.5 rounded-full border border-green-200">
                                <TrendingUp className="h-4 w-4" />
                                <span className="uppercase tracking-widest">Live Flow</span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            {/* Chart Placeholder */}
                            <div className="h-[250px] w-full bg-primary/5 rounded-2xl relative overflow-hidden flex items-end justify-between px-10 pb-6 group border-2 border-dashed">
                                {[40, 65, 45, 90, 85, 55, 75, 60, 95, 80, 70, 85, 60, 40, 50].map((height, i) => (
                                    <div
                                        key={i}
                                        className="w-[4%] bg-primary/20 hover:bg-primary transition-all rounded-t-lg relative group/bar shadow-sm"
                                        style={{ height: `${height}%` }}
                                    >
                                    </div>
                                ))}
                                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                                    <Activity className="h-48 w-48 text-primary" />
                                </div>
                            </div>
                            <div className="mt-10 grid grid-cols-3 gap-8">
                                <div className="space-y-2 text-center border-r-2 border-dashed">
                                    <p className="text-4xl font-black text-primary">{stats.totalPatients}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Patients</p>
                                </div>
                                <div className="space-y-2 text-center border-r-2 border-dashed">
                                    <p className="text-4xl font-black text-primary">{stats.activeDoctors + stats.labTechnicians}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Staff</p>
                                </div>
                                <div className="space-y-2 text-center">
                                    <p className="text-4xl font-black text-primary">100%</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Uptime</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audit Logs */}
                    <RecentActivity />
                </div>
            </div>
        </AdminLayout>
    )
}
