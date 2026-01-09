
import { useState, useEffect } from "react"
import api from "@/services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, User, Plus, CheckCircle, XCircle, Calendar } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export function AppointmentsList() {
    const [appointments, setAppointments] = useState([])
    const [selectedTab, setSelectedTab] = useState("upcoming")

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await api.get('/doctor/appointments')
                setAppointments(res.data.data)
            } catch (err) {
                console.error("Failed to load appointments", err)
            }
        }
        fetchAppointments()
    }, [])

    const statusColors = {
        SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        RESCHEDULED: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    }

    // Sort logic
    const upcomingAppointments = appointments.filter((a) => a.status === "SCHEDULED" || a.status === "RESCHEDULED")
    const pastAppointments = appointments.filter((a) => a.status === "COMPLETED" || a.status === "CANCELLED")

    const AppointmentCard = ({ appointment }) => {
        const dateObj = new Date(appointment.appointment_date || appointment.when)
        const patientName = appointment.patient?.user?.name || "Unknown"
        const patientId = appointment.patient?.patient_id || "N/A"
        const isPast = dateObj < new Date()
        const isCompleted = appointment.status === "COMPLETED"
        const isOverdue = isPast && !isCompleted

        return (
            <div className={cn(
                "flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted/50",
                isCompleted && "opacity-50 blur-[1px] grayscale-[0.5] pointer-events-none",
                isOverdue && "border-red-400 border-2 bg-red-50/10"
            )}>
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="text-xs font-medium">{dateObj.getDate()}</span>
                        <span className="text-[10px]">
                            {dateObj.toLocaleString("default", { month: "short" })}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{patientName}</h4>
                            <Badge variant="secondary" className={statusColors[appointment.status] || "bg-gray-100"}>
                                {appointment.status}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            <Clock className="mr-1 inline h-3 w-3" />
                            {appointment.time ? appointment.time : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({appointment.duration || 30} min) • {appointment.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            <User className="mr-1 inline h-3 w-3" />
                            {patientId}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {appointment.status !== "COMPLETED" && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleComplete(appointment.appointment_id || appointment.id)}
                                disabled={new Date(appointment.appointment_date || appointment.when) > new Date()}
                                title={new Date(appointment.appointment_date || appointment.when) > new Date() ? "Only enabled after appointment time" : ""}
                            >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Completed
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                disabled={appointment.status === "COMPLETED"}
                            >
                                <Link to={`/doctor/appointments/reschedule/${appointment.appointment_id || appointment.id}`}>
                                    <Calendar className="mr-1 h-4 w-4" />
                                    Reschedule
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        )
    }

    const handleComplete = async (id) => {
        try {
            await api.patch(`/doctor/appointments/${id}/complete`)
            setAppointments(prev => prev.map(a => (a.appointment_id === id || a.id === id) ? { ...a, status: 'COMPLETED' } : a))
        } catch (err) {
            console.error("Failed to complete appointment", err)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Appointments</CardTitle>
                    <CardDescription>Manage your patient appointments</CardDescription>
                </div>
                <Button asChild>
                    <Link to="/doctor/appointments/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Appointment
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
                        <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
                        <TabsTrigger value="all">All ({appointments.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-4">
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map((appointment) => (
                                <AppointmentCard key={appointment.appointment_id || appointment.id} appointment={appointment} />
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No upcoming appointments</p>
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="space-y-4">
                        {pastAppointments.map((appointment) => (
                            <AppointmentCard key={appointment.appointment_id || appointment.id} appointment={appointment} />
                        ))}
                    </TabsContent>

                    <TabsContent value="all" className="space-y-4">
                        {appointments.map((appointment) => (
                            <AppointmentCard key={appointment.appointment_id || appointment.id} appointment={appointment} />
                        ))}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
