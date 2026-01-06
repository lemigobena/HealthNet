
import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Loader2, Upload, X, FileText, ShieldCheck, AlertCircle } from "lucide-react"
import api from "@/services/api"


export function UploadLabResultForm({ initialPatientId }) {
    const [assignedPatients, setAssignedPatients] = useState([])
    const [isFetching, setIsFetching] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [file, setFile] = useState(null)

    const [formData, setFormData] = useState({
        patient_id: "",
        test_name: "",
        type: "BLOOD_TEST",
        result_value: "NORMAL",
        status: "FINAL",
        test_date: new Date().toISOString().split('T')[0],
        findings: "",
        notes: "",
    })

    useEffect(() => {
        if (initialPatientId) {
            updateField("patient_id", initialPatientId)
        }
    }, [initialPatientId])

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/doctor/patients')
                setAssignedPatients(response.data.data)
            } catch (err) {
                console.error("Failed to fetch patients", err)
                setError("Could not load patient list.")
            } finally {
                setIsFetching(false)
            }
        }
        fetchPatients()
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0]
            if (droppedFile.type === "application/pdf" || droppedFile.type.startsWith("image/")) {
                setFile(droppedFile)
            }
        }
    }, [])

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!file || !formData.patient_id || !formData.test_name) {
            setError("Please complete all required fields and upload a file.")
            return
        }

        setIsLoading(true)
        try {
            const data = new FormData()
            data.append('file', file)

            // Append all fields to FormData
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key])
            })

            await api.post(`/doctor/patients/${formData.patient_id}/lab-results`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                setFile(null)
                setFormData({
                    patient_id: "",
                    test_name: "",
                    type: "BLOOD_TEST",
                    result_value: "NORMAL",
                    status: "FINAL",
                    test_date: new Date().toISOString().split('T')[0],
                    findings: "",
                    notes: "",
                })
            }, 5000)
        } catch (err) {
            setError(err.response?.data?.message || "Critical system error during transmission.")
        } finally {
            setIsLoading(false)
        }
    }

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    if (success) {
        return (
            <Card className="border-green-200 bg-green-50 animate-in zoom-in duration-300">
                <CardContent className="pt-8 pb-8 text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-green-700">Transmission Verified</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">
                            Lab results have been securely uploaded, indexed, and linked to patient record.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => setSuccess(false)} className="mt-4">
                        Upload Another
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-xl border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary"><FileText className="h-5 w-5" /></div>
                    <CardTitle className="text-xl font-bold">Laboratory Data Integration</CardTitle>
                </div>
                <CardDescription>Digitize and link laboratory reports to the national patient record system.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md flex items-center gap-3 text-sm font-medium">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider">Patient Registry Selection *</Label>
                            <Select
                                value={formData.patient_id}
                                onValueChange={(value) => updateField("patient_id", value)}
                                disabled={isFetching}
                            >
                                <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors">
                                    <SelectValue placeholder={isFetching ? "Syncing database..." : "Search patient database"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignedPatients.map(pat => (
                                        <SelectItem key={pat.patient_id} value={pat.patient_id}>
                                            <span className="font-bold">{pat.user.name}</span>
                                            <span className="ml-2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{pat.patient_id}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider">Test Name / Identifier *</Label>
                            <Input
                                placeholder="e.g. CBC with Differential"
                                value={formData.test_name}
                                onChange={(e) => updateField("test_name", e.target.value)}
                                className="h-12 border-2"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider">Diagnostic Category</Label>
                            <Select value={formData.type} onValueChange={(value) => updateField("type", value)}>
                                <SelectTrigger className="h-12 border-2">
                                    <SelectValue />
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
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider">Result Classification</Label>
                            <Select value={formData.result_value} onValueChange={(value) => updateField("result_value", value)}>
                                <SelectTrigger className="h-12 border-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NORMAL">Normal / Within Range</SelectItem>
                                    <SelectItem value="ABNORMAL">Abnormal / Critical</SelectItem>
                                    <SelectItem value="INCONCLUSIVE">Inconclusive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider">Test Date</Label>
                            <Input
                                type="date"
                                value={formData.test_date}
                                onChange={(e) => updateField("test_date", e.target.value)}
                                className="h-12 border-2"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="font-bold text-xs uppercase tracking-wider">Digital Report (PDF / High-res Scan) *</Label>
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-8 transition-all hover:bg-muted/40 hover:border-primary/40 group"
                        >
                            {file ? (
                                <div className="flex items-center gap-6 p-4 bg-background rounded-xl border shadow-sm animate-in fade-in slide-in-from-top-4 w-full">
                                    <div className="bg-primary/10 p-3 rounded-lg text-primary"><FileText className="h-8 w-8" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{file.name}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black">{(file.size / 1024 / 1024).toFixed(2)} MB • READY</p>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => setFile(null)} className="hover:bg-destructive/10 hover:text-destructive">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary/40 group-hover:scale-110 transition-transform">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <p className="mb-1 text-sm font-bold text-foreground text-center">
                                        Drop report files here to initiate upload
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mb-4 uppercase tracking-tighter">Secured PDF, JPG, or PNG (Max 15MB)</p>
                                    <Button type="button" variant="outline" className="relative h-10 px-8 font-bold border-2 bg-transparent">
                                        Browse Registry
                                        <Input
                                            type="file"
                                            accept=".pdf,image/*"
                                            onChange={handleFileSelect}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider">Findings Summary</Label>
                            <Textarea
                                value={formData.findings}
                                onChange={(e) => updateField("findings", e.target.value)}
                                placeholder="Key observations..."
                                className="resize-none border-2 min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider">Internal Clinical Notes</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => updateField("notes", e.target.value)}
                                placeholder="Private notes for medical staff..."
                                className="resize-none border-2 min-h-[100px]"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4 border-t">
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full h-14 text-lg font-black tracking-tight shadow-lg shadow-primary/20"
                            disabled={isLoading || !file || !formData.patient_id || !formData.test_name}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    TRANSMITTING ENCRYPTED DATA...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="mr-3 h-5 w-5" />
                                    SECURELY COMMIT RESULTS
                                </>
                            )}
                        </Button>

                        <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest flex items-center justify-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-primary" />
                            HIPAA Compliant • encrypted in-transit • Audit Log Enabled
                        </p>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
