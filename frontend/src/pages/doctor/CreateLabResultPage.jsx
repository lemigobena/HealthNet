import { useState, useEffect } from "react"
import DoctorLayout from "@/layouts/DoctorLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FlaskConical, Save, Loader2, ArrowLeft, CheckCircle, AlertCircle, Upload } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import api from "@/services/api"

export default function CreateLabResultPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const preSelectedPatientId = searchParams.get("patient_id")

    const [isLoading, setIsLoading] = useState(false)
    const [patients, setPatients] = useState([])
    const [statusMsg, setStatusMsg] = useState({ type: "", text: "" })
    const [file, setFile] = useState(null)

    const [formData, setFormData] = useState({
        patient_id: preSelectedPatientId || "",
        test_name: "",
        result_value: "",
        status: "",
        type: "",
    })

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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatusMsg({ type: "", text: "" })
        setIsLoading(true)

        if (!formData.patient_id || !formData.test_name || !formData.result_value || !formData.status || !formData.type) {
            setStatusMsg({ type: "error", text: "Please fill in all required fields" })
            setIsLoading(false)
            return
        }

        try {
            const data = new FormData()
            data.append("test_name", formData.test_name)
            data.append("result_value", formData.result_value)
            data.append("status", formData.status)
            data.append("type", formData.type)
            if (file) {
                data.append("file", file)
            }

            // The endpoint is /doctor/patients/:patientId/lab-results
            await api.post(`/doctor/patients/${formData.patient_id}/lab-results`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            setStatusMsg({ type: "success", text: "Lab result uploaded successfully!" })
            setTimeout(() => navigate(`/doctor/patients/${formData.patient_id}`), 1500)
        } catch (err) {
            console.error(err)
            setStatusMsg({ type: "error", text: err.response?.data?.message || "Failed to upload lab result" })
            setIsLoading(false)
        }
    }

    return (
        <DoctorLayout
            title="Upload Lab Result"
            subtitle="Record and upload laboratory findings"
        >
            <div className="max-w-2xl mx-auto space-y-6 pb-20">
                <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient
                </Button>

                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <FlaskConical className="h-5 w-5 text-primary" />
                            New Lab Result
                        </CardTitle>
                        <CardDescription>
                            Enter test details and upload supporting documents
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
                                    disabled={!!preSelectedPatientId}
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
                                    <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Test Name *</Label>
                                    <Input
                                        placeholder="e.g. CBC, Lipid Panel"
                                        className="h-12 border-2 rounded-xl"
                                        value={formData.test_name}
                                        onChange={(e) => handleChange('test_name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Type *</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val) => handleChange('type', val)}
                                    >
                                        <SelectTrigger className="h-12 border-2 rounded-xl">
                                            <SelectValue placeholder="Select type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BLOOD_TEST">Blood Test</SelectItem>
                                            <SelectItem value="URINE_TEST">Urine Test</SelectItem>
                                            <SelectItem value="X_RAY">X-Ray</SelectItem>
                                            <SelectItem value="MRI">MRI</SelectItem>
                                            <SelectItem value="CT_SCAN">CT Scan</SelectItem>
                                            <SelectItem value="ULTRASOUND">Ultrasound</SelectItem>
                                            <SelectItem value="ECG">ECG</SelectItem>
                                            <SelectItem value="EEG">EEG</SelectItem>
                                            <SelectItem value="BIOPSY">Biopsy</SelectItem>
                                            <SelectItem value="CULTURE_TEST">Culture Test</SelectItem>
                                            <SelectItem value="GENETIC_TEST">Genetic Test</SelectItem>
                                            <SelectItem value="ALLERGY_TEST">Allergy Test</SelectItem>
                                            <SelectItem value="COVID_TEST">Covid Test</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Result Value / Summary *</Label>
                                <Textarea
                                    placeholder="Enter the main result value or a brief summary..."
                                    className="min-h-[100px] border-2 rounded-xl resize-none"
                                    value={formData.result_value}
                                    onChange={(e) => handleChange('result_value', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Clinical Status *</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => handleChange('status', val)}
                                >
                                    <SelectTrigger className="h-12 border-2 rounded-xl">
                                        <SelectValue placeholder="Select status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NORMAL">Normal</SelectItem>
                                        <SelectItem value="ABNORMAL">Abnormal</SelectItem>
                                        <SelectItem value="CRITICAL">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Attachment (Optional)</Label>
                                <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
                                    />
                                    <div className="text-center space-y-2">
                                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <div className="text-sm font-medium">
                                            {file ? (
                                                <span className="text-primary font-bold">{file.name}</span>
                                            ) : (
                                                <div className="space-y-2">
                                                    <span className="text-muted-foreground">Drag and drop files here or click to upload</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground pt-2">PDF, JPEG, PNG up to 10MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <Button size="lg" type="submit" className="w-full h-12 rounded-xl font-bold" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Lab Result
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
