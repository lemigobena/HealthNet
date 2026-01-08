
import { useState, useEffect } from "react"
import PatientLayout from "@/layouts/PatientLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/services/api"

const statusStyles = {
    SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    RESCHEDULED: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
    COMPLETED: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400",
}

export default function PatientAppointmentsPage() {
    const [appointments, setAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/patient/appointments')
                setAppointments(response.data.data)
            } catch (err) {
                console.error("Failed to fetch appointments", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchAppointments()
    }, [])

    if (isLoading) {
        return (
            <PatientLayout title="My Appointments" subtitle="Synchronizing your schedule...">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Accessing appointment records...</p>
                </div>
            </PatientLayout>
        )
    }

    const upcoming = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'RESCHEDULED')
    const history = appointments.filter(a => a.status === 'COMPLETED')
    const cancelled = appointments.filter(a => a.status === 'CANCELLED')

    return (
        <PatientLayout title="My Appointments" subtitle="Manage your upcoming and past visits">
            <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="mb-6 grid w-full grid-cols-3 max-w-[450px] mx-auto">
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                        <TabsTrigger value="all">All Appointments</TabsTrigger>
                    </TabsList>

                    {/* Upcoming */}
                    <TabsContent value="upcoming" className="space-y-4">
                        {upcoming.map(appointment => (
                            <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
                        ))}
                        {upcoming.length === 0 && (
                            <NoAppointments message="No upcoming appointments scheduled." />
                        )}
                    </TabsContent>

                    {/* History */}
                    <TabsContent value="history" className="space-y-4">
                        {history.map(appointment => (
                            <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
                        ))}
                        {history.length === 0 && (
                            <NoAppointments message="No past appointment history found." />
                        )}
                    </TabsContent>

                    {/* All */}
                    <TabsContent value="all" className="space-y-4">
                        {appointments.map(appointment => (
                            <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
                        ))}
                        {appointments.length === 0 && (
                            <NoAppointments message="No appointments found." />
                        )}
                    </TabsContent>

                </Tabs>
            </div>
        </PatientLayout>
    )
}

function AppointmentCard({ appointment }) {
    const dateObj = new Date(appointment.when)
    const day = dateObj.getDate()
    const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase()
    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    return (
        <Card className="hover:shadow-md transition-shadow border-border/50">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center justify-center h-16 w-16 bg-primary/10 rounded-xl text-primary shrink-0">
                            <span className="text-xl font-bold">{day}</span>
                            <span className="text-[10px] font-bold uppercase">{month}</span>
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-lg">Dr. {appointment.doctor?.user?.name}</h4>
                            <p className="text-sm text-muted-foreground font-medium">{appointment.doctor?.specialization}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {time}</span>
                                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {appointment.facility?.name || "Main Facility"}</span>
                                <span className="flex items-center gap-1.5 font-semibold text-foreground/80"><Calendar className="h-3.5 w-3.5" /> {appointment.reason}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end justify-center min-w-[140px]">
                        <Badge variant="outline" className={`${statusStyles[appointment.status]} capitalize px-4 py-1.5 font-black tracking-widest text-[10px]`}>
                            {appointment.status}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function NoAppointments({ message }) {
    return (
        <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-muted/10 border-border/40">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-bold">{message}</p>
        </div>
    )
}

