import { useState, useEffect } from "react"
import AdminLayout from "@/layouts/AdminLayout"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Calendar, Fingerprint, Activity, Heart, ShieldAlert } from "lucide-react"
import api from "@/services/api"
import dayjs from "dayjs"
import { Loader2, Key, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function AdminViewPatientPage() {
    const { id } = useParams()
    const [patient, setPatient] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const response = await api.get(`/admin/patients/${id}`)
                setPatient(response.data.data)
            } catch (err) {
                console.error("Failed to fetch patient:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPatient()
    }, [id])

    const handlePasswordUpdate = async () => {
        if (!newPassword || newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters")
            return
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match")
            return
        }

        setIsUpdating(true)
        setPasswordError("")
        setPasswordSuccess("")

        try {
            await api.patch(`/admin/patients/${patient.patient_id}/password`, {
                password: newPassword
            })
            setPasswordSuccess("Password updated successfully")
            setNewPassword("")
            setConfirmPassword("")
            setTimeout(() => {
                setIsPasswordModalOpen(false)
                setPasswordSuccess("")
            }, 2000)
        } catch (err) {
            setPasswordError(err.response?.data?.message || "Failed to update password")
        } finally {
            setIsUpdating(false)
        }
    }

    if (isLoading) {
        return (
            <AdminLayout title="Patient Profile" subtitle="Accessing Registry...">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Synchronizing clinical data...</p>
                </div>
            </AdminLayout>
        )
    }

    if (!patient) {
        return (
            <AdminLayout title="Error" subtitle="Profile Not Found">
                <div className="text-center p-20">
                    <p className="text-xl font-bold">Patient Not Found</p>
                    <p className="text-muted-foreground">The requested patient record could not be located in the clinical registry.</p>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title="Patient Clinical Profile"
            subtitle={`Administrative view for ${patient.user.name}`}
        >
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Profile Header */}
                <Card className="overflow-hidden border-border/50 shadow-xl">
                    <div className="h-32 bg-gradient-to-r from-blue-500/20 via-blue-500/5 to-transparent" />
                    <CardContent className="relative px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-6">
                            <div className="h-32 w-32 rounded-3xl bg-background border-4 border-background shadow-2xl flex items-center justify-center text-blue-600 text-4xl font-black">
                                {patient.user.name?.[0]}
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h2 className="text-3xl font-black tracking-tight">{patient.user.name}</h2>
                                    <Button
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        variant="outline"
                                        size="sm"
                                        className="font-bold border-2 gap-2 h-10 px-4 rounded-xl hover:bg-primary/5 hover:text-primary transition-all"
                                    >
                                        <Key className="h-4 w-4" />
                                        Update Password
                                    </Button>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <Badge className="bg-blue-500/10 text-blue-600 border-none font-bold uppercase tracking-widest text-[10px] px-3">
                                        Verified Patient
                                    </Badge>
                                    <Badge variant="outline" className="font-bold border-2">
                                        UPI: {patient.patient_id}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6 pt-6 border-t border-border/50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                    <Fingerprint className="h-3 w-3" /> System ID
                                </p>
                                <p className="font-bold">{patient.patient_id}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                    <Activity className="h-3 w-3" /> Status
                                </p>
                                <Badge className="bg-green-500/10 text-green-600 border-none font-bold text-[10px] uppercase">
                                    {patient.status}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                    <Heart className="h-3 w-3" /> Blood Type
                                </p>
                                <p className="font-bold">{patient.blood_type || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                    <User className="h-3 w-3" /> Gender
                                </p>
                                <p className="font-bold">{patient.user.gender}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold tracking-tight">Bio-Data & Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-blue-600 shadow-sm">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Email Address</p>
                                    <p className="font-bold">{patient.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-blue-600 shadow-sm">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Phone Number</p>
                                    <p className="font-bold">{patient.user.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-blue-600 shadow-sm">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Residential Address</p>
                                    <p className="font-bold">{patient.user.address || "N/A"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold tracking-tight">Clinical Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-blue-600 shadow-sm">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Date of Birth</p>
                                    <p className="font-bold">{dayjs(patient.user.dob).format('MMMM D, YYYY')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-blue-600 shadow-sm">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Registry Entry Created</p>
                                    <p className="font-bold">{dayjs(patient.user.created_at).format('MMMM D, YYYY')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Password Update Modal */}
                <Dialog open={isPasswordModalOpen} onOpenChange={(open) => {
                    setIsPasswordModalOpen(open)
                    if (!open) {
                        setNewPassword("")
                        setConfirmPassword("")
                        setPasswordError("")
                        setPasswordSuccess("")
                    }
                }}>
                    <DialogContent className="sm:max-w-md border-2">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                                Security Credentials
                            </DialogTitle>
                            <DialogDescription className="font-bold">
                                Update the clinical access password for {patient.user.name}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {(passwordError || passwordSuccess) && (
                                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${passwordError ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-green-500/10 border-green-500/20 text-green-600'
                                    }`}>
                                    {passwordError ? <AlertCircle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                    <span className="text-sm font-bold">{passwordError || passwordSuccess}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest font-black text-muted-foreground">New Secure Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-12 border-2 rounded-xl pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest font-black text-muted-foreground">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-12 border-2 rounded-xl pr-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="font-bold uppercase tracking-widest text-[10px]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handlePasswordUpdate}
                                disabled={isUpdating || !newPassword}
                                className="font-black uppercase tracking-widest text-[10px] min-w-[140px]"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Save Credentials"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    )
}
