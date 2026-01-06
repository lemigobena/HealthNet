import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    UserPlus,
    FileText,
    UserCog,
    Activity,
    ShieldAlert,
    Eye,
    ArrowUpRight,
    Loader2
} from "lucide-react"
import { Link } from "react-router-dom"
import api from "@/services/api"

const actionIcons = {
    VIEWED_PATIENT_RECORD: { icon: Eye, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    UPLOADED_LAB_RESULT: { icon: FileText, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
    USER_REGISTRATION: { icon: UserPlus, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
    EMERGENCY_ACCESS: { icon: Activity, color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
    SYSTEM_CONFIG_CHANGE: { icon: UserCog, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
    SECURITY_ALERT: { icon: ShieldAlert, color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" },
    CLINICAL_ASSIGNMENT: { icon: UserPlus, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" }
}

export function RecentActivity() {
    const [activities, setActivities] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await api.get('/admin/assignments')
                setActivities(response.data.data.slice(0, 5)) // Get latest 5
            } catch {
                console.error("Failed to fetch activity logs")
            } finally {
                setIsLoading(false)
            }
        }
        fetchActivities()
    }, [])

    return (
        <Card className="shadow-md border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <div className="space-y-1.5">
                    <CardTitle className="text-xl font-bold">System Audit Logs</CardTitle>
                    <CardDescription>Latest events and administrative actions</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/10">
                    <Link to="/admin/assignment">
                        Manage <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-primary/30" />
                        </div>
                    ) : activities.length > 0 ? (
                        activities.map((log, index) => {
                            const config = actionIcons['CLINICAL_ASSIGNMENT']
                            const Icon = config.icon

                            return (
                                <div key={log.id} className="group relative flex items-start gap-4 transition-all">
                                    {index !== activities.length - 1 && (
                                        <div className="absolute left-5 top-10 h-full w-px bg-border group-hover:bg-primary/30 transition-colors" />
                                    )}

                                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.color} transition-transform group-hover:scale-110 shadow-sm`}>
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 space-y-1 pt-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                                Registry Admin
                                            </p>
                                            <time className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                                {new Date(log.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </time>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-1">
                                            Authorized {log.doctor.user.name} for {log.patient.user.name}
                                        </p>
                                        <div className="flex items-center gap-3 pt-1">
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase transition-colors group-hover:border-primary/30">
                                                Clinical Access
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground/60 font-mono">ID: {log.assignment_id}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-6 text-muted-foreground text-sm italic">
                            No recent administrative actions logged.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
