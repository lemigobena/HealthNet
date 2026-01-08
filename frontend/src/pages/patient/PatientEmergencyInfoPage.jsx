
import { useState, useEffect } from "react"
import PatientLayout from "@/layouts/PatientLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Droplets, AlertTriangle, Phone, Save, Trash2, Loader2, Eye, EyeOff, FileText, FlaskConical, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import api from "@/services/api"
import { cn } from "@/lib/utils"

export default function PatientEmergencyInfoPage() {
    const [emergencyData, setEmergencyData] = useState({
        blood_type: "N/A",
        known_allergies: "",
        chronic_conditions: "",
        current_medications: "",
        disability_info: "",
        emergency_contact_name: "",
        emergency_contact_relationship: "",
        emergency_contact_phone: "",
        blood_type_visible: false,
        disability_visible: false
    })

    const [diagnoses, setDiagnoses] = useState([])
    const [labResults, setLabResults] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [newAllergy, setNewAllergy] = useState("")

    const fetchAllData = async () => {
        setIsLoading(true)
        try {
            const [emergencyRes, diagnosesRes, labsRes] = await Promise.all([
                api.get('/patient/emergency-info'),
                api.get('/patient/diagnoses'),
                api.get('/patient/lab-results')
            ])
            if (emergencyRes.data.data) {
                setEmergencyData(emergencyRes.data.data)
            }
            setDiagnoses(diagnosesRes.data.data)
            setLabResults(labsRes.data.data)
        } catch (err) {
            console.error("Failed to fetch emergency page data", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAllData()
    }, [])

    const handleToggleVisibility = async (type, id, currentVisible) => {
        try {
            let endpoint = ""
            if (type === 'diagnosis') endpoint = `/patient/diagnoses/${id}/visibility`
            else if (type === 'lab') endpoint = `/patient/lab-results/${id}/visibility`
            else if (type === 'medical') endpoint = `/patient/medical-info/visibility`
            else if (type === 'allergy_item') endpoint = `/patient/allergies/${id}/visibility`

            const payload = type === 'medical' ? { field: id, visible: !currentVisible } : { visible: !currentVisible }

            await api.patch(endpoint, payload)

            // Refresh data
            if (type === 'medical') {
                setEmergencyData(prev => ({ ...prev, [id + '_visible']: !currentVisible }))
            } else if (type === 'diagnosis') {
                setDiagnoses(prev => prev.map(d => d.diagnosis_id === id ? { ...d, emergency_visible: !currentVisible } : d))
            } else if (type === 'lab') {
                setLabResults(prev => prev.map(l => l.lab_id === id ? { ...l, emergency_visible: !currentVisible } : l))
            } else if (type === 'allergy_item') {
                setEmergencyData(prev => ({
                    ...prev,
                    allergies: prev.allergies.map(a => a.id === id ? { ...a, emergency_visible: !currentVisible } : a)
                }))
            }
        } catch (err) {
            console.error("Failed to toggle visibility", err)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await api.put('/patient/emergency-info', {
                emergency_contact_name: emergencyData.emergency_contact_name,
                emergency_contact_phone: emergencyData.emergency_contact_phone,
                emergency_contact_relationship: emergencyData.emergency_contact_relationship,
                known_allergies: emergencyData.known_allergies,
                chronic_conditions: emergencyData.chronic_conditions,
                current_medications: emergencyData.current_medications,
                disability_info: emergencyData.disability_info
            })
            setIsEditing(false)
            await fetchAllData() // Refresh to get updated fields
        } catch (err) {
            console.error("Failed to save emergency info", err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setEmergencyData(prev => ({ ...prev, [name]: value }))
    }

    const handleAddAllergy = async () => {
        if (!newAllergy.trim()) return
        try {
            await api.post('/patient/allergies', { allergy: newAllergy })
            setNewAllergy("")
            await fetchAllData()
        } catch (err) {
            console.error("Failed to add allergy", err)
        }
    }

    const handleDeleteAllergy = async (id) => {
        try {
            await api.delete(`/patient/allergies/${id}`)
            await fetchAllData()
        } catch (err) {
            console.error("Failed to delete allergy", err)
        }
    }

    if (isLoading) {
        return (
            <PatientLayout title="Emergency Records" subtitle="Synchronizing your safety profile...">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Establishing secure protocol...</p>
                </div>
            </PatientLayout>
        )
    }


    return (
        <PatientLayout
            title="Emergency Information"
            subtitle="Manage critical medical data accessible to first responders"
        >
            <div className="max-w-3xl mx-auto space-y-6">

                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-xl p-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h4 className="font-black text-xl text-red-800 dark:text-red-400 uppercase tracking-tight">Critical Medical Profile</h4>
                            <p className="text-sm text-red-700/70 dark:text-red-300/60 font-medium">
                                Vital parameters for emergency response. Keep this data verified.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant={isEditing ? "destructive" : "default"}
                        size="lg"
                        className={cn("min-w-[140px] font-black uppercase tracking-widest shadow-lg", !isEditing && "bg-red-600 hover:bg-red-700")}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? "Cancel Edit" : "Update Profile"}
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Medical Core */}
                    <Card className="h-fit border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Droplets className="h-5 w-5 text-primary" />
                                Medical Base
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Label>Blood Type</Label>
                                <div className="p-4 bg-muted/20 border-2 border-dashed rounded-lg text-center relative group">
                                    <span className="text-3xl font-black">{emergencyData.blood_type || "N/A"}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn("absolute top-1 right-1 h-8 w-8", emergencyData.blood_type_visible ? "text-primary" : "text-muted-foreground")}
                                        onClick={() => handleToggleVisibility('medical', 'blood_type', emergencyData.blood_type_visible)}
                                    >
                                        {emergencyData.blood_type_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-widest">
                                    {emergencyData.blood_type_visible ? "Visible on Emergency Portal" : "Hidden from Emergency Portal"}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Label className="text-base font-bold">Critical Allergies</Label>
                                    <p className="text-xs text-muted-foreground mb-3">Substances that cause adverse reactions.</p>
                                </div>

                                {isEditing ? (
                                    <div className="space-y-3">
                                        <div className="space-y-3">
                                            {emergencyData.allergies && emergencyData.allergies.length > 0 && (
                                                <div className="grid grid-cols-1 gap-2">
                                                    {emergencyData.allergies.map((allergy) => (
                                                        <div key={allergy.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                                    <AlertTriangle className="h-4 w-4" />
                                                                </div>
                                                                <span className="font-bold text-red-900">{allergy.allergies}</span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                                                onClick={() => handleDeleteAllergy(allergy.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                value={newAllergy}
                                                onChange={(e) => setNewAllergy(e.target.value)}
                                                placeholder="Add new allergy (e.g. Latex)"
                                                className="border-red-200 focus:border-red-500"
                                            />
                                            <Button onClick={handleAddAllergy} className="bg-red-600 hover:bg-red-700 text-white">
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {emergencyData.allergies && emergencyData.allergies.length > 0 ? emergencyData.allergies.map((allergy) => (
                                            <div key={allergy.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100 shadow-sm transition-all hover:shadow-md hover:border-red-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                        <AlertTriangle className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-red-900 leading-tight">{allergy.allergies}</p>
                                                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">High Risk</p>
                                                    </div>
                                                </div>
                                                {/* Visibility Toggle per allergy */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn("h-8 w-8 ml-2", allergy.emergency_visible ? "text-red-900 bg-red-100/50" : "text-gray-400")}
                                                    onClick={() => handleToggleVisibility('allergy_item', allergy.id, allergy.emergency_visible)}
                                                >
                                                    {allergy.emergency_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        )) : (
                                            <div className="col-span-full py-6 text-center text-muted-foreground italic text-sm bg-muted/20 rounded-xl border border-dashed border-border/50">
                                                No critical allergies registered.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label>Disability Information</Label>
                                <div className="flex items-center gap-3">
                                    {isEditing ? (
                                        <Input
                                            name="disability_info"
                                            value={emergencyData.disability_info || ""}
                                            onChange={handleChange}
                                            placeholder="Values entered here will overwrite your main profile."
                                            className="flex-1"
                                        />
                                    ) : (
                                        <p className="text-sm border p-3 rounded-lg bg-muted/5 font-medium flex-1">
                                            {emergencyData.disability_info || "No disability info registered"}
                                        </p>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={cn("h-10 w-10", emergencyData.disability_visible ? "text-primary border-primary/30 bg-primary/5" : "text-muted-foreground")}
                                        onClick={() => handleToggleVisibility('medical', 'disability', emergencyData.disability_visible)}
                                    >
                                        {emergencyData.disability_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contacts */}
                    <Card className="h-fit border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-primary" />
                                Emergency Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Contact Person Name</Label>
                                <Input
                                    disabled={!isEditing}
                                    name="emergency_contact_name"
                                    value={emergencyData.emergency_contact_name || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Relationship</Label>
                                <Input
                                    disabled={!isEditing}
                                    name="emergency_contact_relationship"
                                    value={emergencyData.emergency_contact_relationship || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    disabled={!isEditing}
                                    name="emergency_contact_phone"
                                    value={emergencyData.emergency_contact_phone || ""}
                                    onChange={handleChange}
                                    className="font-mono"
                                />
                            </div>

                            {isEditing && (
                                <Button
                                    className="w-full mt-4 font-black uppercase tracking-widest h-12"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                    Update Registry
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Emergency Records Management */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">Emergency Profile Management</h3>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Select records to sync with public SafePass</p>
                        </div>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 font-black">
                            {diagnoses.filter(d => d.emergency_visible).length + labResults.filter(l => l.emergency_visible).length} RECORDS SYNCED
                        </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Diagnoses Management */}
                        <Card className="border-border/50 shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4 border-b">
                                <CardTitle className="text-sm flex items-center justify-between">
                                    <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> My Diagnoses</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {diagnoses.length > 0 ? (
                                    <div className="divide-y divide-border/50">
                                        {diagnoses.map((diag) => (
                                            <div key={diag.diagnosis_id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors group">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm">{diag.disease_name}</p>
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-60">{new Date(diag.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant={diag.emergency_visible ? "default" : "outline"}
                                                    className={cn("h-8 gap-1.5 font-black text-[10px] uppercase tracking-tighter", diag.emergency_visible ? "bg-green-600 hover:bg-green-700" : "")}
                                                    onClick={() => handleToggleVisibility('diagnosis', diag.diagnosis_id, diag.emergency_visible)}
                                                >
                                                    {diag.emergency_visible ? <CheckCircle2 className="h-3 w-3" /> : null}
                                                    {diag.emergency_visible ? "Added to emergency" : "Add to emergency"}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground italic text-xs">No clinical diagnoses recorded.</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Lab Results Management */}
                        <Card className="border-border/50 shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4 border-b">
                                <CardTitle className="text-sm flex items-center justify-between">
                                    <span className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-emerald-600" /> Lab Results</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {labResults.length > 0 ? (
                                    <div className="divide-y divide-border/50">
                                        {labResults.map((lab) => (
                                            <div key={lab.lab_id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors group">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm">{lab.type}</p>
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-60">{new Date(lab.test_date).toLocaleDateString()}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant={lab.emergency_visible ? "default" : "outline"}
                                                    className={cn("h-8 gap-1.5 font-black text-[10px] uppercase tracking-tighter", lab.emergency_visible ? "bg-green-600 hover:bg-green-700" : "")}
                                                    onClick={() => handleToggleVisibility('lab', lab.lab_id, lab.emergency_visible)}
                                                >
                                                    {lab.emergency_visible ? <CheckCircle2 className="h-3 w-3" /> : null}
                                                    {lab.emergency_visible ? "Added to emergency" : "Add to emergency"}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground italic text-xs">No laboratory records found.</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PatientLayout>
    )
}
