
import { useState, useEffect } from "react"
import DoctorLayout from "@/layouts/DoctorLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Save, Loader2, AlertCircle, CheckCircle, ArrowLeft, History, Activity, Droplets } from "lucide-react"
import api from "@/services/api"
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"

export default function DoctorDiagnosesPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const patientIdParam = searchParams.get('patient_id')

    const [assignedPatients, setAssignedPatients] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [statusMsg, setStatusMsg] = useState({ type: "", text: "" })
    const [viewDiagnosis, setViewDiagnosis] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState(null)

    // Form state for creation only
    const [formData, setFormData] = useState({
        patient_id: patientIdParam || "",
        disease_name: "",
        symptoms: "",
        medications: "",
        suggestions: "",
        conclusion: ""
    })

    // Also update patient_id if searching/navigating while on the same page
    useEffect(() => {
        if (patientIdParam) {
            setFormData(prev => ({ ...prev, patient_id: patientIdParam }))
        }
    }, [patientIdParam])

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Always fetch patients for the create form or just context
                const patientsRes = await api.get('/doctor/patients')
                setAssignedPatients(patientsRes.data.data)

                if (id) {
                    // VIEW MODE: Fetch specific diagnosis
                    console.log("Fetching diagnosis for view:", id)
                    const diagRes = await api.get(`/doctor/diagnoses/${id}`)
                    console.log("Fetched diagnosis data:", diagRes.data)
                    const diag = diagRes.data.data
                    setViewDiagnosis(diag)
                    setEditData({
                        disease_name: diag.disease_name,
                        symptoms: diag.symptoms,
                        medications: diag.medications,
                        suggestions: diag.suggestions || "",
                        conclusion: diag.conclusion || ""
                    })
                }
            } catch (err) {
                console.error("Failed to load data", err)
                setStatusMsg({ type: "error", text: "Could not load clinical record." })
            }
        }
        fetchInitialData()
    }, [id])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatusMsg({ type: "", text: "" })

        if (!formData.patient_id) {
            setStatusMsg({ type: "error", text: "Please select a patient" })
            return
        }

        setIsLoading(true)
        try {
            await api.post(`/doctor/patients/${formData.patient_id}/diagnoses`, {
                ...formData,
                status: 'PENDING' // Default to PENDING
            })
            setStatusMsg({ type: "success", text: "Diagnosis record created successfully!" })
            setTimeout(() => navigate(-1), 1500)
        } catch (err) {
            setStatusMsg({ type: "error", text: err.response?.data?.message || "Failed to create diagnosis" })
            setIsLoading(false)
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setStatusMsg({ type: "", text: "" })
        setIsLoading(true)
        try {
            const res = await api.patch(`/doctor/diagnoses/${id}`, editData)
            setViewDiagnosis(res.data.data)
            setIsEditing(false)
            setStatusMsg({ type: "success", text: "Diagnosis updated successfully!" })
        } catch (err) {
            setStatusMsg({ type: "error", text: err.response?.data?.message || "Failed to update diagnosis" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleMarkComplete = async () => {
        if (!window.confirm("Marking this diagnosis as completed will lock it from further edits. Continue?")) return

        setStatusMsg({ type: "", text: "" })
        setIsLoading(true)
        try {
            const res = await api.patch(`/doctor/diagnoses/${id}/complete`)
            setViewDiagnosis(res.data.data)
            setIsEditing(false)
            setStatusMsg({ type: "success", text: "Diagnosis marked as completed and locked." })
        } catch (err) {
            setStatusMsg({ type: "error", text: err.response?.data?.message || "Failed to complete diagnosis" })
        } finally {
            setIsLoading(false)
        }
    }

    // RENDER: VIEW MODE (Read Only)
    if (id) {
        if (!viewDiagnosis) {
            return (
                <DoctorLayout title="Clinical Record" subtitle="Loading record details...">
                    <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                </DoctorLayout>
            )
        }

        const doctorName = viewDiagnosis.doctor?.user?.name || "Unknown Doctor"
        const patientName = viewDiagnosis.patient?.user?.name || "Unknown Patient"
        const facilityName = viewDiagnosis.facility?.name || "Unknown Facility"

        return (
            <DoctorLayout
                title="Clinical Record Details"
                subtitle={`Case ID: ${viewDiagnosis.diagnosis_id}`}
            >
                <div className="max-w-4xl mx-auto space-y-6 pb-20">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:pl-2 transition-all">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Records
                    </Button>

                    <Card className="border-border/50 shadow-xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b pb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl font-black tracking-tight">{viewDiagnosis.disease_name}</CardTitle>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground font-medium uppercase tracking-widest">
                                        <History className="h-4 w-4" />
                                        <span>Recorded on {dayjs(viewDiagnosis.created_at).format('MMM D, YYYY')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={cn(
                                        "px-4 py-1.5 font-black uppercase tracking-widest text-xs",
                                        viewDiagnosis.status === 'COMPLETED' ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                                    )}>
                                        {viewDiagnosis.status}
                                    </Badge>
                                    {!isEditing && viewDiagnosis.status === 'PENDING' && user?.doctor_profile?.type === 'MEDICAL_DOCTOR' && (
                                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="font-bold border-primary text-primary hover:bg-primary/5">
                                            Edit Record
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {statusMsg.text && (
                                <div className={`mt-4 p-4 rounded-xl border flex items-center gap-3 ${statusMsg.type === 'error' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-green-500/10 border-green-500/20 text-green-600'}`}>
                                    {statusMsg.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                    <span className="text-sm font-bold">{statusMsg.text}</span>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <div className="grid md:grid-cols-3 gap-6 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Patient</span>
                                    <p className="font-bold text-foreground">{patientName}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Attending Physician</span>
                                    <p className="font-bold text-foreground">Dr. {doctorName}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Medical Facility</span>
                                    <p className="font-bold text-foreground">{facilityName}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Activity className="h-4 w-4" /> Disease Name
                                    </h3>
                                    {isEditing ? (
                                        <Input
                                            value={editData.disease_name}
                                            onChange={(e) => setEditData({ ...editData, disease_name: e.target.value })}
                                            className="h-12 border-2 rounded-xl focus:ring-primary/20 font-bold"
                                        />
                                    ) : (
                                        <div className="p-4 rounded-xl border bg-card text-sm font-bold">
                                            {viewDiagnosis.disease_name}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Activity className="h-4 w-4" /> Clinical Observations & Symptoms
                                    </h3>
                                    {isEditing ? (
                                        <Textarea
                                            value={editData.symptoms}
                                            onChange={(e) => setEditData({ ...editData, symptoms: e.target.value })}
                                            className="min-h-[120px] border-2 rounded-xl focus:ring-primary/20 font-medium"
                                        />
                                    ) : (
                                        <div className="p-4 rounded-xl border bg-card text-sm leading-relaxed whitespace-pre-line">
                                            {viewDiagnosis.symptoms}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Droplets className="h-4 w-4" /> Treatment Plan & Medications
                                    </h3>
                                    {isEditing ? (
                                        <Textarea
                                            value={editData.medications}
                                            onChange={(e) => setEditData({ ...editData, medications: e.target.value })}
                                            className="min-h-[120px] border-2 rounded-xl focus:ring-primary/20 font-medium"
                                        />
                                    ) : (
                                        <div className="p-4 rounded-xl border bg-card text-sm leading-relaxed whitespace-pre-line">
                                            {viewDiagnosis.medications}
                                        </div>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Lifestyle Advice</h3>
                                        {isEditing ? (
                                            <Textarea
                                                value={editData.suggestions}
                                                onChange={(e) => setEditData({ ...editData, suggestions: e.target.value })}
                                                className="min-h-[100px] border-2 rounded-xl focus:ring-primary/20 font-medium"
                                            />
                                        ) : (
                                            <div className="p-4 rounded-xl border bg-muted/20 text-sm whitespace-pre-line min-h-[60px]">
                                                {viewDiagnosis.suggestions || "None recorded"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Final Conclusion</h3>
                                        {isEditing ? (
                                            <Textarea
                                                value={editData.conclusion}
                                                onChange={(e) => setEditData({ ...editData, conclusion: e.target.value })}
                                                className="min-h-[100px] border-2 rounded-xl focus:ring-primary/20 font-medium"
                                            />
                                        ) : (
                                            <div className="p-4 rounded-xl border bg-muted/20 text-sm whitespace-pre-line min-h-[60px]">
                                                {viewDiagnosis.conclusion || "None recorded"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex gap-4 pt-6 border-t">
                                        <Button
                                            className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs"
                                            onClick={handleUpdate}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                                        </Button>
                                        <Button
                                            className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-green-600 hover:bg-green-700"
                                            onClick={handleMarkComplete}
                                            disabled={isLoading}
                                        >
                                            Mark as Completed
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs"
                                            onClick={() => setIsEditing(false)}
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DoctorLayout >
        )
    }

    // RENDER: CREATE MODE (Form)
    return (
        <DoctorLayout
            title="New Diagnosis"
            subtitle="Create a new clinical record"
        >
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                </Button>

                <Card className="border-border/50 shadow-xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            New Diagnosis Record
                        </CardTitle>
                        <CardDescription>
                            Create a new permanent medical record. This cannot be edited after saving.
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
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Patient *</Label>
                                <Select
                                    value={formData.patient_id}
                                    onValueChange={(val) => handleChange('patient_id', val)}
                                >
                                    <SelectTrigger className="h-12 border-2 rounded-xl focus:ring-primary/20">
                                        <SelectValue placeholder="Choose patient..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assignedPatients.map(pat => (
                                            <SelectItem key={pat.patient_id} value={pat.patient_id}>
                                                {pat.user?.name || "Unknown"} ({pat.patient_id})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Disease Name *</Label>
                                <Input
                                    placeholder="e.g. Acute Bronchitis"
                                    value={formData.disease_name}
                                    onChange={(e) => handleChange('disease_name', e.target.value)}
                                    required
                                    className="h-12 border-2 rounded-xl focus:ring-primary/20 font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Symptoms *</Label>
                                <Textarea
                                    placeholder="Describe clinical observations..."
                                    className="min-h-[120px] border-2 rounded-xl focus:ring-primary/20 font-medium leading-relaxed"
                                    value={formData.symptoms}
                                    onChange={(e) => handleChange('symptoms', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Medications / Treatment *</Label>
                                <Textarea
                                    placeholder="Prescribed medications and treatment plan..."
                                    className="min-h-[120px] border-2 rounded-xl focus:ring-primary/20 font-medium leading-relaxed"
                                    value={formData.medications}
                                    onChange={(e) => handleChange('medications', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Suggestions</Label>
                                    <Textarea
                                        placeholder="Lifestyle advice..."
                                        className="min-h-[100px] border-2 rounded-xl focus:ring-primary/20 font-medium"
                                        value={formData.suggestions}
                                        onChange={(e) => handleChange('suggestions', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Conclusion</Label>
                                    <Textarea
                                        placeholder="Final notes..."
                                        className="min-h-[100px] border-2 rounded-xl focus:ring-primary/20 font-medium"
                                        value={formData.conclusion}
                                        onChange={(e) => handleChange('conclusion', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t mt-8">
                                <Button size="lg" type="submit" className="w-full md:w-auto min-w-[200px] h-14 rounded-2xl shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-xs" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-3 h-5 w-5" />
                                            Save Diagnosis Record
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

