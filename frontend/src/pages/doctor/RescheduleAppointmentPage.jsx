
import { useState, useEffect } from "react"
import DoctorLayout from "@/layouts/DoctorLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Save, Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import api from "@/services/api"
import dayjs from "dayjs"

export default function RescheduleAppointmentPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [appointment, setAppointment] = useState(null)
    const [statusMsg, setStatusMsg] = useState({ type: "", text: "" })

    const [formData, setFormData] = useState({
        appointment_date: "",
        time: ""
    })

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                const res = await api.get(`/doctor/appointments/${id}`)
                const appt = res.data.data
                setAppointment(appt)

                const dateObj = dayjs(appt.when)
                setFormData({
                    appointment_date: dateObj.format('YYYY-MM-DD'),
                    time: dateObj.format('HH:mm')
                })
            } catch (err) {
                console.error("Failed to load appointment", err)
                setStatusMsg({ type: "error", text: "Failed to load appointment details" })
            } finally {
                setIsFetching(false)
            }
        }
        fetchAppointment()
    }, [id])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatusMsg({ type: "", text: "" })
        setIsLoading(true)

        if (!formData.appointment_date || !formData.time) {
            setStatusMsg({ type: "error", text: "Please fill in all required fields" })
            setIsLoading(false)
            return
        }

        try {
            // Combine date and time
            const dateTime = dayjs(`${formData.appointment_date}T${formData.time}`).toISOString()

            await api.patch(`/doctor/appointments/${id}/reschedule`, {
                newDateTime: dateTime
            })

            setStatusMsg({ type: "success", text: "Appointment rescheduled successfully!" })
            setTimeout(() => navigate('/doctor/appointments'), 1500)
        } catch (err) {
            console.error(err)
            setStatusMsg({ type: "error", text: err.response?.data?.message || "Failed to reschedule appointment" })
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return (
            <DoctorLayout title="Reschedule" subtitle="Please wait...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DoctorLayout>
        )
    }

    return (
        <DoctorLayout
            title="Reschedule Appointment"
            subtitle={`Updating appointment for ${appointment?.patient?.user?.name || 'Patient'}`}
        >
            <div className="max-w-2xl mx-auto space-y-6 pb-20">
                <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments
                </Button>

                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Update Date & Time
                        </CardTitle>
                        <CardDescription>
                            Select a new time for this appointment
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {statusMsg.text && (
                                <div className={`p-4 rounded-xl border flex items-center gap-3 ${statusMsg.type === 'error' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-green-500/10 border-green-500/20 text-green-600'
                                    }`}>
                                    {statusMsg.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                    <span className="text-sm font-bold">{statusMsg.text}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Patient</Label>
                                <Input
                                    value={`${appointment?.patient?.user?.name} (${appointment?.patient?.patient_id})`}
                                    disabled
                                    className="h-12 border-2 rounded-xl bg-muted/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">New Date *</Label>
                                    <Input
                                        type="date"
                                        className="h-12 border-2 rounded-xl"
                                        value={formData.appointment_date}
                                        onChange={(e) => handleChange('appointment_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">New Time *</Label>
                                    <Input
                                        type="time"
                                        className="h-12 border-2 rounded-xl"
                                        value={formData.time}
                                        onChange={(e) => handleChange('time', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <Button size="lg" type="submit" className="w-full h-12 rounded-xl font-bold" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Update Appointment
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    type="button"
                                    className="w-full mt-2"
                                    onClick={() => navigate('/doctor/appointments')}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DoctorLayout>
    )
}
