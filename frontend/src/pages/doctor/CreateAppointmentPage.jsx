import { useState, useEffect } from "react"
import DoctorLayout from "@/layouts/DoctorLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, User, Save, Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import api from "@/services/api"

export default function CreateAppointmentPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const patientIdParam = searchParams.get('patient_id')

    const [isLoading, setIsLoading] = useState(false)
    const [patients, setPatients] = useState([])
    const [statusMsg, setStatusMsg] = useState({ type: "", text: "" })

    const [formData, setFormData] = useState({
        patient_id: patientIdParam || "",
        appointment_date: "",
        time: "",
        type: "General Consultation",
        notes: "",
        duration: "30"
    })

    // Also update patient_id if searching/navigating while on the same page
    useEffect(() => {
        if (patientIdParam) {
            setFormData(prev => ({ ...prev, patient_id: patientIdParam }))
        }
    }, [patientIdParam])

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await api.get('/doctor/patients')
                setPatients(res.data.data)
            } catch (err) {
                console.error("Failed to load patients", err)
            }
        }
        fetchPatients()
    }, [])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatusMsg({ type: "", text: "" })
        setIsLoading(true)

        if (!formData.patient_id || !formData.appointment_date || !formData.time) {
            setStatusMsg({ type: "error", text: "Please fill in all required fields" })
            setIsLoading(false)
            return
        }

        try {
            // Combine date and time
            const dateTime = new Date(`${formData.appointment_date}T${formData.time}`)

            await api.post('/doctor/appointments', {
                patient_id: formData.patient_id,
                appointment_date: dateTime.toISOString(),
                type: formData.type,
                notes: formData.notes,
                duration: parseInt(formData.duration)
            })

            setStatusMsg({ type: "success", text: "Appointment scheduled successfully!" })
            setTimeout(() => navigate('/doctor/appointments'), 1500)
        } catch (err) {
            console.error(err)
            setStatusMsg({ type: "error", text: err.response?.data?.message || "Failed to create appointment" })
            setIsLoading(false)
        }
    }

    return (
        <DoctorLayout
            title="Schedule Appointment"
            subtitle="Create a new appointment for a patient"
        >
            <div className="max-w-2xl mx-auto space-y-6 pb-20">
                <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments
                </Button>

                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            New Appointment
                        </CardTitle>
                        <CardDescription>
                            Schedule a consultation or check-up
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
                                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Select Patient *</Label>
                                <Select
                                    value={formData.patient_id}
                                    onValueChange={(val) => handleChange('patient_id', val)}
                                >
                                    <SelectTrigger className="h-12 border-2 rounded-xl">
                                        <SelectValue placeholder="Choose a patient..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map(p => (
                                            <SelectItem key={p.patient_id} value={p.patient_id}>
                                                {p.user?.name} ({p.patient_id})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Date *</Label>
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
                                    <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Time *</Label>
                                    <Input
                                        type="time"
                                        className="h-12 border-2 rounded-xl"
                                        value={formData.time}
                                        onChange={(e) => handleChange('time', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Type / Reason *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => handleChange('type', val)}
                                >
                                    <SelectTrigger className="h-12 border-2 rounded-xl">
                                        <SelectValue placeholder="Select type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General Consultation">General Consultation</SelectItem>
                                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                                        <SelectItem value="Lab Results Review">Lab Results Review</SelectItem>
                                        <SelectItem value="Emergency">Emergency</SelectItem>
                                        <SelectItem value="Vaccination">Vaccination</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Additional Notes</Label>
                                <Textarea
                                    placeholder="Any specific details for this appointment..."
                                    className="min-h-[100px] border-2 rounded-xl resize-none"
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                />
                            </div>

                            <div className="pt-4 border-t">
                                <Button size="lg" type="submit" className="w-full h-12 rounded-xl font-bold" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Scheduling...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Schedule Appointment
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DoctorLayout>
    )
}
