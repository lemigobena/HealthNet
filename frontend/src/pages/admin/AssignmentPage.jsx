import { useState, useEffect } from "react"
import AdminLayout from "@/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserCheck, ArrowRight, Loader2, AlertCircle, Trash2, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import api from "@/services/api"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function AssignmentPage() {
    // const { user } = useAuth()
    const [doctors, setDoctors] = useState([])
    const [patients, setPatients] = useState([])
    const [assignments, setAssignments] = useState([])
    const [selectedDoctor, setSelectedDoctor] = useState("")
    const [selectedPatient, setSelectedPatient] = useState("")
    const [notes, setNotes] = useState("")
    const [patientSearchId, setPatientSearchId] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [assignmentToDelete, setAssignmentToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchData = async () => {
        try {
            const [docsRes, assignRes] = await Promise.all([
                api.get('/admin/doctors'),
                api.get('/admin/assignments')
            ])
            setDoctors(docsRes.data.data)
            setAssignments(assignRes.data.data)
        } catch (err) {
            console.error("Assignment search error:", err)
            setError(err.response?.data?.message || "Failed to synchronize registry data")
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSearchPatient = async (idOrEvent) => {
        if (idOrEvent?.preventDefault) idOrEvent.preventDefault()
        const searchId = typeof idOrEvent === 'string' ? idOrEvent : patientSearchId
        if (!searchId) return

        setIsLoading(true)
        setError("")
        try {
            const res = await api.get(`/admin/patients/${searchId}`)
            if (res.data.data) {
                const patient = res.data.data
                setPatients([patient])
                setSelectedPatient(patient.patient_id)
                setSuccess(`Found patient: ${patient.user.name}`)
                return patient.patient_id
            }
        } catch {
            setError("Patient not found with that ID")
            setPatients([])
            setSelectedPatient("")
        } finally {
            setIsLoading(false)
        }
        return null
    }

    const handleAssignment = async () => {
        let pId = selectedPatient
        if (!pId && patientSearchId) {
            pId = await handleSearchPatient(patientSearchId)
        }

        if (!selectedDoctor || !pId) {
            if (!selectedDoctor) setError("Please select a practitioner")
            else if (!pId) setError("Please search for a valid patient ID first")
            return
        }

        setError("")
        setSuccess("")
        setIsLoading(true)

        try {
            await api.post('/admin/assignments', {
                doctor_id: selectedDoctor,
                patient_id: pId,
                notes: notes
            })
            setSuccess("Assignment created successfully!")
            setSelectedPatient("")
            setPatientSearchId("")
            setNotes("")
            fetchData() // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create assignment")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAssignment = async () => {
        if (!assignmentToDelete) return
        setIsDeleting(true)
        try {
            await api.delete(`/admin/assignments/${assignmentToDelete}`)
            setSuccess("Clinical access revoked successfully")
            setAssignmentToDelete(null)
            fetchData()
        } catch {
            setError("Failed to revoke assignment")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AdminLayout title="Clinical Registry Control" subtitle="Manage doctor-patient clinical access and care relationships">
            <div className="max-w-5xl mx-auto space-y-8">
                <Card className="border-primary/20 shadow-xl overflow-hidden">
                    <div className="h-1 bg-primary" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl font-black">
                            <UserCheck className="h-6 w-6 text-primary" />
                            Initialize Access
                        </CardTitle>
                        <CardDescription className="font-bold">
                            Grant a certified practitioner legal access to a patient record
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                        {(error || success) && (
                            <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${error ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-green-500/10 border-green-500/20 text-green-600'
                                }`}>
                                {error ? <AlertCircle className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                <span className="text-sm font-bold">{error || success}</span>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-xs uppercase tracking-widest font-black text-muted-foreground">Certified Practitioner</Label>
                                <Select value={selectedDoctor} onValueChange={setSelectedDoctor} disabled={isFetching}>
                                    <SelectTrigger className="h-14 text-lg font-bold border-2">
                                        <SelectValue placeholder={isFetching ? "Syncing..." : "Choose Practitioner"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map(doc => (
                                            <SelectItem key={doc.doctor_id} value={doc.doctor_id}>
                                                {doc.user.name} ({doc.specialization})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs uppercase tracking-widest font-black text-muted-foreground">Recipient Patient (Search by ID)</Label>
                                <div className="flex gap-2">
                                    <div className="flex-1 flex gap-2">
                                        <Input
                                            value={patientSearchId}
                                            onChange={(e) => setPatientSearchId(e.target.value)}
                                            placeholder="Enter Patient ID (e.g., PT-1234567890)"
                                            className="h-14 font-medium border-2"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => handleSearchPatient(patientSearchId)}
                                            size="icon"
                                            className="h-14 w-14 shrink-0"
                                            disabled={isLoading}
                                        >
                                            <Search className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                                {selectedPatient && patients.length > 0 && (
                                    <div className="p-3 bg-muted/20 border rounded-lg text-sm text-muted-foreground font-medium flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        Selected: <span className="text-foreground font-bold">{patients[0].user.name}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <Label className="text-xs uppercase tracking-widest font-black text-muted-foreground">Assignment Memo</Label>
                                <Input
                                    placeholder="Enter clinical context or verification details..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="h-14 border-2 font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                size="lg"
                                onClick={handleAssignment}
                                disabled={!selectedDoctor || !patientSearchId || isLoading}
                                className="w-full md:w-auto font-black uppercase tracking-widest h-14 px-10 shadow-lg shadow-primary/20"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="mr-2 h-5 w-5" />
                                        Authorize Access
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-muted">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Active Clinical Authorizations</CardTitle>
                        <CardDescription>Live view of all verified doctor-patient relationships</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isFetching ? (
                            <div className="flex justify-center p-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                            </div>
                        ) : assignments.length > 0 ? (
                            <div className="space-y-4">
                                {assignments.map((assign) => (
                                    <div key={assign.id} className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed hover:border-primary/50 transition-colors group">
                                        <div className="flex items-center gap-6">
                                            <div className="flex -space-x-4">
                                                <div className="h-12 w-12 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                    {assign.doctor.user.name.charAt(0)}
                                                </div>
                                                <div className="h-12 w-12 rounded-full border-2 border-background bg-blue-500/10 flex items-center justify-center font-bold text-blue-600">
                                                    {assign.patient.user.name.charAt(0)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground">{assign.doctor.user.name}</span>
                                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                    <span className="font-bold text-foreground">{assign.patient.user.name}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Issued: {new Date(assign.assigned_at).toLocaleDateString()}
                                                </p>
                                                {assign.notes && (
                                                    <p className="text-xs italic text-muted-foreground/70 mt-1 line-clamp-1 max-w-md">
                                                        "{assign.notes}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setAssignmentToDelete(assign.assignment_id)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
                                <AlertCircle className="h-10 w-10 mx-auto opacity-20 mb-4" />
                                <p className="font-bold">No active clinical authorizations found.</p>
                                <p className="text-sm">New assignments will appear here once authorized.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Deletion Confirmation Modal */}
                <Dialog open={!!assignmentToDelete} onOpenChange={(open) => !open && setAssignmentToDelete(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertCircle className="h-5 w-5" />
                                Revoke Clinical Access?
                            </DialogTitle>
                            <DialogDescription className="font-medium">
                                This action will immediately terminate the practitioner's authorization to access this patient's medical records. This change is permanent and will be logged in the system audit.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex sm:justify-between gap-2 border-t pt-4 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAssignmentToDelete(null)}
                                className="font-bold uppercase tracking-widest text-[10px]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteAssignment}
                                disabled={isDeleting}
                                className="font-black uppercase tracking-widest text-[10px]"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Revoking...
                                    </>
                                ) : (
                                    "Confirm Revocation"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    )
}
