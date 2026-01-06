import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import DoctorLayout from "@/layouts/DoctorLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Phone, Mail, MapPin, Activity, Plus, Loader2, AlertCircle, FileText, Calendar, FileDown } from "lucide-react"
import { HealthRecords } from "@/components/patient/HealthRecords"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/services/api"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"

export default function DoctorPatientDetailPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const [patient, setPatient] = useState(null)
    const [diagnoses, setDiagnoses] = useState([])
    const [labResults, setLabResults] = useState([])
    const [appointments, setAppointments] = useState([])
    const [activeTab, setActiveTab] = useState("records")
    const [recordSubTab, setRecordSubTab] = useState("diagnoses")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [allergies, setAllergies] = useState([])
    const [isAddAllergyOpen, setIsAddAllergyOpen] = useState(false)
    const [newAllergy, setNewAllergy] = useState({ allergies: "", severity: "MILD" })
    const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false)
    const [medicalFormData, setMedicalFormData] = useState({
        blood_type: "",
        disability: ""
    })

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [patientRes, diagnosesRes, labsRes, appointmentsRes, allergiesRes] = await Promise.all([
                    api.get(`/doctor/patients/${id}`),
                    api.get(`/doctor/patients/${id}/diagnoses`),
                    api.get(`/doctor/patients/${id}/lab-results`),
                    api.get(`/doctor/patients/${id}/appointments`),
                    api.get(`/doctor/patients/${id}/allergies`)
                ])

                setPatient(patientRes.data.data)
                setDiagnoses(diagnosesRes.data.data)
                setLabResults(labsRes.data.data)
                setAppointments(appointmentsRes.data.data)
                setAllergies(allergiesRes.data.data)
            } catch (err) {
                console.error("Failed to fetch patient data", err)
                setError("Could not retrieve patient records. Please verify assignment.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [id])

    useEffect(() => {
        if (patient) {
            setMedicalFormData({
                blood_type: patient.blood_type || "",
                disability: patient.disability || ""
            })
        }
    }, [patient])

    const isMedicalDoctor = user?.doctor_profile?.type === "MEDICAL_DOCTOR"
    const isLabTechnician = user?.doctor_profile?.type === "LAB_TECHNICIAN"

    if (isLoading) {
        return (
            <DoctorLayout title="Loading Records..." subtitle="Synchronizing with national health database">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium animate-pulse">Decrypting and loading clinical data...</p>
                </div>
            </DoctorLayout>
        )
    }

    if (error || !patient) {
        return (
            <DoctorLayout title="Access Denied" subtitle="Patient Record Locked or Unavailable">
                <div className="max-w-md mx-auto mt-20 text-center space-y-6">
                    <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
                        <AlertCircle className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Registry Access Error</h2>
                        <p className="text-muted-foreground">{error || "You do not have authorization to view this patient's records."}</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link to="/doctor/patients">Return to Patient Registry</Link>
                    </Button>
                </div>
            </DoctorLayout>
        )
    }

    const patientName = patient?.user?.name || "Patient Record"
    const birthDate = patient?.user?.dob ? new Date(patient.user.dob).toLocaleDateString() : "N/A"

    const detailTabs = (
        <TabsList className="bg-muted/50 p-1 h-11">
            <TabsTrigger
                value="records"
                className="font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-background"
            >
                Clinical Records
            </TabsTrigger>
            <TabsTrigger
                value="appointments"
                className="font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-background"
            >
                Appointments
            </TabsTrigger>
            <TabsTrigger
                value="profile"
                className="font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-background"
            >
                Bio-Data
            </TabsTrigger>
        </TabsList>
    )

    const handleDownload = (fileUrl, fileName) => {
        const fullUrl = `https://backend-jgdk.onrender.com${fileUrl}`;
        const link = document.createElement('a');
        link.href = fullUrl;
        link.setAttribute('download', fileName || 'report');
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleUpdateMedicalInfo = async () => {
        try {
            await api.patch(`/doctor/patients/${id}/medical-info`, medicalFormData)
            setPatient(prev => ({ ...prev, ...medicalFormData }))
            setIsMedicalModalOpen(false)
        } catch (err) {
            console.error("Failed to update medical info", err)
        }
    }

    const handleAddAllergy = async () => {
        try {
            const res = await api.post(`/doctor/patients/${id}/allergies`, newAllergy)
            setAllergies([res.data.data, ...allergies])
            setIsAddAllergyOpen(false)
            setNewAllergy({ allergies: "", severity: "MILD" })
        } catch (err) {
            console.error("Failed to add allergy", err)
        }
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <DoctorLayout
                title={`Clinical Profile: ${patientName}`}
                subtitle={`Registry ID: ${patient?.patient_id}`}
                tabs={detailTabs}
            >
                <div className="space-y-6 max-w-6xl mx-auto">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                        <Link to="/doctor/patients" className="flex items-center">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Registry
                        </Link>
                    </Button>

                    {/* Patient Header Card */}
                    <div className="grid gap-6 md:grid-cols-3 items-start">
                        <Card className="md:col-span-2 shadow-xl border-border/50">
                            <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                                <div className="h-32 w-32 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-black shrink-0 border-2 border-primary/20 shadow-inner">
                                    {patientName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="space-y-3 flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tight">{patientName}</h2>
                                            <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">
                                                {patient?.gender} • Born {birthDate} • ID: {patient?.patient_id}
                                            </p>
                                        </div>
                                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-4 py-1 font-black uppercase tracking-tighter">
                                            Active Case
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm">
                                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/30">
                                            <Phone className="h-4 w-4 text-primary" />
                                            <span className="font-semibold text-muted-foreground">{patient?.user?.phone || "No phone listed"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/30">
                                            <Mail className="h-4 w-4 text-primary" />
                                            <span className="font-semibold text-muted-foreground truncate">{patient?.user?.email || "No email listed"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/30 sm:col-span-2">
                                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                                            <span className="font-semibold text-muted-foreground">{patient?.user?.address || "No address on record"}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-full bg-destructive/5 border-destructive/10 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 h-full opacity-5">
                                <Activity className="h-32 w-32" />
                            </div>
                            <CardContent className="p-8 space-y-6 relative z-10">
                                <div className="flex items-center justify-between gap-2 text-destructive font-black uppercase tracking-widest text-[10px]">
                                    <div className="flex items-center gap-2"><Activity className="h-4 w-4" /> Vital Information</div>
                                    {isMedicalDoctor && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-[10px] font-bold border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                                            onClick={() => setIsMedicalModalOpen(true)}
                                        >
                                            Edit Vitals
                                        </Button>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-destructive/60 tracking-widest mb-1">Blood Type</p>
                                    <p className="text-4xl font-black text-destructive">{patient?.blood_type || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-destructive/60 tracking-widest mb-1 text-xs">Physical Disability</p>
                                    <Badge variant="outline" className="bg-white/50 border-destructive/20 text-destructive font-bold">
                                        {patient?.disability || "None Reported"}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-destructive/60 tracking-widest mb-1 text-xs">Insurance Provider</p>
                                    <p className="text-sm font-bold text-muted-foreground">{patient?.insurance_company || "Uninsured / Private Pay"}</p>
                                </div>

                                <div className="pt-4 border-t border-destructive/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] font-black uppercase text-destructive/60 tracking-widest">Known Allergies</p>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setIsAddAllergyOpen(true)}>
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(allergies) && allergies.length > 0 ? (
                                            allergies
                                                .filter((a, index, self) =>
                                                    index === self.findIndex((t) => (
                                                        t.allergies?.toLowerCase() === a.allergies?.toLowerCase()
                                                    ))
                                                )
                                                .map((a, i) => (
                                                    <Badge key={i} variant="outline" className="bg-destructive/10 border-destructive/20 text-destructive text-[10px] font-bold">
                                                        {a.allergies} ({a.severity})
                                                    </Badge>
                                                ))
                                        ) : (
                                            <p className="text-[10px] text-muted-foreground italic">None reported</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Add Allergy Modal */}
                    {isAddAllergyOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <Card className="w-full max-w-md">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="text-xl font-bold">Add New Allergy</h3>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Allergy Name</p>
                                        <Input
                                            placeholder="e.g. Penicillin, Peanuts"
                                            value={newAllergy.allergies}
                                            onChange={(e) => setNewAllergy({ ...newAllergy, allergies: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Severity</p>
                                        <div className="flex gap-2">
                                            {['MILD', 'MODERATE', 'SEVERE'].map(sev => (
                                                <Button
                                                    key={sev}
                                                    type="button"
                                                    variant={newAllergy.severity === sev ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setNewAllergy({ ...newAllergy, severity: sev })}
                                                    className="flex-1 text-[10px] font-bold"
                                                >
                                                    {sev}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Button variant="outline" className="flex-1" onClick={() => setIsAddAllergyOpen(false)}>Cancel</Button>
                                        <Button className="flex-1" onClick={handleAddAllergy}>Add Allergy</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Medical Info Modal */}
                    {isMedicalModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <Card className="w-full max-w-md">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="text-xl font-bold">Manage Registry Medical Data</h3>
                                    <p className="text-xs text-muted-foreground">Authorized physicians only. Changes will sync with the patient's national emergency profile.</p>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Blood Type</Label>
                                        <Select
                                            value={medicalFormData.blood_type}
                                            onValueChange={(val) => setMedicalFormData({ ...medicalFormData, blood_type: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select blood type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE'].map(type => (
                                                    <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Physical Disability / Mobility Restrictions</Label>
                                        <Input
                                            placeholder="Specify any disabilities..."
                                            value={medicalFormData.disability}
                                            onChange={(e) => setMedicalFormData({ ...medicalFormData, disability: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button variant="outline" className="flex-1" onClick={() => setIsMedicalModalOpen(false)}>Cancel</Button>
                                        <Button className="flex-1 bg-destructive hover:bg-destructive/90 text-white" onClick={handleUpdateMedicalInfo}>
                                            Update Registry
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Clinical Records Tab */}
                    <TabsContent value="records" className="mt-8 space-y-6">
                        <div className="flex flex-col space-y-6">
                            <div className="flex justify-between items-end border-b pb-4">
                                <div className="flex gap-8">
                                    <button
                                        onClick={() => setRecordSubTab("diagnoses")}
                                        className={cn(
                                            "text-2xl font-bold tracking-tight transition-all pb-1 border-b-2",
                                            recordSubTab === "diagnoses" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        Diagnostic Records
                                    </button>
                                    <button
                                        onClick={() => setRecordSubTab("labs")}
                                        className={cn(
                                            "text-2xl font-bold tracking-tight transition-all pb-1 border-b-2",
                                            recordSubTab === "labs" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        Lab Results
                                    </button>
                                </div>

                                <div>
                                    {recordSubTab === "diagnoses" && isMedicalDoctor && (
                                        <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                                            <Link to={`/doctor/diagnoses?patient_id=${patient?.patient_id}`}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                New Diagnosis
                                            </Link>
                                        </Button>
                                    )}
                                    {recordSubTab === "labs" && isLabTechnician && (
                                        <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                                            <Link to={`/doctor/lab-results/new?patient_id=${patient?.patient_id}`}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Upload Results
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {recordSubTab === "diagnoses" ? (
                                <HealthRecords records={diagnoses} isLoading={false} />
                            ) : (
                                <div className="grid gap-4">
                                    {labResults.length > 0 ? (
                                        labResults.map((result) => (
                                            <Link key={result.lab_id} to={`/doctor/lab-results/${result.lab_id}`} className="block transition-transform hover:scale-[1.01] active:scale-[0.99]">
                                                <Card className="transition-all hover:shadow-2xl border-border/50 group overflow-hidden">
                                                    <CardContent className="p-6 flex items-center justify-between">
                                                        <div className="flex gap-4 items-center">
                                                            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                                <FileText className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-lg group-hover:text-primary transition-colors">{result.test_name || result.type}</h4>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                                    {dayjs(result.test_date || new Date()).format('MMMM D, YYYY')} • {result.facility?.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right">
                                                                <Badge
                                                                    className={cn(
                                                                        "mb-2 uppercase text-[10px] font-black border-none px-3",
                                                                        !result.is_abnormal ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
                                                                    )}
                                                                >
                                                                    {result.is_abnormal ? 'ABNORMAL' : 'NORMAL'}
                                                                </Badge>
                                                                <p className="text-xs text-muted-foreground font-medium underline underline-offset-4 cursor-pointer hover:text-primary transition-colors">
                                                                    {result.result_summary || "Analytical Report"}
                                                                </p>
                                                            </div>
                                                            {result.file_url && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-12 w-12 rounded-xl border-2 hover:bg-primary hover:text-white transition-all shadow-lg"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleDownload(result.file_url, result.file_name);
                                                                    }}
                                                                >
                                                                    <FileDown className="h-5 w-5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-center p-12 bg-muted/10 border-2 border-dashed rounded-2xl border-border/50">
                                            <p className="text-muted-foreground font-medium">No laboratory records associated with this registry ID.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Appointments Tab */}
                    <TabsContent value="appointments" className="mt-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold tracking-tight">Active Clinical Sessions</h3>
                            <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                                <Link to={`/doctor/appointments/new?patient_id=${patient?.patient_id}`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Internal Referral
                                </Link>
                            </Button>
                        </div>
                        <div className="grid gap-4">
                            {appointments.length > 0 ? (
                                appointments.map((appointment) => (
                                    <Card key={appointment.appointment_id} className="border-border/50 hover:shadow-xl transition-all group overflow-hidden">
                                        <CardContent className="p-6 flex items-center justify-between">
                                            <div className="flex gap-4 items-center">
                                                <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                    <Calendar className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-lg group-hover:text-primary transition-colors">
                                                        {dayjs(appointment.when).format('h:mm A')} • {appointment.type || "Clinical Consultation"}
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                        {dayjs(appointment.when).format('MMMM D, YYYY')} • Practitioner: {appointment.doctor?.user?.name} ({appointment.doctor?.user?.specialization})
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-2 font-bold uppercase tracking-widest text-[10px] px-3 py-1">
                                                {appointment.status}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center p-12 bg-muted/10 border-2 border-dashed rounded-2xl border-border/50">
                                    <p className="text-muted-foreground font-medium">Registry has no active or historical sessions on record.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="mt-8">
                        <Card className="border-border/50 shadow-lg">
                            <CardContent className="p-8 space-y-8">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Legal Full Name</p>
                                        <p className="font-bold text-lg">{patientName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Date of Birth</p>
                                        <p className="font-bold text-lg">{birthDate}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Gender Identity</p>
                                        <p className="font-bold text-lg">{patient?.gender}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Nationality</p>
                                        <p className="font-bold text-lg">{patient?.nationality || "Ethiopian"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Place of Birth</p>
                                        <p className="font-bold text-lg">{patient?.place_of_birth || "N/A"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Registration Date</p>
                                        <p className="font-bold text-lg">
                                            {patient?.createdAt ? new Date(patient.createdAt).toLocaleDateString() : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </DoctorLayout>
        </Tabs>
    )
}
